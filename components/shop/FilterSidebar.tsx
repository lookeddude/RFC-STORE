"use client";
/**
 * RFC Store — Filter Sidebar Component
 *
 * Stitch design:
 *   - Active filter chips with x
 *   - "Filters" heading + "Clear All" button
 *   - In Stock toggle
 *   - Product Type collapsible (category checkboxes) — hidden when no categories passed
 *   - Tags collapsible (multi-select checkboxes)
 *   - Price filter (min/max INR inputs)
 *   - All state in URL search params
 *
 * Server-readable: category=slug&minPrice=500&maxPrice=10000&inStock=true&tags=boxing,mma
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
  availableTags: string[];
  activeTags: string[];
  activeInStock: boolean;
}

export function FilterSidebar({
  categories,
  activeCategoryId,
  activeMinPrice,
  activeMaxPrice,
  availableTags,
  activeTags,
  activeInStock,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isProductTypeOpen, setIsProductTypeOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [minInput, setMinInput] = useState(activeMinPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(activeMaxPrice?.toString() ?? "");
  // Outer panel: collapsed by default, auto-open when filters are active
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const hasActiveFilters =
    activeCategoryId !== null ||
    activeMinPrice !== null ||
    activeMaxPrice !== null ||
    activeInStock ||
    activeTags.length > 0;

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

  function handleInStockToggle() {
    updateParams((params) => {
      if (activeInStock) {
        params.delete("inStock");
      } else {
        params.set("inStock", "true");
      }
    });
  }

  function handleTagToggle(tag: string) {
    updateParams((params) => {
      const current = params.get("tags") ?? "";
      const currentTags = current
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const idx = currentTags.indexOf(tag);
      if (idx >= 0) {
        currentTags.splice(idx, 1);
      } else {
        currentTags.push(tag);
      }
      if (currentTags.length > 0) {
        params.set("tags", currentTags.join(","));
      } else {
        params.delete("tags");
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

  function handleRemoveInStock() {
    updateParams((params) => params.delete("inStock"));
  }

  function handleRemoveTag(tag: string) {
    updateParams((params) => {
      const current = params.get("tags") ?? "";
      const remaining = current
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t && t !== tag);
      if (remaining.length > 0) {
        params.set("tags", remaining.join(","));
      } else {
        params.delete("tags");
      }
    });
  }

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <aside className={styles.sidebar} aria-label="Product filters">

      {/* ── Top bar: Filters toggle + active count + Clear All ── */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.panelToggle}
          onClick={() => setIsPanelOpen((v) => !v)}
          aria-expanded={isPanelOpen}
          aria-controls="filter-panel"
        >
          <FilterIcon />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className={styles.activeCount}>
              {[
                activeCategoryId ? 1 : 0,
                activeInStock ? 1 : 0,
                activeTags.length,
                (activeMinPrice !== null || activeMaxPrice !== null) ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
          <ChevronIcon open={isPanelOpen} />
        </button>

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

      {/* Active filter chips — always visible above the panel */}
      {hasActiveFilters && (
        <div className={styles.chips} role="list" aria-label="Active filters">
          {activeCategory && (
            <button
              onClick={handleRemoveCategory}
              className={styles.chip}
              type="button"
              aria-label={`Remove ${activeCategory.name} filter`}
              role="listitem"
            >
              {activeCategory.name}
              <CloseIcon />
            </button>
          )}
          {activeInStock && (
            <button
              onClick={handleRemoveInStock}
              className={styles.chip}
              type="button"
              aria-label="Remove in stock filter"
              role="listitem"
            >
              In Stock
              <CloseIcon />
            </button>
          )}
          {activeTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleRemoveTag(tag)}
              className={styles.chip}
              type="button"
              aria-label={`Remove ${tag} tag filter`}
              role="listitem"
            >
              {tag}
              <CloseIcon />
            </button>
          ))}
          {(activeMinPrice !== null || activeMaxPrice !== null) && (
            <button
              onClick={handleRemovePrice}
              className={styles.chip}
              type="button"
              aria-label="Remove price filter"
              role="listitem"
            >
              {activeMinPrice !== null ? `₹${activeMinPrice}` : "₹0"} –{" "}
              {activeMaxPrice !== null ? `₹${activeMaxPrice}` : "Any"}
              <CloseIcon />
            </button>
          )}
        </div>
      )}

      {/* ── Collapsible Filter Panel ── */}
      <div
        id="filter-panel"
        className={`${styles.panel} ${isPanelOpen ? styles.panelOpen : ""}`}
        aria-hidden={!isPanelOpen}
      >
        <div className={styles.panelInner}>

          {/* In Stock Toggle */}
          <div className={styles.group}>
            <label className={styles.inStockLabel}>
              <input
                type="checkbox"
                className={styles.inStockCheckbox}
                checked={activeInStock}
                onChange={handleInStockToggle}
                aria-label="Show in-stock products only"
                tabIndex={isPanelOpen ? 0 : -1}
              />
              <span className={styles.inStockText}>In Stock Only</span>
            </label>
          </div>

          {/* Price — right below In Stock */}
          <div className={styles.group}>
            <button
              className={styles.groupHeader}
              onClick={() => setIsPriceOpen((v) => !v)}
              aria-expanded={isPriceOpen}
              type="button"
              tabIndex={isPanelOpen ? 0 : -1}
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
                    aria-label="Minimum price in rupees"
                    tabIndex={isPanelOpen ? 0 : -1}
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
                    aria-label="Maximum price in rupees"
                    tabIndex={isPanelOpen ? 0 : -1}
                  />
                </div>
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={handlePriceApply}
                  tabIndex={isPanelOpen ? 0 : -1}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Product Type */}
          {categories.length > 0 && (
            <div className={styles.group}>
              <button
                className={styles.groupHeader}
                onClick={() => setIsProductTypeOpen((v) => !v)}
                aria-expanded={isProductTypeOpen}
                type="button"
                tabIndex={isPanelOpen ? 0 : -1}
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
                        tabIndex={isPanelOpen ? 0 : -1}
                      />
                      <span className={styles.checkboxText}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className={styles.group}>
              <button
                className={styles.groupHeader}
                onClick={() => setIsTagsOpen((v) => !v)}
                aria-expanded={isTagsOpen}
                type="button"
                tabIndex={isPanelOpen ? 0 : -1}
              >
                <span>Tags</span>
                <ChevronIcon open={isTagsOpen} />
              </button>
              {isTagsOpen && (
                <div className={styles.groupBody}>
                  {availableTags.map((tag) => (
                    <label key={tag} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={activeTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        aria-label={tag}
                        tabIndex={isPanelOpen ? 0 : -1}
                      />
                      <span className={styles.checkboxText}>{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
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

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
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
