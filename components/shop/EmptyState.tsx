/**
 * RFC Store — Empty State Component
 * Shown when no products match the current filters/search.
 * Fixed: inline SVG style replaced with CSS class.
 */
import React from "react";
import Link from "next/link";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.icon} aria-hidden="true">
        <EmptyBoxIcon />
      </div>
      <h2 className={styles.heading}>
        {hasFilters ? "No results found" : "No products available"}
      </h2>
      <p className={styles.text}>
        {hasFilters
          ? "Try adjusting your filters or search terms to find what you're looking for."
          : "Check back soon — new gear is on its way."}
      </p>
      {hasFilters && (
        <Link href="/shop" className={styles.cta}>
          VIEW ALL GEAR
        </Link>
      )}
    </div>
  );
}

function EmptyBoxIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.iconSvg}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
