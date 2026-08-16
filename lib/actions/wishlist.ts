"use server";
/**
 * RFC Store — Wishlist Server Actions (Phase 2)
 *
 * Authentication required for all actions.
 * Unauthenticated callers receive { success: false, error: "..." }.
 *
 * CONCURRENCY SAFETY:
 *   addToWishlistAction    → INSERT ON CONFLICT DO NOTHING (idempotent)
 *   removeFromWishlistAction → DELETE (idempotent: 0 rows = not an error)
 *   These are separate explicit actions, not a single toggle, so the DB
 *   operation is always deterministic regardless of concurrency.
 *
 * SECURITY:
 *   user_id always from auth.getUser() — never from client
 *   product_id validated: product must exist and be active
 *   RLS policies enforce row ownership at the DB level
 */
import { createClient } from "@/lib/supabase/server";
import type { WishlistItem, WishlistActionResult } from "@/types/wishlist";

// ── Shared: get authenticated user ─────────────────────────

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

// ═══════════════════════════════════════════════════════════
// addToWishlistAction
// ═══════════════════════════════════════════════════════════

/**
 * Add product to authenticated user's wishlist.
 *
 * Idempotent: ON CONFLICT DO NOTHING means calling this twice
 * for the same product results in exactly one row. Safe for rapid
 * double-clicks and concurrent requests.
 */
export async function addToWishlistAction(
  productId: string
): Promise<WishlistActionResult> {
  const { user, supabase } = await requireAuth();
  if (!user) {
    return { success: false, error: "Sign in to save items to your wishlist." };
  }

  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product." };
  }

  // Validate product exists and is active
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    return { success: false, error: "Product not available." };
  }

  // Insert — ON CONFLICT DO NOTHING (idempotent)
  const { error } = await supabase
    .from("wishlist_items")
    .insert({ user_id: user.id, product_id: productId })
    .select()
    .single();

  // Conflict (duplicate) is not an error — item already wishlisted
  if (error && error.code !== "23505") {
    console.error("[RFC Store] addToWishlistAction error:", error.message);
    return { success: false, error: "Failed to add to wishlist." };
  }

  return { success: true, isWishlisted: true };
}

// ═══════════════════════════════════════════════════════════
// removeFromWishlistAction
// ═══════════════════════════════════════════════════════════

/**
 * Remove product from authenticated user's wishlist.
 *
 * Idempotent: DELETE on a non-existent row returns 0 rows, not an error.
 * Safe for rapid double-clicks and concurrent calls.
 * RLS ensures user can only delete their own rows.
 */
export async function removeFromWishlistAction(
  productId: string
): Promise<WishlistActionResult> {
  const { user, supabase } = await requireAuth();
  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product." };
  }

  await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", user.id)     // Explicit + RLS enforced
    .eq("product_id", productId);

  return { success: true, isWishlisted: false };
}

// ═══════════════════════════════════════════════════════════
// getWishlistAction
// ═══════════════════════════════════════════════════════════

export interface GetWishlistResult {
  success: boolean;
  items?: WishlistItem[];
  error?: string;
}

/**
 * Fetch the authenticated user's full wishlist with product data.
 * A single JOIN query — no N+1.
 * Returns unavailable products too (shown with a badge on the wishlist page).
 */
export async function getWishlistAction(): Promise<GetWishlistResult> {
  const { user, supabase } = await requireAuth();
  if (!user) return { success: true, items: [] }; // not logged in

  const { data: rows, error } = await supabase
    .from("wishlist_items")
    .select(
      `
      id,
      product_id,
      created_at,
      products (
        id,
        name,
        slug,
        base_price,
        compare_at_price,
        is_active,
        product_images (
          url,
          alt_text,
          is_primary,
          sort_order
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "Failed to load wishlist." };
  }

  if (!rows || rows.length === 0) {
    return { success: true, items: [] };
  }

  const items: WishlistItem[] = (rows.map((row): WishlistItem | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = row as any;
    const product = r.products;

    if (!product) {
      // Orphaned row (product deleted but cascade didn't fire yet)
      return null;
    }

    const images: Array<{
      url: string;
      alt_text: string | null;
      is_primary: boolean;
      sort_order: number;
    }> = Array.isArray(product.product_images) ? product.product_images : [];

    const primaryImage =
      images.find((img) => img.is_primary) ??
      [...images].sort((a, b) => a.sort_order - b.sort_order)[0] ??
      null;

    return {
      id: r.id,
      productId: r.product_id,
      slug: product.slug,
      productName: product.name,
      imageUrl: primaryImage?.url ?? null,
      imageAlt: primaryImage?.alt_text ?? product.name,
      price: Number(product.base_price),
      compareAtPrice: product.compare_at_price
        ? Number(product.compare_at_price)
        : null,
      isAvailable: product.is_active === true,
      addedAt: r.created_at,
    };
  }).filter((item): item is WishlistItem => item !== null));

  return { success: true, items };
}
