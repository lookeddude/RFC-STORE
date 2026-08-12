/**
 * RFC Store — Shop Header Component
 *
 * Stitch design:
 *   - Breadcrumbs: Home / Shop
 *   - H1: "SHOP"
 *   - Description text
 *   - Product count (right-aligned on desktop)
 *   - Bottom border
 */
import React from "react";
import Link from "next/link";
import styles from "./ShopHeader.module.css";

interface ShopHeaderProps {
  totalProducts: number;
  /** Breadcrumb override — for category pages (Phase 4) */
  title?: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
}

export function ShopHeader({
  totalProducts,
  title = "Shop",
  description = "Engineered for the arena. Discover our complete collection of premium fight gear, apparel, and training equipment designed for peak performance.",
  breadcrumb,
}: ShopHeaderProps) {
  const crumbs = breadcrumb ?? [
    { label: "Home", href: "/" },
    { label: title, href: "/shop" },
  ];

  return (
    <div className={styles.header}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i < crumbs.length - 1 ? (
              <>
                <Link href={crumb.href} className={styles.breadcrumbLink}>
                  {crumb.label}
                </Link>
                <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
              </>
            ) : (
              <span className={styles.breadcrumbCurrent} aria-current="page">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.heading}>{title.toUpperCase()}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.count} aria-live="polite">
          {totalProducts} PRODUCT{totalProducts !== 1 ? "S" : ""}
        </div>
      </div>
    </div>
  );
}
