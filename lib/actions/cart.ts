"use server";
/**
 * RFC Store — Cart Server Actions
 *
 * All cart mutations that require server-side validation live here.
 * This file runs SERVER-SIDE ONLY — never in the browser.
 *
 * SECURITY PRINCIPLES:
 *   - Price is ALWAYS fetched from DB — never trusted from client
 *   - Variant must belong to the product — validated server-side
 *   - Inventory is checked before allowing addition
 *   - Quantity is bounded (1–10) server-side
 *
 * Phase 5: Returns CartItemData for client to dispatch into CartContext.
 * Phase 6: checkout Server Action will re-validate prices before order.
 * Phase 7: addToCartAction will also upsert into cart_items for auth users.
 */
import { createClient } from "@/lib/supabase/server";
import type { AddToCartResult, CartItemData } from "@/types/cart";
import { PRODUCT_CONFIG } from "@/lib/constants/site";

interface AddToCartParams {
  productId: string;
  variantId: string | null;
  quantity: number;
}

/**
 * Validates a product/variant and returns a CartItemData
 * with server-authoritative pricing.
 *
 * The client dispatches the returned item into CartContext.
 * This prevents price manipulation via browser devtools.
 */
export async function addToCartAction(
  params: AddToCartParams
): Promise<AddToCartResult> {
  const { productId, variantId, quantity } = params;

  // ── 1. Validate quantity ───────────────────────────────
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > PRODUCT_CONFIG.maxItemQuantity
  ) {
    return {
      success: false,
      error: `Quantity must be between 1 and ${PRODUCT_CONFIG.maxItemQuantity}.`,
    };
  }

  // ── 2. Validate IDs ────────────────────────────────────
  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product." };
  }

  const supabase = await createClient();

  // ── 3. Fetch product from DB (price source of truth) ───
  // Use explicit casting since generated types may not perfectly match
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

  // ── 4. Validate variant (if provided) ─────────────────
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
        error: "Selected variant is unavailable. Please choose another option.",
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

    // ── 5. Check inventory ─────────────────────────────
    const inv = variant.inventory;
    const available = inv ? Math.max(0, inv.quantity - inv.reserved) : 0;

    if (available <= 0) {
      return {
        success: false,
        error: "This variant is out of stock.",
      };
    }

    if (quantity > available) {
      return {
        success: false,
        error: `Only ${available} unit${available === 1 ? "" : "s"} available.`,
      };
    }

    // Use variant-level price (may differ from base price)
    unitPrice = Number(variant.price);
    variantName = variant.name;
    sku = variant.sku;
  }

  // ── 6. Get primary image ────────────────────────────────
  const images = product.product_images ?? [];
  const primaryImage =
    images.find((img) => img.is_primary) ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0] ??
    null;

  // ── 7. Build CartItemData (server-validated) ───────────
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
    unitPrice,    // ← FROM DATABASE — not from client
    quantity,
    lineTotal,
  };

  // ── Phase 7 integration point ─────────────────────────
  // TODO Phase 7: If user is authenticated, also upsert to cart_items:
  // const { data: { session } } = await supabase.auth.getSession();
  // if (session?.user) {
  //   await supabase.from('cart_items').upsert({
  //     user_id: session.user.id,
  //     product_id: productId,
  //     variant_id: variantId,
  //     quantity,
  //     unit_price: unitPrice,
  //   }, { onConflict: 'user_id,product_id,variant_id' });
  // }

  return { success: true, item };
}
