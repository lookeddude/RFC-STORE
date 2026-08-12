/**
 * RFC Store — Product Info Panel (Server Component)
 *
 * Stitch design: right-hand product details:
 *   Category label → Product name (H1) → Price row → Short description → Tags
 *
 * Pure display — no interactivity. Used by the PDP server component.
 */
import React from "react";
import type { Product } from "@/types/product";
import { formatPrice, formatDiscount } from "@/lib/utils/format";
import styles from "./ProductInfo.module.css";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const {
    name,
    category,
    basePrice,
    compareAtPrice,
    shortDescription,
    tags,
    isFeatured,
  } = product;

  const discountPct =
    compareAtPrice && compareAtPrice > basePrice
      ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100)
      : null;

  return (
    <div className={styles.info}>
      {/* Category label */}
      {category && (
        <div className={styles.category}>{category.name.toUpperCase()}</div>
      )}

      {/* Product Name — H1 for SEO */}
      <h1 className={styles.name}>{name}</h1>

      {/* Price Row */}
      <div className={styles.priceRow}>
        <span className={styles.price}>{formatPrice(basePrice)}</span>
        {compareAtPrice && (
          <span className={styles.compareAt}>{formatPrice(compareAtPrice)}</span>
        )}
        {discountPct && (
          <span className={styles.discountBadge}>{formatDiscount(discountPct)}</span>
        )}
        {isFeatured && !discountPct && (
          <span className={styles.featuredBadge}>FEATURED</span>
        )}
      </div>

      {/* Short Description */}
      {shortDescription && (
        <p className={styles.shortDesc}>{shortDescription}</p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className={styles.tags} aria-label="Product tags">
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
