"use client";
/**
 * RFC Store — Cart Page Client Component
 *
 * The main client shell for the /cart page.
 * Reads from CartContext (single source of truth).
 *
 * Layout:
 *   Desktop: [Cart Items (left, 2/3)] [Order Summary (right, 1/3)]
 *   Mobile:  [Cart Items] then [Order Summary] stacked
 *
 * States:
 *   isLoading → CartSkeleton (hydration from localStorage)
 *   items.length === 0 → EmptyCart
 *   items.length > 0 → full cart
 */
import React from "react";
import { useCart } from "@/context/CartContext";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { CartSkeleton } from "./CartSkeleton";
import styles from "./CartPageClient.module.css";

export function CartPageClient() {
  const { state } = useCart();

  // Show skeleton while hydrating from localStorage
  if (state.isLoading) {
    return <CartSkeleton />;
  }

  // Show empty state
  if (state.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Your Cart</h1>
        <span className={styles.count} aria-live="polite">
          {state.itemCount} {state.itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Cart Layout */}
      <div className={styles.layout}>
        {/* Left: Cart Items */}
        <div className={styles.itemsCol}>
          {/* Column headers (desktop only) */}
          <div className={styles.colHeaders} aria-hidden="true">
            <span>Product</span>
            <span />
            <span>Quantity</span>
            <span className={styles.colRight}>Price</span>
            <span />
          </div>

          {/* Item list */}
          <div
            className={styles.itemList}
            role="list"
            aria-label="Cart items"
            aria-live="polite"
            aria-atomic="false"
          >
            {state.items.map((item) => (
              <CartItem key={item.key} item={item} />
            ))}
          </div>

          {/* Error message */}
          {state.error && (
            <div className={styles.errorBanner} role="alert">
              {state.error}
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className={styles.summaryCol}>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
