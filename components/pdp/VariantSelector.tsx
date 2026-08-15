"use client";
/**
 * RFC Store — Variant Selector Component
 *
 * Stitch design: pill-style selectors grouped by attribute key.
 *   e.g.  SIZE: [8oz] [10oz] [12oz✗] [14oz] [16oz]
 *
 * - Groups variants by attribute keys (size, color, style, etc.)
 * - Selected: filled dark navy bg, white text
 * - Unavailable: strikethrough diagonal line, muted opacity
 * - Multi-attribute: renders one group per attribute key
 * - Calls onVariantChange with the matched variant when selection changes
 * - Shows "Select a [attribute]" prompt if no variant selected
 */
import React, { useState, useCallback, useEffect } from "react";
import type { ProductVariant } from "@/types/product";
import styles from "./VariantSelector.module.css";

interface VariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
}

type AttributeSelection = Record<string, string>;

export function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  // Derive all unique attribute keys across variants
  const attributeKeys = Array.from(
    new Set(variants.flatMap((v) => Object.keys(v.attributes)))
  );

  const [selection, setSelection] = useState<AttributeSelection>({});

  // Find variant matching all current selections
  const findMatchingVariant = useCallback(
    (sel: AttributeSelection): ProductVariant | null => {
      if (Object.keys(sel).length < attributeKeys.length) return null;
      return (
        variants.find((v) =>
          attributeKeys.every((key) => v.attributes[key] === sel[key])
        ) ?? null
      );
    },
    [variants, attributeKeys]
  );

  // Notify parent whenever selection changes
  useEffect(() => {
    onVariantChange(findMatchingVariant(selection));
  }, [selection, findMatchingVariant, onVariantChange]);

  function handleSelect(key: string, value: string) {
    setSelection((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value, // toggle off if already selected
    }));
  }

  // Get all unique values for a given attribute key
  function getValuesForKey(key: string): string[] {
    return Array.from(new Set(variants.map((v) => v.attributes[key]).filter(Boolean)));
  }

  // Is a specific attribute value available given current other selections?
  function isValueAvailable(key: string, value: string): boolean {
    const testSel = { ...selection, [key]: value };
    // Check if any variant matches these attributes AND is available
    return variants.some(
      (v) =>
        v.isAvailable &&
        attributeKeys.every((k) => !testSel[k] || v.attributes[k] === testSel[k])
    );
  }

  if (variants.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      {attributeKeys.map((key) => (
        <div key={key} className={styles.group}>
          <div className={styles.groupLabel}>
            <span className={styles.groupKey}>{key.toUpperCase()}</span>
            {selection[key] && (
              <span className={styles.groupValue}>{selection[key]}</span>
            )}
          </div>

          <div className={styles.pills} role="group" aria-label={`Select ${key}`}>
            {getValuesForKey(key).map((value) => {
              const available = isValueAvailable(key, value);
              const selected = selection[key] === value;

              return (
                <button
                  key={value}
                  type="button"
                  className={styles.pill}
                  data-selected={selected}
                  data-available={available}
                  onClick={() => handleSelect(key, value)}
                  aria-pressed={selected}
                  aria-label={`${key} ${value}${!available ? " — sold out" : ""}`}
                  disabled={!available}
                  title={!available ? "Sold Out" : undefined}
                >
                  <span className={styles.pillValue}>{value}</span>
                  {!available && (
                    <>
                      <span className={styles.strikethrough} aria-hidden="true" />
                      <span className={styles.soldOutLabel}>Sold Out</span>
                    </>
                  )}
                </button>
              );

            })}
          </div>
        </div>
      ))}
    </div>
  );
}
