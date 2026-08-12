"use client";
/**
 * RFC Store — Shop Toolbar Component
 *
 * Stitch design: search input left + sort by dropdown right.
 * URL-driven state — updates ?q= and ?sort= search params.
 * Search is debounced to avoid excessive navigation on keypress.
 */
import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { SortOption } from "@/types/product";
import styles from "./ShopToolbar.module.css";

interface ShopToolbarProps {
  currentSort: SortOption;
  currentSearch: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Relevance" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ShopToolbar({ currentSort, currentSearch }: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(currentSearch);

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

  return (
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
