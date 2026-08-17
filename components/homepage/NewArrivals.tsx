/**
 * RFC Store — New Arrivals Section
 *
 * Shows newest products (is_new_arrival = true, or newest by created_at).
 * Mobile: horizontal scroll rail. Desktop: 4-col grid.
 */
import Link from 'next/link';
import { getNewArrivals } from '@/lib/data/products';
import { ProductCard } from '@/components/store/ProductCard';
import type { ProductCard as ProductCardType } from '@/types/product';
import styles from './NewArrivals.module.css';

export async function NewArrivals() {
  let products: ProductCardType[] = [];
  try {
    products = await getNewArrivals(6);
  } catch {
    products = [];
  }

  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-label="New Arrivals">
      <div className={styles.inner}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleRow}>
            <span className={styles.freshDot} aria-hidden="true" />
            <div>
              <p className={styles.eyebrow}>Just Dropped</p>
              <h2 className={styles.title}>NEW ARRIVALS</h2>
            </div>
          </div>
          <Link href="/shop?sort=newest" className={styles.viewAll}>
            VIEW ALL
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile: horizontal scroll. Desktop: grid */}
        <div className={styles.railOuter}>
          <div className={styles.rail}>
            {products.map((product) => (
              <div key={product.id} className={styles.railItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
