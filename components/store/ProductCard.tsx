/**
 * RFC Store — ProductCard Component
 *
 * Reusable product card for homepage Featured Gear, Shop, and Category pages.
 * Accepts HomepageProduct seed data in Phase 2; will accept Supabase Product
 * data after Phase 3 catalogue is implemented.
 *
 * Design spec (Stitch):
 *   - White background card, 3:4 aspect ratio image area
 *   - Hover: image scale-up + "QUICK ADD" overlay (Phase 2: architectural placeholder)
 *   - Price in Coral Red (#BC000A)
 *   - Compare-at price with strikethrough
 *   - Badge in top-left corner
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils/format";
import type { HomepageProduct } from "@/lib/content/homepage.content";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: HomepageProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    name,
    subtitle,
    priceInr,
    compareAtPriceInr,
    href,
    image,
    badge,
  } = product;

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.imageWrapper} tabIndex={-1} aria-hidden="true">
        {/* Badge */}
        {badge && (
          <div className={styles.badge}>
            <Badge variant={badge === "NEW" ? "accent" : "default"}>
              {badge}
            </Badge>
          </div>
        )}

        {/* Product Image */}
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
          className={styles.image}
          loading="lazy"
        />

        {/* Quick Add overlay — Phase 2: architectural placeholder */}
        <div className={styles.quickAddOverlay} aria-hidden="true">
          <span className={styles.quickAddLabel}>QUICK ADD</span>
        </div>
      </Link>

      {/* Product Info */}
      <div className={styles.info}>
        <div className={styles.meta}>
          <Link href={href} className={styles.name}>
            {name}
          </Link>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.pricing}>
          {compareAtPriceInr && (
            <span className={styles.compareAt}>
              {formatPrice(compareAtPriceInr)}
            </span>
          )}
          <span className={styles.price}>{formatPrice(priceInr)}</span>
        </div>
      </div>
    </article>
  );
}
