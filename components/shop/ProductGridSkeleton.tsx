/**
 * RFC Store — Product Grid Skeleton
 * Shown by loading.tsx during Supabase data fetching.
 * Matches ProductCard proportions exactly to prevent layout shift.
 */
import React from "react";
import styles from "./ProductGridSkeleton.module.css";
import gridStyles from "./ProductGrid.module.css";

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className={gridStyles.grid} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.info}>
        <div className={styles.category} />
        <div className={styles.name} />
        <div className={styles.nameShort} />
        <div className={styles.price} />
      </div>
    </div>
  );
}
