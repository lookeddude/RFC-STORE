/**
 * RFC Store — Product Grid Component
 *
 * Stitch design: responsive grid
 *   Mobile: 1 column
 *   SM (640px): 2 columns
 *   LG (1024px): 3 columns
 *   XL (1280px): 4 columns (when no sidebar)
 *   LG with sidebar: 3 columns
 */
import React from "react";
import type { ProductCard as ProductCardType } from "@/types/product";
import { ProductCard } from "@/components/store/ProductCard";
import { EmptyState } from "./EmptyState";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  products: ProductCardType[];
  hasFilters: boolean;
}

export function ProductGrid({ products, hasFilters }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className={styles.grid} role="list" aria-label="Products">
      {products.map((product, index) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} priority={index < 4} />
        </div>
      ))}
    </div>
  );
}
