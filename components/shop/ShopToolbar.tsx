"use client";
/**
 * RFC Store — Shop Toolbar Component
 *
 * Stitch design: search input left + sort by dropdown right.
 * URL-driven state — updates ?q= and ?sort= search params.
 * Search is debounced to avoid excessive navigation on keypress.
 *
 * New in Phase 1:
 *   - Search clear (×) button when ?q= is active
 *   - Result count: "12 results for 'gloves'" when searching
 *   - name-asc / name-desc sort options (already wired in data layer)
 */
import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { SortOption } from "@/types/product";
import styles from "./ShopToolbar.module.css";

interface ShopToolbarProps {
  currentSort: SortOption;
  currentSearch: string;
  /** Total matching products — used for result count display when searching */
  total?: number;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Relevance" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
];

export function ShopToolbar({ currentSort, currentSearch, total }: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(currentSearch);

  // Sync search value if URL changes (e.g. navigating back)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchValue(currentSearch);
  }, [currentSearch]);

  // Debounced search update — triggers on every keystroke with 400ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        params.set("q", searchValue);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const handleSortChange = useCallback(
    (value: SortOption) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", value);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  function handleClearSearch() {
    setSearchValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const isSearchActive = currentSearch.trim().length > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        {/* Search Input */}
        <div className={styles.searchWrapper} role="search">
          <SearchIcon />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Search products"
          />
          {/* Clear button — visible only when search is active */}
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className={styles.clearBtn}
              type="button"
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className={styles.sortWrapper}>
          <span className={styles.sortLabel}>Sort by:</span>
          <select
            className={styles.sortSelect}
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count — shown only when a search query is active */}
      {isSearchActive && total !== undefined && (
        <p className={styles.resultCount} aria-live="polite">
          <span className={styles.resultNumber}>{total}</span>{" "}
          {total === 1 ? "result" : "results"} for{" "}
          <span className={styles.resultQuery}>&ldquo;{currentSearch}&rdquo;</span>
        </p>
      )}
    </div>
  );
}

function SearchIcon() {
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
      style={{ flexShrink: 0, color: "rgba(11,28,48,0.45)" }}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
