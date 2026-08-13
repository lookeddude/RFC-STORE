/**
 * RFC Store — Order Domain Types
 *
 * Single source of truth for checkout and order data.
 * Used by: CheckoutForm, placeOrderAction, order confirmation page.
 */

// ── Order Status ───────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
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
