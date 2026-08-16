"use server";
/**
 * RFC Store — Checkout Server Actions
 *
 * SECURITY PRINCIPLES:
 *   - ALL prices fetched from DB — client totals are NEVER trusted
 *   - Inventory validated server-side inside atomic transaction
 *   - Order creation uses SECURITY DEFINER PostgreSQL function (admin context)
 *   - Form data validated server-side before any DB operation
 *   - Idempotency key prevents duplicate orders on double-submit
 *   - No payment amount is set from client
 *   - auth.getUser() used (not getSession) — JWT validated server-side
 *
 * Phase 3 changes:
 *   - getUser() replaces getSession() (security)
 *   - Batch product+variant fetch (2 queries, not 2N)
 *   - notes + discount_amount passed to create_order_atomic()
 *   - Max-length validation on name, address, notes
 *
 * Payment Methods:
 *   - COD (Cash on Delivery): ₹99 handling fee, pay on delivery
 *   - Razorpay: Integration point ready (future phase)
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  calculateShipping,
  calculateCodFee,
  calculateTax,
  calculateTotal,
} from "@/lib/config/shipping";
import { notifyOrderCreated } from "@/lib/notifications";
import type {
  CheckoutFormData,
  CheckoutFormErrors,
  OrderItemPayload,
  PlaceOrderResult,
} from "@/types/order";
import type { CartItemData } from "@/types/cart";

import { validateForm } from '@/lib/utils/checkout-validation';




// ── Main Server Action ─────────────────────────────────────

export async function placeOrderAction(
  cartItems: CartItemData[],
  formData: CheckoutFormData,
  idempotencyKey: string,
  paymentMethod: string = "cod"
): Promise<PlaceOrderResult> {

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Your cart is empty. Please add items before placing an order." };
  }

  if (cartItems.length > 50) {
    return { success: false, error: "Your cart contains too many items. Please reduce your order." };
  }

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return { success: false, error: "Invalid request. Please refresh the page and try again." };
  }

  // Validate idempotency key is a proper UUID (prevents garbage input reaching DB)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
    return { success: false, error: "Invalid request. Please refresh the page and try again." };
  }

  const allowedPaymentMethods = ["cod"];
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return { success: false, error: "Invalid payment method. Please select Cash on Delivery." };
  }

  const fieldErrors = validateForm(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the form errors below.", fieldErrors };
  }

  // ── 4. Re-validate all cart items from DB ────────────────
  // CRITICAL: prices and stock are NEVER trusted from the client.
  // Phase 3: Batch fetch — 2 queries regardless of cart size.
  const supabase = await createClient();
  const admin = createAdminClient();

  const productIds = [...new Set(cartItems.map((i) => i.productId))];
  const variantIds = [
    ...new Set(
      cartItems.filter((i) => i.variantId).map((i) => i.variantId as string)
    ),
  ];

  // Batch fetch 1: all products in one query
  const { data: productsRaw, error: productsError } = await supabase
    .from("products")
    .select("id, name, base_price, is_active")
    .in("id", productIds)
    .eq("is_active", true);

  if (productsError) {
    console.error("[RFC Store] placeOrderAction products fetch error:", productsError.message);
    return { success: false, error: "Unable to verify products. Please try again." };
  }

  type ProductRow = { id: string; name: string; base_price: number; is_active: boolean };
  const productMap = new Map<string, ProductRow>(
    ((productsRaw ?? []) as ProductRow[]).map((p) => [p.id, p])
  );

  // Batch fetch 2: all variants + inventory in one query (only if cart has variants)
  type VariantWithInventory = {
    id: string; name: string; sku: string | null; price: number;
    is_available: boolean; product_id: string;
    inventory: Array<{ quantity: number; reserved: number }>;
  };
  const variantMap = new Map<string, VariantWithInventory>();

  if (variantIds.length > 0) {
    const { data: variantsRaw, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, name, sku, price, is_available, product_id, inventory(quantity, reserved)")
      .in("id", variantIds)
      .eq("is_available", true);

    if (variantsError) {
      console.error("[RFC Store] placeOrderAction variants fetch error:", variantsError.message);
      return { success: false, error: "Unable to verify product variants. Please try again." };
    }

    // Cast via unknown: Supabase type generator may infer `never` for the
    // compound .in() + .eq() filter chain when the generated types are incomplete.
    for (const v of ((variantsRaw ?? []) as unknown as VariantWithInventory[])) {
      variantMap.set(v.id, v);
    }
  }

  // ── 4b. Validate each item against batch results ──────────
  const validatedItems: OrderItemPayload[] = [];
  let serverSubtotal = 0;

  for (const clientItem of cartItems) {
    // Validate item quantity bounds before any DB work
    if (
      !Number.isInteger(clientItem.quantity) ||
      clientItem.quantity < 1 ||
      clientItem.quantity > 100
    ) {
      return { success: false, error: "Invalid item quantity. Please update your cart." };
    }

    const product = productMap.get(clientItem.productId);
    if (!product) {
      return {
        success: false,
        error: `"${clientItem.productName}" is no longer available. Please remove it from your cart.`,
      };
    }

    let serverPrice: number = Number(product.base_price);
    let variantName: string | null = null;
    let sku: string | null = null;

    if (clientItem.variantId) {
      const variant = variantMap.get(clientItem.variantId);
      if (!variant || variant.product_id !== clientItem.productId) {
        return {
          success: false,
          error: `A selected variant of "${product.name}" is no longer available. Please update your cart.`,
        };
      }

      // Pre-validate stock (atomic lock happens inside create_order_atomic)
      const invRecord = variant.inventory?.[0] ?? null;
      const available = invRecord ? Math.max(0, invRecord.quantity - invRecord.reserved) : 0;
      if (available < clientItem.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name} – ${variant.name}". Only ${available} left.`,
        };
      }

      serverPrice = Number(variant.price);
      variantName = variant.name;
      sku = variant.sku ?? null;
    }

    const lineTotal = serverPrice * clientItem.quantity;
    serverSubtotal += lineTotal;

    validatedItems.push({
      productId:   product.id,
      variantId:   clientItem.variantId ?? null,
      productName: product.name,
      variantName,
      sku,
      unitPrice:   serverPrice,
      quantity:    clientItem.quantity,
      lineTotal,
    });
  }

  // ── 5. Calculate server-authoritative totals ─────────────
  const shippingAmount  = calculateShipping(serverSubtotal);
  const codFee          = calculateCodFee(paymentMethod);
  const taxAmount       = calculateTax(serverSubtotal);
  const discountAmount  = 0; // Future: coupon engine
  const totalAmount     = calculateTotal(serverSubtotal, shippingAmount, taxAmount, discountAmount, codFee);

  // ── 6. Get authenticated user (null for guest) ───────────
  // getUser() re-validates the JWT with Supabase Auth server — cannot be forged.
  // Never use getSession() for security decisions (reads cookie without validation).
  let userId: string | null = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Guest checkout — no active session
  }

  // ── 7. Build immutable address snapshot ──────────────────
  const shippingAddressSnapshot = {
    fullName:   formData.fullName.trim(),
    phone:      formData.phone.trim(),
    line1:      formData.line1.trim(),
    line2:      formData.line2.trim() || null,
    city:       formData.city.trim(),
    state:      formData.state.trim(),
    postalCode: formData.postalCode.trim(),
    country:    formData.country || "IN",
  };

  // ── 8. Call atomic PostgreSQL function ───────────────────
  // create_order_atomic v3: SELECT FOR UPDATE on inventory + discount_amount + notes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any;
  const { data: rpcResult, error: rpcError } = await adminAny.rpc(
    "create_order_atomic",
    {
      p_user_id:          userId,
      p_customer_name:    formData.fullName.trim(),
      p_customer_email:   formData.email.trim().toLowerCase(),
      p_customer_phone:   formData.phone.trim(),
      p_shipping_address: shippingAddressSnapshot,
      p_items:            validatedItems,
      p_subtotal:         serverSubtotal,
      p_shipping_amount:  shippingAmount,
      p_tax_amount:       taxAmount,
      p_total_amount:     totalAmount,
      p_currency:         "INR",
      p_idempotency_key:  idempotencyKey,
      p_payment_method:   paymentMethod,
      p_cod_fee:          codFee,
      p_discount_amount:  discountAmount,
      p_notes:            formData.notes?.trim() || null,
    }
  ) as { data: unknown; error: { message: string } | null };

  if (rpcError) {
    console.error("[RFC Store] Order RPC error:", rpcError.message);
    return {
      success: false,
      error: "Order could not be created. Please try again.",
    };
  }

  const result = rpcResult as {
    success: boolean;
    order_id?: string;
    order_number?: string;
    error?: string;
    detail?: string;
    replayed?: boolean;
  };

  if (!result.success) {
    if (result.error === "INSUFFICIENT_INVENTORY") {
      return { success: false, error: result.detail ?? "Some items are out of stock." };
    }
    if (result.error === "INVENTORY_NOT_FOUND") {
      return { success: false, error: "Unable to verify inventory. Please contact support." };
    }
    return { success: false, error: "Order creation failed. Please try again." };
  }

  // ── 9. Fire notification (non-blocking) ──────────────────
  // Wrapped in void — email failure must never break order flow.
  void notifyOrderCreated({
    orderNumber:   result.order_number!,
    orderId:       result.order_id!,
    customerName:  formData.fullName.trim(),
    customerEmail: formData.email.trim().toLowerCase(),
    customerPhone: formData.phone.trim() || undefined,
    totalAmount,
    currency:      "INR",
    paymentMethod,
    codFee,
    items: validatedItems.map((i) => ({
      productName: i.productName,
      variantName: i.variantName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    shippingAddress: shippingAddressSnapshot,
  });

  return {
    success: true,
    orderNumber: result.order_number,
    orderId: result.order_id,
    totalAmount,
    paymentMethod,
    codFee,
  };
}
