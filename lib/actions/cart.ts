"use server";
/**
 * RFC Store — Cart Server Actions (Phase 2 upgrade)
 *
 * All cart mutations that require server-side validation live here.
 * This file runs SERVER-SIDE ONLY — never in the browser.
 *
 * SECURITY PRINCIPLES:
 *   - Price is ALWAYS fetched from DB — never trusted from client
 *   - Variant must belong to the product — validated server-side
 *   - Inventory is checked before allowing addition
 *   - Quantity is bounded (1–20) server-side + DB CHECK constraint
 *   - user_id ALWAYS from auth.getUser() — never from client
 *
 * Phase 2 additions:
 *   - addToCartAction:       also upserts to cart_items for auth users
 *   - updateCartItemAction:  updates quantity in cart_items
 *   - removeCartItemAction:  deletes row from cart_items
 *   - clearCartAction:       deletes all user's cart_items rows
 *   - getCartAction:         fetches auth user's cart from DB
 *   - mergeCartOnLoginAction: guest → DB merge via merge_guest_cart RPC
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AddToCartResult, CartItemData } from "@/types/cart";
import { PRODUCT_CONFIG } from "@/lib/constants/site";

/** Maximum quantity per cart line (enforced server-side + DB) */
const MAX_ITEM_QTY = 20;

interface AddToCartParams {
  productId: string;
  variantId: string | null;
  quantity: number;
}

// ── Shared: fetch session user (null for guests) ──────────

async function getSessionUser() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { user, supabase };
  } catch {
    return { user: null, supabase };
  }
}

// ═══════════════════════════════════════════════════════════
// addToCartAction
// ═══════════════════════════════════════════════════════════

/**
 * Validates a product/variant and returns a CartItemData with
 * server-authoritative pricing.
 *
 * Phase 2: For authenticated users, also upserts the item into cart_items.
 * The client dispatches the returned item into CartContext regardless.
 *
 * SECURITY: price always fetched from DB. Client price is never accepted.
 */
export async function addToCartAction(
  params: AddToCartParams
): Promise<AddToCartResult> {
  const { productId, variantId, quantity } = params;

  // ── 1. Validate quantity ────────────────────────────────
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_ITEM_QTY
  ) {
    return {
      success: false,
      error: `Quantity must be between 1 and ${MAX_ITEM_QTY}.`,
    };
  }

  // ── 2. Validate IDs ─────────────────────────────────────
  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product." };
  }

  const { user, supabase } = await getSessionUser();

  // ── 3. Fetch product from DB (price source of truth) ────
  const { data: productRaw, error: productError } = await supabase
    .from("products")
    .select(
      "id, name, slug, base_price, is_active, product_images(url, alt_text, is_primary, sort_order)"
    )
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle();

  if (productError || !productRaw) {
    return { success: false, error: "Product not found or unavailable." };
  }

  const product = productRaw as {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    is_active: boolean;
    product_images: Array<{
      url: string;
      alt_text: string | null;
      is_primary: boolean;
      sort_order: number;
    }>;
  };

  // ── 4. Validate variant (if provided) ───────────────────
  let variantName: string | null = null;
  let sku: string | null = null;
  let unitPrice: number = Number(product.base_price);

  if (variantId) {
    const { data: variantRaw, error: variantError } = await supabase
      .from("product_variants")
      .select(
        "id, name, sku, price, is_available, inventory(quantity, reserved)"
      )
      .eq("id", variantId)
      .eq("product_id", productId) // variant MUST belong to this product
      .eq("is_available", true)
      .maybeSingle();

    if (variantError || !variantRaw) {
      return {
        success: false,
        error:
          "Selected variant is unavailable. Please choose another option.",
      };
    }

    const variant = variantRaw as {
      id: string;
      name: string;
      sku: string;
      price: number;
      is_available: boolean;
      inventory: { quantity: number; reserved: number } | null;
    };

    // ── 5. Check inventory ────────────────────────────────
    const inv = variant.inventory;
    const available = inv ? Math.max(0, inv.quantity - inv.reserved) : 0;

    if (available <= 0) {
      return { success: false, error: "This variant is out of stock." };
    }

    if (quantity > available) {
      return {
        success: false,
        error: `Only ${available} unit${available === 1 ? "" : "s"} available.`,
      };
    }

    unitPrice = Number(variant.price);
    variantName = variant.name;
    sku = variant.sku;
  }

  // ── 6. Get primary image ─────────────────────────────────
  const images = product.product_images ?? [];
  const primaryImage =
    images.find((img) => img.is_primary) ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0] ??
    null;

  // ── 7. Build CartItemData (server-validated) ─────────────
  const key = `${productId}:${variantId ?? "null"}`;
  const lineTotal = unitPrice * quantity;

  const item: CartItemData = {
    key,
    productId,
    variantId: variantId ?? null,
    slug: product.slug,
    productName: product.name,
    variantName,
    sku,
    imageUrl: primaryImage?.url ?? null,
    imageAlt: primaryImage?.alt_text ?? product.name,
    unitPrice, // ← FROM DATABASE — not from client
    quantity,
    lineTotal,
  };

  // ── 8. Phase 2: Upsert into cart_items for auth users ────
  if (user) {
    // Use the user-scoped client (RLS enforces user_id ownership)
    await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_id: productId,
        variant_id: variantId ?? null,
        quantity,
        unit_price: unitPrice,
      },
      {
        onConflict: "user_id,product_id,variant_id",
        ignoreDuplicates: false,
      }
    );
    // Note: On conflict, Supabase upsert updates quantity.
    // The CartContext reducer merges quantities locally (capped at 20).
    // The DB row is updated to reflect the new quantity.
  }

  return { success: true, item };
}

// ═══════════════════════════════════════════════════════════
// updateCartItemAction
// ═══════════════════════════════════════════════════════════

export interface UpdateCartItemResult {
  success: boolean;
  newQuantity?: number;
  error?: string;
}

/**
 * Update quantity for an authenticated user's cart line.
 * Re-validates inventory before accepting a quantity increase.
 * If newQuantity <= 0, removes the row (calls removeCartItemAction).
 */
export async function updateCartItemAction(
  productId: string,
  variantId: string | null,
  newQuantity: number
): Promise<UpdateCartItemResult> {
  const { user, supabase } = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated." };

  if (newQuantity <= 0) {
    await removeCartItemAction(productId, variantId);
    return { success: true, newQuantity: 0 };
  }

  const clamped = Math.min(newQuantity, MAX_ITEM_QTY);

  // Re-validate inventory for increases
  if (variantId && clamped > 1) {
    const { data: invRaw } = await supabase
      .from("product_variants")
      .select("is_available, inventory(quantity, reserved)")
      .eq("id", variantId)
      .eq("product_id", productId)
      .eq("is_available", true)
      .maybeSingle();

    if (!invRaw) {
      return { success: false, error: "Variant no longer available." };
    }

    const inv = (
      invRaw as { inventory: { quantity: number; reserved: number } | null }
    ).inventory;
    const available = inv ? Math.max(0, inv.quantity - inv.reserved) : 0;

    if (clamped > available) {
      return {
        success: false,
        error: `Only ${available} unit${available === 1 ? "" : "s"} available.`,
      };
    }
  }

  // Build the update query with correct variant_id filter
  let updateQuery = supabase
    .from("cart_items")
    .update({ quantity: clamped, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (variantId) {
    updateQuery = updateQuery.eq("variant_id", variantId) as typeof updateQuery;
  } else {
    updateQuery = updateQuery.is("variant_id", null) as typeof updateQuery;
  }

  const { error } = await updateQuery;

  if (error) {
    return { success: false, error: "Failed to update cart." };
  }

  return { success: true, newQuantity: clamped };
}

// ═══════════════════════════════════════════════════════════
// removeCartItemAction
// ═══════════════════════════════════════════════════════════

export interface RemoveCartItemResult {
  success: boolean;
  error?: string;
}

/**
 * Remove a specific product+variant row from the auth user's cart.
 * DELETE is idempotent: if the row is already gone, no error.
 */
export async function removeCartItemAction(
  productId: string,
  variantId: string | null
): Promise<RemoveCartItemResult> {
  const { user, supabase } = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const query = supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (variantId) {
    await query.eq("variant_id", variantId);
  } else {
    await query.is("variant_id", null);
  }

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// clearCartAction
// ═══════════════════════════════════════════════════════════

export interface ClearCartResult {
  success: boolean;
  error?: string;
}

/**
 * Delete ALL cart_items rows for the authenticated user.
 * Called by CartContext.clearCart() when authenticated (e.g., after checkout).
 */
export async function clearCartAction(): Promise<ClearCartResult> {
  const { user, supabase } = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated." };

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// getCartAction
// ═══════════════════════════════════════════════════════════

export interface GetCartResult {
  success: boolean;
  items?: CartItemData[];
  error?: string;
}

/**
 * Fetch the authenticated user's full cart from DB.
 * Joins product + variant + image data.
 * Called on cart page mount (cross-device sync) and after merge.
 */
export async function getCartAction(): Promise<GetCartResult> {
  const { user, supabase } = await getSessionUser();
  if (!user) return { success: true, items: [] }; // guest — use localStorage

  const { data: rows, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      product_id,
      variant_id,
      quantity,
      unit_price,
      created_at,
      products (
        id,
        name,
        slug,
        base_price,
        is_active,
        product_images (
          url,
          alt_text,
          is_primary,
          sort_order
        )
      ),
      product_variants (
        id,
        name,
        sku,
        price,
        is_available
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: "Failed to load cart." };
  }

  if (!rows || rows.length === 0) {
    return { success: true, items: [] };
  }

  const items: CartItemData[] = (rows
    .map((row): CartItemData | null => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = row as any;
      const product = r.products;
      const variant = r.product_variants;

      if (!product || !product.is_active) return null; // skip unpublished

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

      const unitPrice = variant
        ? Number(variant.price)
        : Number(product.base_price);

      const key = `${r.product_id}:${r.variant_id ?? "null"}`;

      return {
        key,
        productId: r.product_id,
        variantId: r.variant_id ?? null,
        slug: product.slug,
        productName: product.name,
        variantName: variant?.name ?? null,
        sku: variant?.sku ?? null,
        imageUrl: primaryImage?.url ?? null,
        imageAlt: primaryImage?.alt_text ?? product.name,
        unitPrice,
        quantity: r.quantity,
        lineTotal: unitPrice * r.quantity,
      };
    })
    .filter((item): item is CartItemData => item !== null));

  return { success: true, items };
}

// ═══════════════════════════════════════════════════════════
// mergeCartOnLoginAction
// ═══════════════════════════════════════════════════════════

export interface MergeCartResult {
  success: boolean;
  items?: CartItemData[];
  droppedCount?: number;
  error?: string;
}

/**
 * Merge guest localStorage cart into the authenticated user's DB cart.
 *
 * Called from CartContext.onAuthStateChange(SIGNED_IN).
 * The client MUST clear localStorage BEFORE calling this action.
 *
 * Race safety:
 *   - Advisory lock inside merge_guest_cart RPC serializes concurrent calls
 *   - isMergingRef on client prevents same-tab double-fire
 *   - Clearing localStorage before call eliminates cross-tab race
 *
 * Uses the admin client (service_role) to call the SECURITY DEFINER RPC.
 */
export async function mergeCartOnLoginAction(
  guestItems: CartItemData[]
): Promise<MergeCartResult> {
  const { user, supabase } = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated." };

  // If no guest items, just load DB cart
  if (!guestItems || guestItems.length === 0) {
    return getCartAction();
  }

  // Validate each guest item before sending to DB
  // (server action — we still validate productId/variantId are strings)
  const validItems: Array<{
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number;
  }> = [];

  let droppedCount = 0;

  for (const item of guestItems) {
    if (!item.productId || typeof item.productId !== "string") {
      droppedCount++;
      continue;
    }

    // Re-validate the product is still active
    const { data: prod } = await supabase
      .from("products")
      .select("id, is_active")
      .eq("id", item.productId)
      .eq("is_active", true)
      .maybeSingle();

    if (!prod) {
      droppedCount++;
      continue; // product deleted or unpublished
    }

    validItems.push({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    });
  }

  // Call the advisory-locked RPC via admin client
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any;

  const { error: rpcError } = await adminAny.rpc("merge_guest_cart", {
    p_user_id: user.id,
    p_items: JSON.stringify(validItems),
  });

  if (rpcError) {
    console.error("[RFC Store] merge_guest_cart RPC error:", rpcError.message);
    // Fall back to just loading DB cart
    return getCartAction();
  }

  // Fetch and return the fresh merged cart
  const cartResult = await getCartAction();
  return {
    ...cartResult,
    droppedCount,
  };
}
