"use client";
/**
 * RFC Store — Quantity Selector Component
 *
 * Stitch design: – [N] + inline control.
 * - Min: 1, Max: min(10, inventoryCount if known)
 * - Accessible: aria-label on buttons, live region for value
 * - Disabled states at boundary values
 * - Calls onQuantityChange with new value
 */
import React from "react";
import styles from "./QuantitySelector.module.css";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  /** Max purchasable quantity. If undefined defaults to 10. */
  maxQuantity?: number;
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  maxQuantity = 10,
  disabled = false,
}: QuantitySelectorProps) {
  const max = Math.min(maxQuantity, 10);

  function decrement() {
    if (quantity > 1) onQuantityChange(quantity - 1);
  }

  function increment() {
    if (quantity < max) onQuantityChange(quantity + 1);
  }

  return (
    <div className={styles.wrapper} aria-label="Quantity selector">
      <button
        type="button"
        className={styles.btn}
        onClick={decrement}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
      >
        <MinusIcon />
      </button>

      <output className={styles.value} aria-live="polite" aria-label={`Quantity: ${quantity}`}>
        {quantity}
      </output>

      <button
        type="button"
        className={styles.btn}
        onClick={increment}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
