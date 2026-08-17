/**
 * RFC Store — Best Deals Section
 *
 * Shows products with compare_at_price (discounted).
 * 2-col mobile, 4-col desktop.
 * Data: getBestDeals(8) from lib/data/products
 */
import Link from 'next/link';
import { getBestDeals } from '@/lib/data/products';
import { ProductCard } from '@/components/store/ProductCard';
import type { ProductCard as ProductCardType } from '@/types/product';
import styles from './BestDeals.module.css';

export async function BestDeals() {
  let products: ProductCardType[] = [];
  try {
    products = await getBestDeals(8);
  } catch {
    products = [];
  }

  // Hide section if no deals exist
  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Best Deals">
      <div className={styles.inner}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Limited Time</p>
            <h2 className={styles.title}>BEST DEALS</h2>
          </div>
          <Link href="/shop?sort=price-asc" className={styles.viewAll}>
            VIEW ALL
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className={styles.grid}>
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
