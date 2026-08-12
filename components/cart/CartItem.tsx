"use client";
/**
 * RFC Store — Cart Item Row Component
 *
 * Stitch design: horizontal row with:
 *   [Product Image] | [Name + Variant + SKU] | [Qty Control] | [Line Total] | [Remove]
 *
 * Accessible quantity controls with aria-live for screen readers.
 * Mobile: stacks image + info, preserves controls.
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/format";
import type { CartItemData } from "@/types/cart";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className={styles.row} role="listitem">
      {/* Product Image */}
      <Link href={`/shop/${item.slug}`} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
        <div className={styles.imageWrap}>
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.imageAlt ?? item.productName}
              fill
              sizes="96px"
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true">
              <span>RFC</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className={styles.info}>
        <Link href={`/shop/${item.slug}`} className={styles.productName}>
          {item.productName}
        </Link>
        {item.variantName && (
          <div className={styles.variant}>
            {item.variantName}
            {item.sku && <span className={styles.sku}> · {item.sku}</span>}
          </div>
        )}
        <div className={styles.unitPrice} aria-label={`Unit price: ${formatPrice(item.unitPrice)}`}>
          {formatPrice(item.unitPrice)}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className={styles.qtyCell}>
        <div className={styles.qtyControl} role="group" aria-label={`Quantity for ${item.productName}`}>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={() => updateQuantity(item.key, item.quantity - 1)}
            aria-label="Decrease quantity"
            disabled={item.quantity <= 1}
          >
            <MinusIcon />
          </button>
          <output
            className={styles.qtyValue}
            aria-live="polite"
            aria-label={`Quantity: ${item.quantity}`}
          >
            {item.quantity}
          </output>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={() => updateQuantity(item.key, item.quantity + 1)}
            aria-label="Increase quantity"
            disabled={item.quantity >= 10}
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className={styles.lineTotal} aria-label={`Item total: ${formatPrice(item.lineTotal)}`}>
        {formatPrice(item.lineTotal)}
      </div>

      {/* Remove */}
      <button
        type="button"
        className={styles.removeBtn}
        onClick={() => removeItem(item.key)}
        aria-label={`Remove ${item.productName} from cart`}
        title="Remove item"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
