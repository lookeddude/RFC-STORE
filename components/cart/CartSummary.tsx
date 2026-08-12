"use client";
/**
 * RFC Store — Cart Summary Panel
 *
 * Stitch design: right-hand summary box.
 *   Subtotal row
 *   Shipping note (free above ₹5,000)
 *   ─────────────────
 *   [PROCEED TO CHECKOUT] primary CTA
 *   [CONTINUE SHOPPING] ghost link
 *
 * Phase 5: Shows subtotal. Shipping/tax calculated in Phase 6.
 * Phase 6 integration point: replace ROUTES.checkout with real checkout flow.
 */
import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants/site";
import styles from "./CartSummary.module.css";

const FREE_SHIPPING_THRESHOLD = 5000;

export function CartSummary() {
  const { state } = useCart();
  const { subtotal, itemCount } = state;

  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

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
          ✓ You qualify for free shipping!
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
        {/* Phase 6 integration point: replace with real checkout route */}
        <Link
          href={ROUTES.checkout}
          className={styles.checkoutBtn}
          aria-label="Proceed to checkout"
        >
          PROCEED TO CHECKOUT
        </Link>

        <Link href={ROUTES.shop} className={styles.continueBtn}>
          ← Continue Shopping
        </Link>
      </div>

      {/* Trust badges */}
      <div className={styles.trust}>
        <span>🔒 Secure Checkout</span>
        <span>↩️ 7-Day Returns</span>
      </div>
    </div>
  );
}
