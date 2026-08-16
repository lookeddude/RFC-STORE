"use client";
/**
 * RFC Store — Cart Page Client Component
 *
 * The main client shell for the /cart page.
 * Reads from CartContext (single source of truth).
 *
 * Real-time stock validation:
 *   On mount + when cart changes, calls /api/cart/validate to check
 *   live inventory from Supabase. Out-of-stock items show a sold-out
 *   badge and the checkout button is blocked.
 *
 * Layout:
 *   Desktop: [Cart Items (left, 2/3)] [Order Summary (right, 1/3)]
 *   Mobile:  [Cart Items] then [Order Summary] stacked
 */
import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { CartSkeleton } from "./CartSkeleton";
import type { StockStatus } from "@/app/api/cart/validate/route";
import styles from "./CartPageClient.module.css";

export function CartPageClient() {
  const { state } = useCart();
  const [stockMap, setStockMap] = useState<Record<string, StockStatus>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validate stock from server whenever cart items change
  const validateStock = useCallback(async () => {
    if (state.items.length === 0) {
      setStockMap({});
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
          })),
        }),
      });

      if (!res.ok) return;
      const data = await res.json();
      const map: Record<string, StockStatus> = {};
      for (const status of data.stockStatuses as StockStatus[]) {
        map[status.key] = status;
      }
      setStockMap(map);
    } catch {
      // Network error — don't block user, keep existing map
    } finally {
      setIsValidating(false);
    }
  }, [state.items]);

  useEffect(() => {
    if (!state.isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      validateStock();
    }
  }, [state.isLoading, validateStock]);

  // Show skeleton while hydrating from localStorage
  if (state.isLoading) {
    return <CartSkeleton />;
  }

  // Show empty state
  if (state.items.length === 0) {
    return <EmptyCart />;
  }

  const hasOutOfStockItems = state.items.some(
    (item) => stockMap[item.key] && !stockMap[item.key].isAvailable
  );

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Your Cart</h1>
        <span className={styles.count} aria-live="polite">
          {state.itemCount} {state.itemCount === 1 ? "item" : "items"}
        </span>
        {isValidating && (
          <span className={styles.validatingNote} aria-live="polite">
            Checking stock...
          </span>
        )}
      </div>

      {/* Out-of-stock warning banner */}
      {hasOutOfStockItems && (
        <div className={styles.stockWarningBanner} role="alert">
          <WarningIcon />
          <span>
            Some items in your cart are no longer available. Please remove
            sold-out items before proceeding to checkout.
          </span>
        </div>
      )}

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
              <CartItem
                key={item.key}
                item={item}
                stockStatus={stockMap[item.key] ?? null}
              />
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
          <CartSummary hasOutOfStockItems={hasOutOfStockItems} />
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
