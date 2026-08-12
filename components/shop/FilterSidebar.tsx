"use client";
/**
 * RFC Store — Filter Sidebar Component
 *
 * Stitch design:
 *   - Active filter chips with ×
 *   - "Filters" heading + "Clear All" button
 *   - Product Type collapsible (category checkboxes)
 *   - Price filter (min/max INR inputs)
 *   - All state in URL search params
 *
 * Server-readable: category=slug&minPrice=500&maxPrice=10000
 */
import React, { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/types/product";
import styles from "./FilterSidebar.module.css";

interface FilterSidebarProps {
  categories: Category[];
  activeCategoryId: string | null;
  activeMinPrice: number | null;
  activeMaxPrice: number | null;
}

export function FilterSidebar({
  categories,
  activeCategoryId,
  activeMinPrice,
  activeMaxPrice,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isProductTypeOpen, setIsProductTypeOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [minInput, setMinInput] = useState(activeMinPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(activeMaxPrice?.toString() ?? "");

  // Check if any filters are active
  const hasActiveFilters =
    activeCategoryId !== null ||
    activeMinPrice !== null ||
    activeMaxPrice !== null;

  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  function handleCategoryToggle(categoryId: string, categorySlug: string) {
    updateParams((params) => {
      if (activeCategoryId === categoryId) {
        params.delete("category");
      } else {
        params.set("category", categorySlug);
      }
    });
  }

  function handlePriceApply() {
    updateParams((params) => {
      const min = parseFloat(minInput);
      const max = parseFloat(maxInput);
      if (!isNaN(min) && min > 0) {
        params.set("minPrice", min.toString());
      } else {
        params.delete("minPrice");
      }
      if (!isNaN(max) && max > 0) {
        params.set("maxPrice", max.toString());
      } else {
        params.delete("maxPrice");
      }
    });
  }

  function handleClearAll() {
    router.push(pathname);
    setMinInput("");
    setMaxInput("");
  }

  function handleRemoveCategory() {
    updateParams((params) => params.delete("category"));
  }

  function handleRemovePrice() {
    setMinInput("");
    setMaxInput("");
    updateParams((params) => {
      params.delete("minPrice");
      params.delete("maxPrice");
    });
  }

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <aside className={styles.sidebar} aria-label="Product filters">
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.heading}>Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className={styles.clearAll}
            type="button"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className={styles.chips}>
          {activeCategory && (
            <button
              onClick={handleRemoveCategory}
              className={styles.chip}
              type="button"
              aria-label={`Remove ${activeCategory.name} filter`}
            >
              {activeCategory.name}
              <CloseIcon />
            </button>
          )}
          {(activeMinPrice !== null || activeMaxPrice !== null) && (
            <button
              onClick={handleRemovePrice}
              className={styles.chip}
              type="button"
              aria-label="Remove price filter"
            >
              {activeMinPrice !== null ? `₹${activeMinPrice}` : "₹0"} –{" "}
              {activeMaxPrice !== null ? `₹${activeMaxPrice}` : "Any"}
              <CloseIcon />
            </button>
          )}
        </div>
      )}

      {/* Product Type Filter */}
      <div className={styles.group}>
        <button
          className={styles.groupHeader}
          onClick={() => setIsProductTypeOpen((v) => !v)}
          aria-expanded={isProductTypeOpen}
          type="button"
        >
          <span>Product Type</span>
          <ChevronIcon open={isProductTypeOpen} />
        </button>

        {isProductTypeOpen && (
          <div className={styles.groupBody}>
            {categories.map((cat) => (
              <label key={cat.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={activeCategoryId === cat.id}
                  onChange={() => handleCategoryToggle(cat.id, cat.slug)}
                  aria-label={cat.name}
                />
                <span className={styles.checkboxText}>{cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className={styles.group}>
        <button
          className={styles.groupHeader}
          onClick={() => setIsPriceOpen((v) => !v)}
          aria-expanded={isPriceOpen}
          type="button"
        >
          <span>Price (₹)</span>
          <ChevronIcon open={isPriceOpen} />
        </button>

        {isPriceOpen && (
          <div className={styles.groupBody}>
            <div className={styles.priceInputs}>
              <input
                type="number"
                className={styles.priceInput}
                placeholder="Min"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                min={0}
                step={100}
                aria-label="Minimum price"
              />
              <span className={styles.priceSep}>–</span>
              <input
                type="number"
                className={styles.priceInput}
                placeholder="Max"
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                min={0}
                step={100}
                aria-label="Maximum price"
              />
            </div>
            <button
              type="button"
              className={styles.applyBtn}
              onClick={handlePriceApply}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 200ms ease",
        flexShrink: 0,
      }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
