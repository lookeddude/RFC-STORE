"use client";
/**
 * RFC Store — Add To Cart Bar (Client Component Orchestrator)
 *
 * This is the primary interactive shell of the PDP right panel.
 * It owns state for: selectedVariant, quantity, wishlistActive.
 *
 * Renders:
 *   - VariantSelector (if product has variants)
 *   - Availability indicator
 *   - QuantitySelector
 *   - ADD TO CART primary CTA button
 *   - Wishlist heart button
 *   - Trust signals (free shipping, secure checkout)
 *
 * Phase 5 integration point: replace handleAddToCart stub with
 *   cart context dispatch (useCart hook).
 *
 * Phase 7 integration point: replace handleWishlist stub with
 *   authenticated wishlist API call.
 *
 * Availability logic (customer-visible only):
 *   hasVariants + noVariantSelected → "SELECT A SIZE / OPTION"
 *   selectedVariant.inventoryCount <= 0 → "OUT OF STOCK"
 *   selectedVariant.inventoryCount <= 3 → "LOW STOCK — [N] LEFT"
 *   selectedVariant.inventoryCount > 3  → "IN STOCK"
 *   noVariants + basePrice → "IN STOCK" (no inventory tracking on product level)
 */
import React, { useState, useCallback } from "react";
import type { Product, ProductVariant } from "@/types/product";
import { VariantSelector } from "./VariantSelector";
import { QuantitySelector } from "./QuantitySelector";
import styles from "./AddToCartBar.module.css";

interface AddToCartBarProps {
  product: Product;
}

type AvailabilityState =
  | "select-variant"
  | "in-stock"
  | "low-stock"
  | "out-of-stock";

export function AddToCartBar({ product }: AddToCartBarProps) {
  const { variants } = product;
  const hasVariants = variants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlistActive, setWishlistActive] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Determine availability
  const availability: AvailabilityState = (() => {
    if (hasVariants && !selectedVariant) return "select-variant";
    const inv = selectedVariant?.inventoryCount ?? Infinity;
    if (inv <= 0) return "out-of-stock";
    if (inv <= 3) return "low-stock";
    return "in-stock";
  })();

  const maxQty = selectedVariant
    ? Math.min(selectedVariant.inventoryCount, 10)
    : 10;

  const canAddToCart =
    availability === "in-stock" || availability === "low-stock";

  // ── Phase 5 integration point ─────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!canAddToCart) return;

    // TODO Phase 5: dispatch to cart context
    // cartDispatch({ type: 'ADD_ITEM', payload: {
    //   productId: product.id,
    //   variantId: selectedVariant?.id ?? null,
    //   quantity,
    // }});

    // Temporary UI feedback
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);

    console.log("[AddToCart] Phase 5 stub:", {
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant?.id ?? null,
      sku: selectedVariant?.sku ?? null,
      quantity,
      price: selectedVariant?.price ?? product.basePrice,
    });
  }, [canAddToCart, product, selectedVariant, quantity]);

  // ── Phase 7 integration point ─────────────────────────────
  const handleWishlist = useCallback(() => {
    setWishlistActive((v) => !v);
    // TODO Phase 7: persist to wishlist_items table via API route
    // if (!session) → prompt login
    // else → toggle wishlist_items record
  }, []);

  return (
    <div className={styles.bar}>
      {/* Variant Selector */}
      {hasVariants && (
        <div className={styles.section}>
          <VariantSelector
            variants={variants}
            onVariantChange={setSelectedVariant}
          />
        </div>
      )}

      {/* Availability Indicator */}
      <div className={styles.section}>
        <AvailabilityBadge state={availability} count={selectedVariant?.inventoryCount} />
      </div>

      {/* Quantity + CTA row */}
      <div className={styles.ctaRow}>
        <QuantitySelector
          quantity={quantity}
          onQuantityChange={setQuantity}
          maxQuantity={maxQty}
          disabled={!canAddToCart}
        />

        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          data-feedback={addedFeedback}
          aria-label={
            !canAddToCart
              ? availability === "select-variant"
                ? "Select a size first"
                : "Out of stock"
              : addedFeedback
              ? "Added to cart"
              : "Add to cart"
          }
        >
          {addedFeedback ? "✓ ADDED" : availability === "out-of-stock" ? "OUT OF STOCK" : "ADD TO CART"}
        </button>

        {/* Wishlist heart */}
        <button
          type="button"
          className={styles.wishlistBtn}
          onClick={handleWishlist}
          aria-pressed={wishlistActive}
          aria-label={wishlistActive ? "Remove from wishlist" : "Add to wishlist"}
          title={wishlistActive ? "Remove from wishlist" : "Save to wishlist"}
        >
          <HeartIcon filled={wishlistActive} />
        </button>
      </div>

      {/* Trust Signals */}
      <div className={styles.trust}>
        <div className={styles.trustItem}>
          <ShieldIcon />
          <span>Secure Checkout</span>
        </div>
        <div className={styles.trustItem}>
          <TruckIcon />
          <span>Free shipping on orders above ₹5,000</span>
        </div>
        <div className={styles.trustItem}>
          <ReturnIcon />
          <span>Easy 7-day returns</span>
        </div>
      </div>
    </div>
  );
}

// ── Availability Badge ─────────────────────────────────────

function AvailabilityBadge({
  state,
  count,
}: {
  state: AvailabilityState;
  count?: number;
}) {
  if (state === "select-variant") {
    return (
      <p className={styles.availNote}>
        Select a size to check availability
      </p>
    );
  }

  const config = {
    "in-stock": { label: "In Stock", className: styles.inStock },
    "low-stock": { label: `Low Stock — only ${count} left`, className: styles.lowStock },
    "out-of-stock": { label: "Out of Stock", className: styles.outOfStock },
  }[state];

  return (
    <div className={styles.availability} role="status" aria-live="polite">
      <span className={config.className}>{config.label}</span>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4" />
    </svg>
  );
}
