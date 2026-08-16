'use server';
/**
 * RFC Store — Razorpay Server Actions
 *
 * SERVER-ONLY. All price/payment logic is server-authoritative.
 *
 * Security guarantees:
 *   - Prices fetched from DB — client totals NEVER trusted
 *   - HMAC signature verified before any DB update
 *   - Razorpay API called to independently verify payment state
 *   - Guest ownership verified via cryptographic token
 *   - Inventory deducted only after verified payment (atomic DB function)
 *   - Email fired only when THIS call performs the pending→paid transition
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateShipping, calculateTax, calculateTotal } from '@/lib/config/shipping';
import { validateForm } from '@/lib/utils/checkout-validation';
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  createRazorpayRefund,
} from '@/lib/payment/razorpay-service';
import {
  verifyPaymentSignature,
} from '@/lib/payment/razorpay-verify';
import {
  createGuestPaymentToken,
  validateGuestPaymentToken,
} from '@/lib/payment/guest-token';
import {
  notifyPaymentConfirmed,
  notifyRefundInitiated,
} from '@/lib/notifications';

import type { CartItemData } from '@/types/cart';
import type {
  CheckoutFormData,
  CreateRazorpayOrderResult,
  VerifyRazorpayResult,
} from '@/types/order';


// ── Local types ────────────────────────────────────────────

interface ProductRow {
  id: string;
  name: string;
  base_price: number;
  is_active: boolean;
}

interface VariantWithInventory {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  is_available: boolean;
  product_id: string;
  inventory: { quantity: number; reserved: number }[];
}

// ── createRazorpayOrderAction ─────────────────────────────

/**
 * Step 1 of Razorpay payment flow.
 * Creates an internal RFC order (pending_payment) + a Razorpay order.
 * Returns data needed to open Razorpay Checkout modal.
 *
 * Inventory is NOT deducted here — only on payment confirmation.
 */
export async function createRazorpayOrderAction(
  cartItems: CartItemData[],
  formData: CheckoutFormData,
  idempotencyKey: string
): Promise<CreateRazorpayOrderResult> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return { success: false, error: 'Online payment is not currently available.' };
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'Your cart is empty.' };
  }

  if (cartItems.length > 50) {
    return { success: false, error: "Your cart contains too many items. Please reduce your order." };
  }

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return { success: false, error: "Invalid request. Please refresh the page and try again." };
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
    return { success: false, error: "Invalid request. Please refresh the page and try again." };
  }

  // Validate form
  const formErrors = validateForm(formData);
  if (Object.keys(formErrors).length > 0) {
    return { success: false, error: 'Please fix the form errors.', fieldErrors: formErrors };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  // Auth
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  // Batch fetch products
  const productIds = [...new Set(cartItems.map((i) => i.productId))];
  const variantIds = cartItems.filter((i) => i.variantId).map((i) => i.variantId!);

  const { data: productsRaw } = await admin
    .from('products')
    .select('id, name, base_price, is_active')
    .in('id', productIds)
    .eq('is_active', true);

  const { data: variantsRaw } = variantIds.length > 0
    ? await admin
        .from('product_variants')
        .select('id, name, sku, price, is_available, product_id, inventory(quantity, reserved)')
        .in('id', variantIds)
        .eq('is_available', true)
    : { data: [] };

  const productMap = new Map<string, ProductRow>(
    ((productsRaw ?? []) as unknown as ProductRow[]).map((p) => [p.id, p])
  );
  const variantMap = new Map<string, VariantWithInventory>(
    ((variantsRaw ?? []) as unknown as VariantWithInventory[]).map((v) => [v.id, v])
  );

  // Validate items and build payload
  const orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    // Validate item quantity bounds before any DB work
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    ) {
      return { success: false, error: "Invalid item quantity. Please update your cart." };
    }

    const product = productMap.get(item.productId);
    if (!product) {
      return { success: false, error: `Product "${item.productId}" is not available.` };
    }

    let unitPrice = product.base_price;
    let variantName: string | null = null;
    let sku: string | null = null;

    if (item.variantId) {
      const variant = variantMap.get(item.variantId);
      if (!variant || variant.product_id !== item.productId) {
        return { success: false, error: `Variant for "${product.name}" is not available.` };
      }
      unitPrice = variant.price;
      variantName = variant.name;
      sku = variant.sku;
      // Pre-check inventory (non-locking — actual lock happens in confirm_razorpay_payment)
      const inv = variant.inventory?.[0];
      if (!inv || (inv.quantity - inv.reserved) < item.quantity) {
        return { success: false, error: `Insufficient stock for "${product.name}${variantName ? ` — ${variantName}` : ''}".` };
      }
    }

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: item.productId,
      variantId: item.variantId ?? '',
      productName: product.name,
      variantName,
      sku,
      unitPrice,
      quantity: item.quantity,
      lineTotal,
    });
  }

  const shippingAmount = calculateShipping(subtotal);
  const taxAmount = calculateTax(subtotal);
  const discountAmount = 0; // coupon engine: future
  const codFee = 0;         // no COD fee for online payment
  const totalAmount = calculateTotal(subtotal, shippingAmount, taxAmount, discountAmount, codFee);

  const shippingAddress = {
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    line1: formData.line1.trim(),
    line2: formData.line2.trim() || null,
    city: formData.city.trim(),
    state: formData.state.trim(),
    postalCode: formData.postalCode.trim(),
    country: formData.country || 'India',
  };

  // Create internal RFC order (no inventory deduction)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcResult, error: rpcError } = await admin.rpc('create_order_pending', {
    p_user_id: userId ?? null,
    p_customer_name: formData.fullName.trim(),
    p_customer_email: formData.email.trim().toLowerCase(),
    p_customer_phone: formData.phone.trim(),
    p_shipping_address: shippingAddress,
    p_items: orderItems,
    p_subtotal: subtotal,
    p_shipping_amount: shippingAmount,
    p_tax_amount: taxAmount,
    p_total_amount: totalAmount,
    p_currency: 'INR',
    p_idempotency_key: idempotencyKey,
    p_payment_method: 'razorpay',
    p_discount_amount: discountAmount,
    p_notes: formData.notes?.trim() || null,
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

  if (rpcError) {
    console.error('[createRazorpayOrderAction] create_order_pending error:', rpcError);
    return { success: false, error: 'Failed to create order. Please try again.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpcData = rpcResult as any;
  if (!rpcData?.success) {
    return { success: false, error: 'Failed to create order.' };
  }

  const orderId: string = rpcData.order_id;
  const orderNumber: string = rpcData.order_number;

  // Create Razorpay order
  let rzpOrder;
  try {
    rzpOrder = await createRazorpayOrder({
      amount: Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt: orderNumber,
      notes: { rfc_order_id: orderId },
    });
  } catch (err) {
    console.error('[createRazorpayOrderAction] Razorpay order creation failed:', err);
    return { success: false, error: 'Payment gateway error. Please try again.' };
  }

  // Store razorpay_order_id on RFC order
  await admin
    .from('orders')
    .update({
      razorpay_order_id: rzpOrder.id,
      payment_provider: 'razorpay',
      payment_reference: rzpOrder.id,
    })
    .eq('id', orderId);

  // Guest token (for guest users only)
  let guestToken: string | undefined;
  if (!userId) {
    guestToken = await createGuestPaymentToken(orderId);
  }

  return {
    success: true,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    orderId,
    orderNumber,
    keyId,
    guestToken,
  };
}

// ── verifyRazorpayPaymentAction ───────────────────────────

/**
 * Step 2 of Razorpay payment flow.
 * Called after Razorpay Checkout handler.onSuccess.
 *
 * Verification layers:
 *   1. Caller authorization (auth session OR guest token)
 *   2. HMAC signature verification (cryptographic)
 *   3. Razorpay server-side API verification (authoritative payment state)
 *   4. Atomic DB confirmation (inventory deduction + status update)
 *   5. Email notification (only if THIS call performed the state transition)
 */
export async function verifyRazorpayPaymentAction(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  guestToken?: string
): Promise<VerifyRazorpayResult> {
  if (!orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    return { success: false, error: 'Invalid request.' };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  // ── Layer 1: Caller authorization ──────────────────────
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Authenticated: verify order belongs to this user OR order is guest (user_id IS NULL)
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, status, payment_method, razorpay_order_id, total_amount, order_number, customer_name, customer_email, customer_phone, shipping_address, subtotal, shipping_amount, cod_fee, discount_amount, tax_amount')
      .eq('id', orderId)
      .maybeSingle();

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }
    // User must own the order (user_id matches) OR be admin
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && order.user_id && order.user_id !== user.id) {
      return { success: false, error: 'Access denied.' };
    }
    // Proceed with this order
    return _doVerification(order, razorpayOrderId, razorpayPaymentId, razorpaySignature, admin);
  } else if (guestToken) {
    // Guest: validate ownership token
    const isValid = await validateGuestPaymentToken(orderId, guestToken);
    if (!isValid) {
      return { success: false, error: 'Invalid or expired token.' };
    }

    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, status, payment_method, razorpay_order_id, total_amount, order_number, customer_name, customer_email, customer_phone, shipping_address, subtotal, shipping_amount, cod_fee, discount_amount, tax_amount')
      .eq('id', orderId)
      .is('user_id', null) // guest orders have no user_id
      .maybeSingle();

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    return _doVerification(order, razorpayOrderId, razorpayPaymentId, razorpaySignature, admin);
  } else {
    return { success: false, error: 'Unauthorized.' };
  }
}

async function _doVerification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any
): Promise<VerifyRazorpayResult> {
  // ── Layer 2: HMAC signature ─────────────────────────────
  const signatureValid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );
  if (!signatureValid) {
    console.warn('[verifyRazorpay] Invalid HMAC signature for order:', order.id);
    return { success: false, error: 'Payment signature verification failed.' };
  }

  // Confirm razorpay_order_id matches what we stored (prevents substitution)
  if (order.razorpay_order_id !== razorpayOrderId) {
    console.warn('[verifyRazorpay] razorpay_order_id mismatch for order:', order.id);
    return { success: false, error: 'Payment order mismatch.' };
  }

  // ── Layer 3: Razorpay server-side API verification ─────
  let payment;
  try {
    payment = await fetchRazorpayPayment(razorpayPaymentId);
  } catch (err) {
    console.error('[verifyRazorpay] Razorpay API fetch failed:', err);
    return { success: false, error: 'Failed to verify payment with Razorpay.' };
  }

  // Verify all payment details against our stored order values
  const expectedAmountPaise = Math.round(Number(order.total_amount) * 100);

  if (payment.order_id !== razorpayOrderId) {
    console.warn('[verifyRazorpay] payment.order_id mismatch:', payment.order_id, razorpayOrderId);
    return { success: false, error: 'Payment verification failed: order mismatch.' };
  }
  if (payment.amount !== expectedAmountPaise) {
    console.warn('[verifyRazorpay] payment.amount mismatch:', payment.amount, expectedAmountPaise);
    return { success: false, error: 'Payment verification failed: amount mismatch.' };
  }
  if (payment.currency !== 'INR') {
    return { success: false, error: 'Payment verification failed: currency mismatch.' };
  }
  if (payment.status !== 'captured' || !payment.captured) {
    return { success: false, error: 'Payment not yet captured.' };
  }

  // ── Layer 4: Atomic DB confirmation ────────────────────
  const { data: confirmResult, error: confirmError } = await admin.rpc('confirm_razorpay_payment', {
    p_order_id: order.id,
    p_razorpay_payment_id: razorpayPaymentId,
    p_razorpay_signature: razorpaySignature,
    p_payment_amount: Number(order.total_amount),
  });

  if (confirmError) {
    console.error('[verifyRazorpay] confirm_razorpay_payment error:', confirmError);
    return { success: false, error: 'Failed to confirm payment.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = confirmResult as any;

  if (!result?.success) {
    if (result?.error === 'INSUFFICIENT_INVENTORY') {
      // Inventory unavailable after payment — initiate refund
      void _initiateOversellRefund(order.id, razorpayPaymentId, Number(order.total_amount), order.order_number, admin);
      return { success: false, error: 'Sorry, an item in your order is out of stock. A full refund will be processed automatically.' };
    }
    return { success: false, error: result?.error ?? 'Payment confirmation failed.' };
  }

  const wasAlreadyPaid: boolean = result.was_already_paid ?? false;
  const orderNumber: string = result.order_number;

  // ── Layer 5: Email notification (after commit, idempotent) ─
  // Only fire if THIS call performed the pending→paid transition
  if (!wasAlreadyPaid) {
    void notifyPaymentConfirmed({
      orderNumber,
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      totalAmount: Number(order.total_amount),
      currency: 'INR',
      razorpayPaymentId,
    });
  }

  return { success: true, orderNumber };
}

// ── retryRazorpayOrderAction ──────────────────────────────

/**
 * Retry a failed Razorpay payment for an existing RFC order.
 * Creates a NEW Razorpay order but reuses the RFC order (no duplicate business order).
 */
export async function retryRazorpayOrderAction(
  orderId: string,
  guestToken?: string
): Promise<CreateRazorpayOrderResult> {
  if (!orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    return { success: false, error: 'Invalid request.' };
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return { success: false, error: 'Online payment is not currently available.' };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Authorization
  if (user) {
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, status, payment_method, total_amount, order_number, customer_name, customer_email, customer_phone')
      .eq('id', orderId)
      .maybeSingle();

    if (!order || (order.user_id && order.user_id !== user.id)) {
      return { success: false, error: 'Order not found.' };
    }
    return _doRetry(order, user.id, admin, keyId);
  } else if (guestToken) {
    const isValid = await validateGuestPaymentToken(orderId, guestToken);
    if (!isValid) {
      return { success: false, error: 'Invalid or expired token.' };
    }
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, status, payment_method, total_amount, order_number, customer_name, customer_email, customer_phone')
      .eq('id', orderId)
      .is('user_id', null)
      .maybeSingle();
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }
    return _doRetry(order, null, admin, keyId);
  } else {
    return { success: false, error: 'Unauthorized.' };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _doRetry(order: any, userId: string | null, admin: any, keyId: string): Promise<CreateRazorpayOrderResult> {
  if (order.payment_method !== 'razorpay') {
    return { success: false, error: 'Cannot retry non-Razorpay order.' };
  }
  if (!['pending_payment', 'pending'].includes(order.status) || order.status === 'pending') {
    // Only retry if still awaiting payment
    if (order.status !== 'pending_payment') {
      return { success: false, error: 'Order cannot be retried in its current state.' };
    }
  }

  // Reset order status for retry
  await admin
    .from('orders')
    .update({ status: 'pending_payment', payment_status: 'pending', razorpay_order_id: null, razorpay_payment_id: null })
    .eq('id', order.id);

  // Create new Razorpay order
  let rzpOrder;
  try {
    rzpOrder = await createRazorpayOrder({
      amount: Math.round(Number(order.total_amount) * 100),
      currency: 'INR',
      receipt: `${order.order_number}-retry-${Date.now()}`,
      notes: { rfc_order_id: order.id },
    });
  } catch (err) {
    console.error('[retryRazorpayOrderAction] Razorpay order creation failed:', err);
    return { success: false, error: 'Payment gateway error. Please try again.' };
  }

  await admin
    .from('orders')
    .update({ razorpay_order_id: rzpOrder.id, payment_reference: rzpOrder.id })
    .eq('id', order.id);

  let guestToken: string | undefined;
  if (!userId) {
    guestToken = await createGuestPaymentToken(order.id);
  }

  return {
    success: true,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    orderId: order.id,
    orderNumber: order.order_number,
    keyId,
    guestToken,
  };
}

// ── Internal: Oversell Refund ─────────────────────────────

/**
 * Initiates a refund when payment is captured but inventory is unavailable.
 * Called non-blocking (void) — must not throw to caller.
 */
async function _initiateOversellRefund(
  orderId: string,
  razorpayPaymentId: string,
  amount: number,
  orderNumber: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any
): Promise<void> {
  try {
    // Create refund record (idempotent via UNIQUE constraint)
    const { error: insertError } = await admin.from('refunds').insert({
      order_id: orderId,
      razorpay_payment_id: razorpayPaymentId,
      amount,
      reason: 'inventory_unavailable',
      status: 'pending',
    });

    if (insertError?.code === '23505') {
      // Unique violation — refund already initiated
      console.info('[Refund] Already initiated for payment:', razorpayPaymentId);
      return;
    }

    // Call Razorpay refund API
    const refund = await createRazorpayRefund(razorpayPaymentId, {
      amount: Math.round(amount * 100), // paise
      receipt: `${orderNumber}-oversell`,
    });

    // Update refund record
    await admin.from('refunds').update({
      status: 'initiated',
      razorpay_refund_id: refund.id,
      initiated_at: new Date().toISOString(),
      attempt_count: 1,
    }).eq('razorpay_payment_id', razorpayPaymentId).eq('reason', 'inventory_unavailable');

    // Update order status
    await admin.from('orders').update({
      status: 'refund_pending',
      payment_status: 'refund_pending',
    }).eq('id', orderId);

    // Notify customer
    void notifyRefundInitiated({
      orderNumber,
      orderId,
      razorpayPaymentId,
      amount,
    });
  } catch (err) {
    console.error('[Refund] Oversell refund failed:', err);
    // Mark as refund_failed so admin can intervene
    await admin.from('orders').update({ payment_status: 'refund_failed' }).eq('id', orderId);
    await admin.from('refunds').update({
      status: 'failed',
      error_message: String(err),
      attempt_count: 1,
    }).eq('razorpay_payment_id', razorpayPaymentId).eq('reason', 'inventory_unavailable');
  }
}
