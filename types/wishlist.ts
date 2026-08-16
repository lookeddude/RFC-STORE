/**
 * RFC Store — Wishlist Domain Types
 *
 * Wishlist is product-level (not variant-level).
 * Authenticated users only — no guest wishlist.
 *
 * Used by: WishlistContext, AddToCartBar, WishlistPage,
 *          lib/actions/wishlist.ts
 */

// ── Wishlist Item (client shape with product data) ────────

export interface WishlistItem {
  /** Row ID from wishlist_items table */
  id: string;
  productId: string;
  /** Stable URL slug for product link */
  slug: string;
  productName: string;
  /** Primary image */
  imageUrl: string | null;
  imageAlt: string | null;
  /** Current price fetched from DB at render time */
  price: number;
  compareAtPrice: number | null;
  /** Whether the product is currently active */
  isAvailable: boolean;
  addedAt: string;
}

// ── Wishlist State ────────────────────────────────────────

export interface WishlistState {
  /** Full item data (for wishlist page) */
  items: WishlistItem[];
  /** Set of product IDs for O(1) isWishlisted() checks */
  productIds: Set<string>;
  isLoading: boolean;
  error: string | null;
}

// ── Wishlist Context Value ────────────────────────────────

export interface WishlistContextValue {
  state: WishlistState;
  /** O(1) check — use on PDP / product cards */
  isWishlisted: (productId: string) => boolean;
  /** Add product to wishlist (authenticated only) */
  addToWishlist: (productId: string) => Promise<void>;
  /** Remove product from wishlist */
  removeFromWishlist: (productId: string) => Promise<void>;
  /** Toggle wishlist state (reads current state, calls correct action) */
  toggleWishlist: (productId: string) => Promise<void>;
  /** Whether the user is authenticated (determines UI behavior) */
  isAuthenticated: boolean;
}

// ── Server Action Result ──────────────────────────────────

export interface WishlistActionResult {
  success: boolean;
  isWishlisted?: boolean;
  error?: string;
}
