/**
 * RFC Store — Cart Stock Validation API
 *
 * POST /api/cart/validate
 * Body: { items: Array<{ productId, variantId }> }
 *
 * Returns real-time stock availability for all cart items.
 * Called by CartPageClient on mount and after cart changes.
 * Public endpoint — no auth required (reads public inventory data).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface StockStatus {
  key: string; // productId:variantId|null
  productId: string;
  variantId: string | null;
  isAvailable: boolean;
  availableQty: number; // how many actually in stock
  reason: string | null; // "Out of stock" | "Only N left" | null
}

interface CartValidateBody {
  items: Array<{
    productId: string;
    variantId: string | null;
  }>;
}

export async function POST(request: NextRequest) {
  let body: CartValidateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { items } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ stockStatuses: [] });
  }

  const supabase = await createClient();
  const results: StockStatus[] = [];

  await Promise.all(
    items.map(async ({ productId, variantId }) => {
      const key = `${productId}:${variantId ?? "null"}`;

      try {
        if (variantId) {
          // ── Variant product: check is_available + inventory ──
          type VariantRow = {
            is_available: boolean;
            inventory: { quantity: number; reserved: number } | null;
          };
          const { data: variant } = await supabase
            .from("product_variants")
            .select("is_available, inventory(quantity, reserved)")
            .eq("id", variantId)
            .eq("product_id", productId)
            .maybeSingle() as unknown as { data: VariantRow | null };

          if (!variant || !variant.is_available) {
            results.push({
              key,
              productId,
              variantId,
              isAvailable: false,
              availableQty: 0,
              reason: "Item sold out",
            });
            return;
          }

          const inv = variant.inventory;
          const availableQty = inv ? Math.max(0, inv.quantity - inv.reserved) : 0;

          results.push({
            key,
            productId,
            variantId,
            isAvailable: availableQty > 0,
            availableQty,
            reason:
              availableQty === 0
                ? "Item sold out"
                : availableQty <= 3
                ? `Only ${availableQty} left`
                : null,
          });
        } else {
          // ── No-variant product: check is_active only ──
          const { data: product } = await supabase
            .from("products")
            .select("is_active")
            .eq("id", productId)
            .maybeSingle();

          const isAvailable = product?.is_active === true;
          results.push({
            key,
            productId,
            variantId: null,
            isAvailable,
            availableQty: isAvailable ? 999 : 0,
            reason: isAvailable ? null : "Item sold out",
          });
        }
      } catch {
        // On error — don't block the user, assume available
        results.push({
          key,
          productId,
          variantId,
          isAvailable: true,
          availableQty: 999,
          reason: null,
        });
      }
    })
  );

  return NextResponse.json({ stockStatuses: results });
}
