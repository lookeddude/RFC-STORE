/**
 * RFC Store — Account Domain Types (Phase 7)
 *
 * Covers: profile management, address CRUD, auth actions.
 */

// ── Profile ────────────────────────────────────────────────

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "customer" | "admin" | "super_admin";
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  fullName: string;
  phone: string;
}

export interface UpdateProfileErrors {
  fullName?: string;
  phone?: string;
}

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
  fieldErrors?: UpdateProfileErrors;
}

// ── Address ────────────────────────────────────────────────

export interface AddressRow {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AddressFormErrors {
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface AddressMutationResult {
  success: boolean;
  error?: string;
  fieldErrors?: AddressFormErrors;
  addressId?: string;
}

// ── Auth ──────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: LoginFormErrors | SignupFormErrors;
}

// ── Orders (account view) ──────────────────────────────────

export interface OrderListItem {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  item_count: number; // derived
}

export interface OrderDetailRow {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    sku_snapshot: string | null;
    unit_price_snapshot: number;
    quantity: number;
    line_total: number;
  }>;
}

// ── Order Status ──────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting Payment",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded",
};

// Timeline steps (in progression order)
export const ORDER_TIMELINE_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;
