/**
 * RFC Store — Admin TypeScript Types (Phase 8)
 *
 * All types are server-only (never trust client-provided role).
 * The source of truth is always profiles.role from the DB.
 */

export type AdminRole = "admin" | "super_admin";

// ── Dashboard ─────────────────────────────────────────────

export interface AdminDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
}

export interface RecentOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  item_count?: number;
}

// ── Products ──────────────────────────────────────────────

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  category_id: string | null;
  category_name?: string;
  created_at: string;
  updated_at: string;
  variant_count?: number;
  primary_image_url?: string | null;
}

export interface AdminProductDetail extends AdminProductRow {
  description: string | null;
  short_description: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  variants: AdminVariantRow[];
  images: AdminProductImageRow[];
}

export interface AdminVariantRow {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  attributes: Record<string, string>;
  is_available: boolean;
  inventory?: AdminInventoryRow;
}

export interface AdminProductImageRow {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

// ── Product Form ──────────────────────────────────────────

export interface ProductFormData {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  basePrice: string;
  compareAtPrice: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  tags: string;
  metaTitle: string;
  metaDescription: string;
}

export interface VariantFormData {
  id?: string;          // existing variant ID (edit mode)
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  attributes: string;   // JSON string of { key: value }
  isAvailable: boolean;
  stockQuantity: string;
}

export interface ProductFormErrors {
  name?: string;
  slug?: string;
  basePrice?: string;
  compareAtPrice?: string;
  description?: string;
  [key: string]: string | undefined;
}

// ── Categories ────────────────────────────────────────────

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  product_count?: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
}

export interface CategoryFormErrors {
  name?: string;
  slug?: string;
  [key: string]: string | undefined;
}

// ── Inventory ─────────────────────────────────────────────

export interface AdminInventoryRow {
  id: string;
  variant_id: string;
  quantity: number;
  reserved: number;
  low_threshold: number;
  updated_at: string;
  // Joined
  product_name?: string;
  variant_name?: string;
  sku?: string;
  is_available?: boolean;
}

// ── Orders ────────────────────────────────────────────────

export const ADMIN_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

export const ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
  refunded:   [],
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending:  "Pending",
  paid:     "Paid",
  failed:   "Failed",
  refunded: "Refunded",
};

export interface AdminOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  item_count?: number;
}

// ── Customers ─────────────────────────────────────────────

export interface AdminCustomerRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

// ── Store Settings ────────────────────────────────────────

export interface StoreSetting {
  key: string;
  value: string | null;
  label: string | null;
  updated_at: string;
}

// ── Server Action Results ─────────────────────────────────

export interface AdminActionResult {
  success: boolean;
  error?: string;
  id?: string;
}
