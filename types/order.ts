/**
 * RFC Store — Order Domain Types
 *
 * Single source of truth for checkout and order data.
 * Used by: CheckoutForm, placeOrderAction, order confirmation page.
 */

// ── Order Status ───────────────────────────────────────────

export type OrderStatus =
  | "pending_payment"   // Razorpay order created, awaiting payment
  | "pending"           // Order confirmed (COD placed / Razorpay paid)
  | "confirmed"         // Admin confirmed
  | "processing"        // Being prepared
  | "shipped"           // Dispatched
  | "delivered"         // Delivered
  | "cancelled"         // Cancelled (payment failed / admin cancelled)
  | "refund_pending"    // Payment captured but fulfillment impossible; refund in progress
  | "refunded";         // Fully refunded

export type PaymentStatus =
  | "pending"           // Awaiting payment (COD: awaiting delivery; Razorpay: awaiting capture)
  | "paid"              // Payment confirmed
  | "failed"            // Payment failed / cancelled
  | "refund_pending"    // Money captured, refund not yet confirmed
  | "refund_failed"     // Refund API failed — needs admin intervention
  | "refunded";         // Fully refunded

export type PaymentMethod = "cod" | "razorpay" | "cashfree" | "stripe" | "manual";

// ── Checkout Form Data ─────────────────────────────────────

/**
 * Raw form fields collected from the checkout form.
 * Validated both client-side and server-side.
 */
export interface CheckoutFormData {
  // Customer info
  fullName: string;
  email: string;
  phone: string;
  // Shipping address
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Optional
  notes: string;
}

/** Field-level validation errors keyed by field name */
export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormData, string>>;

// ── Address Snapshot ───────────────────────────────────────

/**
 * Immutable address stored on the order at purchase time.
 * Even if the customer later changes their address,
 * this snapshot preserves the exact address used at order time.
 */
export interface AddressSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ── Order Summary (for checkout display) ──────────────────

export interface OrderSummaryLine {
  key: string;
  productName: string;
  variantName: string | null;
  sku: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummary {
  lines: OrderSummaryLine[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  codFee: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

// ── Server Action Input/Output ─────────────────────────────

/**
 * Item payload sent to create_order_atomic RPC.
 * All values are server-validated — never from client.
 */
export interface OrderItemPayload {
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

/**
 * Result returned by placeOrderAction.
 * On success: { success: true, orderNumber, orderId, totalAmount }
 * On failure: { success: false, error, fieldErrors? }
 */
export interface PlaceOrderResult {
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  totalAmount?: number;
  paymentMethod?: string;
  codFee?: number;
  /** Human-readable error for display */
  error?: string;
  /** Field-level validation errors */
  fieldErrors?: CheckoutFormErrors;
}

/** Result from createRazorpayOrderAction — data needed to open Razorpay modal */
export interface CreateRazorpayOrderResult {
  success: boolean;
  /** Razorpay order ID (rzp_order_xxx) — pass to Razorpay Checkout */
  razorpayOrderId?: string;
  /** Amount in paise (server-calculated, authoritative) */
  amount?: number;
  currency?: string;
  /** RFC internal order ID */
  orderId?: string;
  orderNumber?: string;
  /** Razorpay Key ID (safe to expose) */
  keyId?: string;
  /** Guest-only: one-time ownership token (never logged) */
  guestToken?: string;
  error?: string;
  fieldErrors?: CheckoutFormErrors;
}

/** Result from verifyRazorpayPaymentAction */
export interface VerifyRazorpayResult {
  success: boolean;
  orderNumber?: string;
  error?: string;
}

// ── Order Record (from DB) ─────────────────────────────────

export interface OrderRecord {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: AddressSnapshot;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  codFee: number;
  totalAmount: number;
  currency: string;
  trackingNumber: string | null;
  trackingCourier: string | null;
  createdAt: string;
  items: OrderItemRecord[];
}

export interface OrderItemRecord {
  id: string;
  productNameSnapshot: string;
  variantNameSnapshot: string | null;
  skuSnapshot: string | null;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}
