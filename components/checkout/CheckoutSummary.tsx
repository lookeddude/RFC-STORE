"use client";
/**
 * RFC Store — Checkout Order Summary Panel
 *
 * Right-hand summary: shows cart items, subtotal, shipping, tax, total.
 * Reads from CartContext (same source of truth as cart page).
 *
 * Note: Displayed totals use client cart state.
 * Server-side re-validates everything independently before order creation.
 */
import React from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/format";
import { SHIPPING_CONFIG, COD_CONFIG, TAX_CONFIG } from "@/lib/config/shipping";
import styles from "./CheckoutSummary.module.css";

export function CheckoutSummary({ paymentMethod = 'cod' }: { paymentMethod?: 'cod' | 'razorpay' }) {
  const { state } = useCart();
  const { items, subtotal, isLoading } = state;

  const shipping = subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CONFIG.STANDARD_RATE;
  const codFee = COD_CONFIG.ENABLED && paymentMethod === 'cod' ? COD_CONFIG.FEE : 0;
  const tax = Math.round(subtotal * TAX_CONFIG.RATE * 100) / 100;
  const total = subtotal + shipping + codFee + tax;

  // Show skeleton during localStorage hydration to avoid ₹0 flash
  if (isLoading) {
    return (
      <div className={styles.panel}>
        <div className={styles.skeletonTitle} />
        {[0, 1].map((i) => (
          <div key={i} className={styles.skeletonItem} />
        ))}
        <div className={styles.divider} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonTotal} />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.heading}>Order Summary</h2>

      {/* Item list */}
      <ul className={styles.itemList} aria-label="Items in your order">
        {items.map((item) => (
          <li key={item.key} className={styles.item}>
            <div className={styles.imageWrap}>
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt ?? item.productName}
                  fill
                  sizes="60px"
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder} aria-hidden="true">RFC</div>
              )}
              <span className={styles.badge} aria-label={`Quantity: ${item.quantity}`}>
                {item.quantity}
              </span>
            </div>
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{item.productName}</div>
              {item.variantName && (
                <div className={styles.itemVariant}>{item.variantName}</div>
              )}
            </div>
            <div className={styles.itemTotal}>{formatPrice(item.lineTotal)}</div>
          </li>
        ))}
      </ul>

      <div className={styles.divider} />

      {/* Totals */}
      <div className={styles.totals}>
        <div className={styles.row}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span>Shipping</span>
          <span data-free={shipping === 0}>
            {shipping === 0 ? "FREE" : formatPrice(shipping)}
          </span>
        </div>
        {codFee > 0 && (
          <div className={styles.row}>
            <span>COD Handling Fee</span>
            <span>{formatPrice(codFee)}</span>
          </div>
        )}
        {TAX_CONFIG.RATE > 0 && (
          <div className={styles.row}>
            <span>{TAX_CONFIG.LABEL}</span>
            <span>{formatPrice(tax)}</span>
          </div>
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formatPrice(total)}</span>
      </div>

      <p className={styles.priceNote}>
        Prices shown in Indian Rupees (INR).
        Final amounts confirmed server-side at checkout.
      </p>

      {/* Trust signals */}
      <div className={styles.trust}>
        <div className={styles.trustItem}>
          <ShieldIcon />
          <span>Secure SSL</span>
        </div>
        <div className={styles.trustItem}>
          <ReturnIcon />
          <span>7-Day Returns</span>
        </div>
        <div className={styles.trustItem}>
          <TruckIcon />
          <span>
            {shipping === 0 ? "Free Shipping" : `₹${SHIPPING_CONFIG.STANDARD_RATE} Shipping`}
          </span>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
