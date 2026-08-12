/**
 * RFC Store — Featured Gear Section
 *
 * Phase 3+: Fetches is_featured=true products from Supabase.
 * Falls back gracefully if DB is unavailable.
 *
 * Async Server Component — no client boundary needed.
 */
import React from "react";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/store/ProductCard";
import styles from "./FeaturedGear.module.css";

export async function FeaturedGear() {
  // Fetch featured products from Supabase (Phase 3+ live data)
  let featuredProducts = await getFeaturedProducts(4).catch(() => []);

  // Fallback: if DB has no featured products yet, show first 4 products
  if (featuredProducts.length === 0) {
    const { getProducts } = await import("@/lib/data/products");
    const { products } = await getProducts({}, "newest", 1, 4).catch(() => ({ products: [] }));
    featuredProducts = products;
  }

  if (featuredProducts.length === 0) return null;

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
        {featuredProducts.map((product, index) => (
          <div key={product.id} role="listitem">
            <ProductCard product={product} priority={index < 2} />
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
