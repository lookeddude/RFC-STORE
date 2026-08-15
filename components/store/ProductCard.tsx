/**
 * RFC Store — ProductCard Component
 *
 * THE single canonical product card used across:
 *   - Homepage Featured Gear
 *   - Shop listing (/shop)
 *   - Category pages
 *   - Search results
 *   - Wishlist (Phase 7)
 *
 * Stitch design spec:
 *   - 3:4 aspect ratio image area, white background
 *   - Badge top-left: NEW (black), BEST SELLER (black), SALE (coral red)
 *   - Category label above product name (uppercase, muted, small)
 *   - Product name (bold, 2-line clamp)
 *   - Price in Coral Red; compare-at price with strikethrough
 *   - Hover: image scale-up + "ADD TO CART" slide-up overlay
 *   - Entire card is a link to /shop/[slug]
 *
 * @param product — ProductCard type from types/product.ts
 */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import type { ProductCard as ProductCardType } from "@/types/product";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: ProductCardType;
  /** Priority loading — set true for above-the-fold cards */
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const {
    name,
    slug,
    shortDescription,
    primaryImage,
    basePrice,
    compareAtPrice,
    category,
    isNew,
    isBestseller,
    isOutOfStock,
  } = product;


  const href = `/shop/${slug}`;

  // Determine badge — SOLD OUT takes priority, then SALE, BEST SELLER, NEW
  const badge: { label: string; variant: "sale" | "badge" | "soldout" } | null =
    isOutOfStock
      ? { label: "SOLD OUT", variant: "soldout" }
      : compareAtPrice !== null
      ? { label: "SALE", variant: "sale" }
      : isBestseller
      ? { label: "BEST SELLER", variant: "badge" }
      : isNew
      ? { label: "NEW", variant: "badge" }
      : null;


  return (
    <article className={styles.card} data-sold-out={isOutOfStock}>
      {/* Image Area */}
      <Link href={href} className={styles.imageWrapper} tabIndex={-1} aria-hidden="true">
        {/* Badge */}
        {badge && (
          <div
            className={styles.badge}
            data-variant={badge.variant}
            aria-label={badge.label}
          >
            {badge.label}
          </div>
        )}

        {/* Product Image */}
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? `${name} — RFC Store`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={styles.image}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            style={isOutOfStock ? { opacity: 0.5, filter: 'grayscale(40%)' } : undefined}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <span>RFC</span>
          </div>
        )}

        {/* ADD TO CART hover overlay — hidden when sold out */}
        {!isOutOfStock && (
          <div className={styles.addToCartOverlay} aria-hidden="true">
            <span className={styles.addToCartLabel}>ADD TO CART</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className={styles.info}>
        {/* Category label */}
        {category && (
          <div className={styles.categoryLabel}>{category.name.toUpperCase()}</div>
        )}

        {/* Name */}
        <Link href={href} className={styles.name}>
          {name}
        </Link>

        {/* Short description — hidden on mobile to save space */}
        {shortDescription && (
          <p className={styles.shortDesc}>{shortDescription}</p>
        )}

        {/* Pricing */}
        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(basePrice)}</span>
          {compareAtPrice && (
            <span className={styles.compareAt}>{formatPrice(compareAtPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
