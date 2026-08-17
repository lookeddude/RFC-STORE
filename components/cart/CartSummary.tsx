"use client";
/**
 * RFC Store — Cart Summary Panel
 *
 * Stitch design: right-hand summary box.
 *   Subtotal row
 *   Shipping note (threshold driven by SHIPPING_CONFIG)
 *   ─────────────────
 *   [PROCEED TO CHECKOUT] primary CTA
 *   [CONTINUE SHOPPING] ghost link
 *
 * Authored SVGs replace unicode/emoji icons (craft-floor requirement).
 */
import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants/site";
import { SHIPPING_CONFIG } from "@/lib/config/shipping";
import styles from "./CartSummary.module.css";

interface CartSummaryProps {
  hasOutOfStockItems?: boolean;
}

export function CartSummary({ hasOutOfStockItems = false }: CartSummaryProps) {
  const { state } = useCart();
  const { subtotal, itemCount } = state;

  const qualifiesForFreeShipping = subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className={styles.summary}>
      <h2 className={styles.heading}>Order Summary</h2>

      {/* Rows */}
      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.label}>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className={styles.value}>{formatPrice(subtotal)}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Shipping</span>
          <span className={styles.value} data-free={qualifiesForFreeShipping}>
            {qualifiesForFreeShipping ? "FREE" : "Calculated at checkout"}
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Tax</span>
          <span className={styles.value}>Calculated at checkout</span>
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Free shipping progress note */}
      {!qualifiesForFreeShipping && subtotal > 0 && (
        <p className={styles.shippingNote}>
          Add {formatPrice(amountToFreeShipping)} more for free shipping
        </p>
      )}
      {qualifiesForFreeShipping && (
        <p className={styles.shippingNoteSuccess}>
          <CheckIcon />
          <span>You qualify for free shipping!</span>
        </p>
      )}

      {/* Total */}
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Estimated Total</span>
        <span className={styles.totalValue}>{formatPrice(subtotal)}</span>
      </div>

      <p className={styles.taxNote}>Taxes and shipping calculated at checkout</p>

      {/* CTAs */}
      <div className={styles.actions}>
        {hasOutOfStockItems ? (
          <>
            <button
              disabled
              className={styles.checkoutBtnDisabled}
              aria-disabled="true"
              aria-describedby="oos-notice"
            >
              PROCEED TO CHECKOUT
            </button>
            <p id="oos-notice" className={styles.oosNotice}>
              <WarningIcon />
              <span>Remove sold-out items to proceed</span>
            </p>
          </>
        ) : (
          <Link
            href={ROUTES.checkout}
            className={styles.checkoutBtn}
            aria-label="Proceed to checkout"
          >
            PROCEED TO CHECKOUT
          </Link>
        )}

        <Link href={ROUTES.shop} className={styles.continueBtn}>
          <ArrowLeftIcon />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Trust badges */}
      <div className={styles.trust}>
        <div className={styles.trustBadge}>
          <ShieldIcon />
          <span>Secure Checkout</span>
        </div>
        <div className={styles.trustBadge}>
          <ReturnIcon />
          <span>7-Day Returns</span>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4" />
    </svg>
  );
}
