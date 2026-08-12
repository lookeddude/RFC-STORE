/**
 * RFC Store — Featured Gear Section
 *
 * 4-column product card grid showing the store's featured products.
 * Header with section title and "View All" link.
 * Each product rendered via the reusable ProductCard component.
 *
 * Phase 2: Data from FEATURED_PRODUCTS seed in homepage.content.ts
 * Phase 3+: Will be fetched from Supabase (isFeatured=true products)
 */
import React from "react";
import Link from "next/link";
import { FEATURED_PRODUCTS } from "@/lib/content/homepage.content";
import { ProductCard } from "@/components/store/ProductCard";
import styles from "./FeaturedGear.module.css";

export function FeaturedGear() {
  return (
    <section
      className={styles.section}
      aria-labelledby="featured-gear-heading"
    >
      <h2 id="featured-gear-heading" className={styles.heading}>
        Featured Gear
      </h2>

      {/* Product Grid */}
      <div className={styles.grid} role="list">
        {FEATURED_PRODUCTS.map((product) => (
          <div key={product.id} role="listitem">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* View All CTA */}
      <div className={styles.viewAllWrapper}>
        <Link href="/shop" className={styles.viewAll}>
          VIEW ALL GEAR
        </Link>
      </div>
    </section>
  );
}
