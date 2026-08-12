/**
 * RFC Store — Cart Domain Types
 *
 * These types are the single source of truth for the cart.
 * Used by: CartContext, CartItem, CartSummary, AddToCartBar,
 *          Navbar count, Server Actions, Phase 6 checkout.
 *
 * Architecture:
 *   Guest  → CartItemData stored in localStorage
 *   Auth   → CartItemData synced to Supabase cart_items table
 *   Both   → consumed through CartContext (unified)
 */

// ── Cart Item ─────────────────────────────────────────────

/**
 * A single item in the cart.
 * Key = productId:variantId  (or  productId:null  if no variant)
 * This is the unique identifier for duplicate merging.
 */
export interface CartItemData {
  /** Composite key: `${productId}:${variantId ?? "null"}` */
  key: string;
  productId: string;
  variantId: string | null;
  /** Stable URL slug for the product detail link */
  slug: string;
  productName: string;
  /** e.g. "12oz" or "L" — null if product has no variants */
  variantName: string | null;
  /** Variant SKU — used for display and future order creation */
  sku: string | null;
  /** Primary product image URL */
  imageUrl: string | null;
  imageAlt: string | null;
  /**
   * Unit price snapshotted from DB at add-time.
   * Phase 6 checkout Server Action will re-validate against DB
   * before creating the order. Client price is NEVER final.
   */
  unitPrice: number;
  quantity: number;
  /** unitPrice × quantity — recomputed by reducer on every change */
  lineTotal: number;
}

// ── Cart State ────────────────────────────────────────────

export interface CartState {
  items: CartItemData[];
  /** Sum of all item quantities */
  itemCount: number;
  /** Sum of all lineTotals in INR */
  subtotal: number;
  isLoading: boolean;
  error: string | null;
}

// ── Cart Actions (Reducer) ────────────────────────────────

export type CartAction =
  | { type: "ADD_ITEM"; payload: CartItemData }
  | { type: "UPDATE_QUANTITY"; payload: { key: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { key: string } }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; payload: CartItemData[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// ── Cart Context Value ────────────────────────────────────

export interface CartContextValue {
  state: CartState;
  /** Add product to cart. Merges if same key already exists. */
  addToCart: (item: Omit<CartItemData, "key" | "lineTotal">) => void;
  /** Update quantity for a cart line. Removes if qty reaches 0. */
  updateQuantity: (key: string, quantity: number) => void;
  /** Remove a specific cart line entirely. */
  removeItem: (key: string) => void;
  /** Clear the entire cart. */
  clearCart: () => void;
}

// ── Add To Cart Input ─────────────────────────────────────

/**
 * Shape passed by AddToCartBar to the addToCart action.
 * The Server Action validates the product/variant and returns
 * the price from DB — never trusted from the client.
 */
export interface AddToCartInput {
  productId: string;
  variantId: string | null;
  quantity: number;
}

/**
 * Server Action response for add-to-cart operations.
 * On success, contains the CartItemData with server-validated price.
 */
export interface AddToCartResult {
  success: boolean;
  item?: CartItemData;
  error?: string;
}

// ── localStorage Key ─────────────────────────────────────

/** Versioned key — bump version to clear old cart shapes during upgrades */
export const CART_STORAGE_KEY = "rfc_cart_v1" as const;
