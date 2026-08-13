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
 *
 * Flow:
 *   1. Client calls placeOrderAction with { cartItems, formData, idempotencyKey }
 *   2. Server validates form fields
 *   3. Server re-fetches all products/variants from DB (re-validates price + stock)
 *   4. Server calculates authoritative totals
 *   5. Server calls create_order_atomic() RPC
 *   6. Returns { success, orderNumber, orderId, totalAmount } to client
 *   7. Client clears cart and redirects to /order-confirmation/[orderNumber]
 *
 * Phase 7 integration points (marked with TODO):
 *   - Razorpay payment initialization after order creation
 *   - Email notification on order creation
 *   - Auth user cart_items cleanup
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  calculateShipping,
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

// ── Indian States (for validation) ────────────────────────

const INDIAN_STATES = new Set([
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
]);

// ── Form Validation ────────────────────────────────────────

function validateForm(data: CheckoutFormData): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  // Full name
  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  // Email
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!emailRx.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  // Phone — 10-digit Indian mobile or international with +
  const phoneRx = /^(\+?\d{7,15}|[6-9]\d{9})$/;
  const cleanPhone = data.phone.replace(/[\s\-()]/g, "");
  if (!cleanPhone) {
    errors.phone = "Phone number is required.";
  } else if (!phoneRx.test(cleanPhone)) {
    errors.phone = "Please enter a valid 10-digit mobile number.";
  }

  // Address line 1
  if (!data.line1.trim()) {
    errors.line1 = "Address is required.";
  } else if (data.line1.trim().length < 5) {
    errors.line1 = "Please enter your full address.";
  }

  // City
  if (!data.city.trim()) {
    errors.city = "City is required.";
  }

  // State
  if (!data.state.trim()) {
    errors.state = "State is required.";
  } else if (data.country === "IN" && !INDIAN_STATES.has(data.state.trim())) {
    errors.state = "Please select a valid Indian state.";
  }

  // Postal code
  if (!data.postalCode.trim()) {
    errors.postalCode = "PIN code is required.";
  } else if (data.country === "IN" && !/^\d{6}$/.test(data.postalCode.trim())) {
    errors.postalCode = "Please enter a valid 6-digit PIN code.";
  }

  return errors;
}

// ── Main Server Action ─────────────────────────────────────

/**
 * placeOrderAction — The core checkout server action.
 *
 * Validates everything server-side, then calls the atomic PostgreSQL
 * function to create the order in a single transaction.
 *
 * The idempotencyKey prevents duplicate orders on double-submit.
 * Generate it on the client: crypto.randomUUID() before submitting.
 */
export async function placeOrderAction(
  cartItems: CartItemData[],
  formData: CheckoutFormData,
  idempotencyKey: string
): Promise<PlaceOrderResult> {

  // ── 1. Guard: empty cart ─────────────────────────────────
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Your cart is empty. Please add items before placing an order." };
  }

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return { success: false, error: "Invalid request. Please refresh the page and try again." };
  }

  // ── 2. Validate form fields (server-side) ────────────────
  const fieldErrors = validateForm(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the form errors below.", fieldErrors };
  }

  // ── 3. Re-validate all cart items from DB ────────────────
  // CRITICAL: We do NOT trust prices or stock from the client.
  // Re-fetch every item from the database.
  const supabase = await createClient();
  const admin = createAdminClient();

  const validatedItems: OrderItemPayload[] = [];
  let serverSubtotal = 0;

  for (const clientItem of cartItems) {
    // Fetch product
    const { data: productRaw } = await supabase
      .from("products")
      .select("id, name, slug, base_price, is_active")
      .eq("id", clientItem.productId)
      .eq("is_active", true)
      .maybeSingle();

    if (!productRaw) {
      return {
        success: false,
        error: `"${clientItem.productName}" is no longer available. Please remove it from your cart.`,
      };
    }

    const product = productRaw as {
      id: string; name: string; slug: string;
      base_price: number; is_active: boolean;
    };

    let serverPrice: number = Number(product.base_price);
    let variantName: string | null = null;
    let sku: string | null = null;

    // Validate variant (if present)
    if (clientItem.variantId) {
      const { data: variantRaw } = await supabase
        .from("product_variants")
        .select("id, name, sku, price, is_available, inventory(quantity, reserved)")
        .eq("id", clientItem.variantId)
        .eq("product_id", clientItem.productId)
        .eq("is_available", true)
        .maybeSingle();

      if (!variantRaw) {
        return {
          success: false,
          error: `A selected variant of "${product.name}" is no longer available. Please update your cart.`,
        };
      }

      const variant = variantRaw as {
        id: string; name: string; sku: string; price: number;
        is_available: boolean;
        // Supabase returns one-to-many joins as arrays.
        // inventory has a unique constraint on variant_id so it's always 0 or 1 record.
        inventory: Array<{ quantity: number; reserved: number }>;
      };

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
      sku = variant.sku;
    }

    const lineTotal = serverPrice * clientItem.quantity;
    serverSubtotal += lineTotal;

    validatedItems.push({
      productId: product.id,
      variantId: clientItem.variantId ?? null,
      productName: product.name,
      variantName,
      sku,
      unitPrice: serverPrice,
      quantity: clientItem.quantity,
      lineTotal,
    });
  }

  // ── 4. Calculate server-authoritative totals ─────────────
  const shippingAmount = calculateShipping(serverSubtotal);
  const taxAmount = calculateTax(serverSubtotal);
  const discountAmount = 0; // Phase 7: coupon engine
  const totalAmount = calculateTotal(serverSubtotal, shippingAmount, taxAmount, discountAmount);

  // ── 5. Get authenticated user (null for guest) ───────────
  let userId: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id ?? null;
  } catch {
    // Guest checkout — no session
  }

  // ── 6. Build address snapshot ────────────────────────────
  const shippingAddressSnapshot = {
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    line1: formData.line1.trim(),
    line2: formData.line2.trim() || null,
    city: formData.city.trim(),
    state: formData.state.trim(),
    postalCode: formData.postalCode.trim(),
    country: formData.country || "IN",
  };

  // ── 7. Call atomic PostgreSQL function ───────────────────
  // Uses admin client — SECURITY DEFINER function handles all
  // inventory reservation and order creation atomically.
  // Type cast required because Database type stubs don't include
  // create_order_atomic yet (will be resolved when types are regenerated).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any;
  const { data: rpcResult, error: rpcError } = await adminAny.rpc(
    "create_order_atomic",
    {
      p_user_id: userId,
      p_customer_name: formData.fullName.trim(),
      p_customer_email: formData.email.trim().toLowerCase(),
      p_customer_phone: formData.phone.trim(),
      p_shipping_address: shippingAddressSnapshot,
      p_items: validatedItems,
      p_subtotal: serverSubtotal,
      p_shipping_amount: shippingAmount,
      p_tax_amount: taxAmount,
      p_total_amount: totalAmount,
      p_currency: "INR",
      p_idempotency_key: idempotencyKey,
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

  // ── 8. Fire notification (non-blocking) ─────────────────
  // notifyOrderCreated is safe to fire-and-forget: it catches its own errors.
  // Email/SMS will activate once provider credentials are configured in .env.
  void notifyOrderCreated({
    orderNumber: result.order_number!,
    orderId: result.order_id!,
    customerName: formData.fullName.trim(),
    customerEmail: formData.email.trim().toLowerCase(),
    customerPhone: formData.phone.trim() || undefined,
    totalAmount,
    currency: "INR",
    items: validatedItems.map((i) => ({
      productName: i.productName,
      variantName: i.variantName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    shippingAddress: shippingAddressSnapshot,
  });

  // ── 9. Payment-ready state ───────────────────────────────
  // PAYMENT GATEWAY: NOT YET CONNECTED.
  // Integration point: Initialize Razorpay/Cashfree here after order creation.
  //
  // Example (Razorpay):
  //   const razorpayOrder = await razorpay.orders.create({
  //     amount: Math.round(totalAmount * 100), // paise
  //     currency: 'INR',
  //     receipt: result.order_number,
  //   });
  //   return { success: true, orderId: result.order_id, razorpayOrderId: razorpayOrder.id, ... };
  //
  // Order is created in 'pending' state until payment is confirmed.

  return {
    success: true,
    orderNumber: result.order_number,
    orderId: result.order_id,
    totalAmount,
  };
}
