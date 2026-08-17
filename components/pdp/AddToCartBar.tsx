"use client";
/**
 * RFC Store — Add To Cart Bar (Client Component Orchestrator)
 *
 * This is the primary interactive shell of the PDP right panel.
 * It owns state for: selectedVariant, quantity, wishlistActive.
 *
 * Phase 5: Connected to CartContext via addToCartAction Server Action.
 *   1. User clicks ADD TO CART
 *   2. addToCartAction (Server Action) validates product/variant + fetches
 *      server-authoritative price from Supabase
 *   3. Returns CartItemData → dispatched into CartContext
 *   4. CartContext persists to localStorage
 *   5. Navbar count updates instantly
 *
 * Phase 7 integration point: handleWishlist → authenticated API
 *
 * Availability logic (customer-visible only):
 *   hasVariants + noVariantSelected → "SELECT A SIZE / OPTION"
 *   selectedVariant.inventoryCount <= 0 → "OUT OF STOCK"
 *   selectedVariant.inventoryCount <= 3 → "LOW STOCK — [N] LEFT"
 *   selectedVariant.inventoryCount > 3  → "IN STOCK"
 *   noVariants + basePrice → "IN STOCK" (no inventory tracking on product level)
 */
import React, { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductVariant } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { addToCartAction } from "@/lib/actions/cart";
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

  const router = useRouter();
  const { addToCart, state } = useCart();
  const { isWishlisted, toggleWishlist, isAuthenticated: wishlistAuth } = useWishlist();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Real wishlist state from WishlistContext (DB-backed for auth users)
  const wishlistActive = isWishlisted(product.id);

  // Check if this product+variant is already in cart
  const cartKey = `${product.id}:${selectedVariant?.id ?? "null"}`;
  const isInCart = !!state.items.find((i) => i.key === cartKey);


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

  // ── Phase 5: Real cart integration ─────────────────────
  const handleAddToCart = useCallback(() => {
    if (!canAddToCart || isPending) return;

    setCartError(null);

    startTransition(async () => {
      try {
        const result = await addToCartAction({
          productId: product.id,
          variantId: selectedVariant?.id ?? null,
          quantity,
        });

        if (!result.success || !result.item) {
          setCartError(result.error ?? "Could not add item to cart. Please try again.");
          return;
        }

        // Dispatch to CartContext → localStorage persistence + Navbar count update
        addToCart(result.item);

        // Success feedback
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2000);
      } catch {
        setCartError("Could not add item to cart. Please try again.");
      }
    });
  }, [canAddToCart, isPending, product, selectedVariant, quantity, addToCart]);

  // ── Phase 2: Real wishlist integration ───────────────────
  const handleWishlist = useCallback(async () => {
    if (!wishlistAuth) {
      // Unauthenticated: redirect to login with return path
      router.push(`/login?redirect=${encodeURIComponent(`/shop/${product.slug}`)}`);
      return;
    }
    await toggleWishlist(product.id);
  }, [wishlistAuth, toggleWishlist, product.id, product.slug, router]);

  return (
    <div className={styles.bar}>
      {/* Variant Selector */}
      {hasVariants && (
        <div className={styles.section}>
          <VariantSelector
            variants={variants}
            onVariantChange={(v) => {
              setSelectedVariant(v);
              setCartError(null);
            }}
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
          disabled={!canAddToCart || isPending}
        />

        <button
          type="button"
          className={styles.addBtn}
          onClick={isInCart ? () => router.push("/cart") : handleAddToCart}
          disabled={(!canAddToCart && !isInCart) || isPending}
          data-feedback={addedFeedback}
          data-in-cart={isInCart}
          aria-label={
            isInCart
              ? "Go to cart"
              : isPending
              ? "Adding to cart…"
              : !canAddToCart
              ? availability === "select-variant"
                ? "Select a size first"
                : "Out of stock"
              : addedFeedback
              ? "Added to cart"
              : "Add to cart"
          }
          aria-busy={isPending}
        >
          {isInCart
            ? <><span>GO TO CART</span><ArrowIcon /></>
            : isPending
            ? "ADDING…"
            : addedFeedback
            ? <><CheckIcon /> ADDED TO CART</>
            : availability === "out-of-stock"
            ? "OUT OF STOCK"
            : "ADD TO CART"}
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

      {/* Server Action error message */}
      {cartError && (
        <p className={styles.cartError} role="alert" aria-live="assertive">
          {cartError}
        </p>
      )}

      {/* Trust Signals */}
      <div className={styles.trust}>
        <div className={styles.trustItem}>
          <ShieldIcon />
          <span>Secure Checkout</span>
        </div>
        <div className={styles.trustItem}>
          <TruckIcon />
          <span>Free shipping on orders above ₹999</span>
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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

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
