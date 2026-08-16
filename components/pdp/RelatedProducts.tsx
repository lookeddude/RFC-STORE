/**
 * RFC Store — Related Products Section (Server Component)
 *
 * Stitch design: "YOU MAY ALSO LIKE" heading + 4-col ProductCard grid.
 * Fetches up to 4 products from same category, excluding current product.
 */
import React from "react";
import type { ProductCard as ProductCardType } from "@/types/product";
import { ProductCard } from "@/components/store/ProductCard";
import styles from "./RelatedProducts.module.css";

interface RelatedProductsProps {
  products: ProductCardType[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-heading">
      <h2 id="related-heading" className={styles.heading}>
        COMPLETE THE KIT
      </h2>

      <div className={styles.grid} role="list">
        {products.map((product) => (
          <div key={product.id} role="listitem">
            <ProductCard product={product} priority={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
