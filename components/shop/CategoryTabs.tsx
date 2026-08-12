"use client";
/**
 * RFC Store — Category Tabs Component
 *
 * Stitch design: horizontal scrollable tab bar.
 * "All" tab first, then all active categories.
 * Active tab: coral red border-bottom + color.
 * Click → updates URL search param ?category=slug
 * URL-driven state: shareable, bookmarkable.
 */
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/types/product";
import styles from "./CategoryTabs.module.css";

interface CategoryTabsProps {
  categories: Category[];
  activeSlug: string | null;
}

export function CategoryTabs({ categories, activeSlug }: CategoryTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleTabClick(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    // Reset to page 1 when switching category
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav
      className={styles.tabs}
      aria-label="Filter by category"
      role="tablist"
    >
      {/* "All" tab */}
      <button
        className={styles.tab}
        data-active={activeSlug === null}
        onClick={() => handleTabClick(null)}
        role="tab"
        aria-selected={activeSlug === null}
      >
        All
      </button>

      {/* Category tabs */}
      {categories.map((cat) => (
        <button
          key={cat.slug}
          className={styles.tab}
          data-active={activeSlug === cat.slug}
          onClick={() => handleTabClick(cat.slug)}
          role="tab"
          aria-selected={activeSlug === cat.slug}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
