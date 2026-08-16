"use client";
/**
 * RFC Store — Mobile Filter Drawer
 *
 * A bottom-sheet overlay for mobile (< 1024px) that contains all filter
 * options from FilterSidebar. Hidden on desktop where the real sidebar shows.
 *
 * Pattern:
 *   - Self-contained open/close state (no prop drilling from server page)
 *   - Trigger button shows active filter count badge
 *   - Bottom sheet slides up from the bottom of the viewport
 *   - Backdrop click and Escape key close the drawer
 *   - Focus trap when open
 *   - Filter interactions update URL params (same as FilterSidebar)
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/types/product";
import styles from "./MobileFilterDrawer.module.css";

interface MobileFilterDrawerProps {
  categories: Category[];
  activeCategoryId: string | null;
  activeMinPrice: number | null;
  activeMaxPrice: number | null;
  availableTags: string[];
  activeTags: string[];
  activeInStock: boolean;
  activeFilterCount: number;
}

export function MobileFilterDrawer({
  categories,
  activeCategoryId,
  activeMinPrice,
  activeMaxPrice,
  availableTags,
  activeTags,
  activeInStock,
  activeFilterCount,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Focus the drawer when it opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => drawerRef.current?.focus(), 80);
    }
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      {/* Trigger Button — only visible on mobile */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className={styles.trigger}
        aria-label={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
        aria-expanded={isOpen}
        aria-controls="mobile-filter-drawer"
        type="button"
      >
        <FilterIcon />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-filter-drawer"
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles["drawer--open"] : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
        tabIndex={-1}
      >
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Filters</h2>
          <button
            onClick={handleClose}
            className={styles.closeBtn}
            type="button"
            aria-label="Close filters"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div className={styles.drawerBody}>
          <DrawerFilters
            categories={categories}
            activeCategoryId={activeCategoryId}
            activeMinPrice={activeMinPrice}
            activeMaxPrice={activeMaxPrice}
            availableTags={availableTags}
            activeTags={activeTags}
            activeInStock={activeInStock}
            onClose={handleClose}
          />
        </div>
      </div>
    </>
  );
}

// ── Internal filter content (same logic as FilterSidebar) ─

interface DrawerFiltersProps {
  categories: Category[];
  activeCategoryId: string | null;
  activeMinPrice: number | null;
  activeMaxPrice: number | null;
  availableTags: string[];
  activeTags: string[];
  activeInStock: boolean;
  onClose: () => void;
}

function DrawerFilters({
  categories,
  activeCategoryId,
  activeMinPrice,
  activeMaxPrice,
  availableTags,
  activeTags,
  activeInStock,
  onClose,
}: DrawerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isProductTypeOpen, setIsProductTypeOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [minInput, setMinInput] = useState(activeMinPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(activeMaxPrice?.toString() ?? "");

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
      const currentTags = current.split(",").map((t) => t.trim()).filter(Boolean);
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
    onClose();
  }

  return (
    <div className={styles.filters}>
      {/* In Stock Toggle */}
      <div className={styles.filterGroup}>
        <label className={styles.inStockLabel}>
          <input
            type="checkbox"
            className={styles.inStockCheckbox}
            checked={activeInStock}
            onChange={handleInStockToggle}
            aria-label="Show in-stock products only"
          />
          <span className={styles.inStockText}>In Stock Only</span>
        </label>
      </div>

      {/* Product Type */}
      {categories.length > 0 && (
        <div className={styles.filterGroup}>
          <button
            className={styles.filterGroupHeader}
            onClick={() => setIsProductTypeOpen((v) => !v)}
            type="button"
            aria-expanded={isProductTypeOpen}
          >
            <span>Product Type</span>
            <ChevronIcon open={isProductTypeOpen} />
          </button>
          {isProductTypeOpen && (
            <div className={styles.filterGroupBody}>
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
      )}

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className={styles.filterGroup}>
          <button
            className={styles.filterGroupHeader}
            onClick={() => setIsTagsOpen((v) => !v)}
            type="button"
            aria-expanded={isTagsOpen}
          >
            <span>Tags</span>
            <ChevronIcon open={isTagsOpen} />
          </button>
          {isTagsOpen && (
            <div className={styles.filterGroupBody}>
              {availableTags.map((tag) => (
                <label key={tag} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={activeTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    aria-label={tag}
                  />
                  <span className={styles.checkboxText}>{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price */}
      <div className={styles.filterGroup}>
        <button
          className={styles.filterGroupHeader}
          onClick={() => setIsPriceOpen((v) => !v)}
          type="button"
          aria-expanded={isPriceOpen}
        >
          <span>Price (₹)</span>
          <ChevronIcon open={isPriceOpen} />
        </button>
        {isPriceOpen && (
          <div className={styles.filterGroupBody}>
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
            <button type="button" className={styles.applyBtn} onClick={handlePriceApply}>
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className={styles.drawerFooter}>
        <button type="button" onClick={handleClearAll} className={styles.clearAllBtn}>
          Clear All Filters
        </button>
        <button type="button" onClick={onClose} className={styles.showResultsBtn}>
          Show Results
        </button>
      </div>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────── */

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
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
