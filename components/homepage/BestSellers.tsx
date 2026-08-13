/**
 * RFC Store — Best Sellers Section
 *
 * Shows products with is_bestseller = true.
 * Falls back to featured products if none flagged.
 * 2-col mobile, 4-col desktop.
 */
import Link from 'next/link';
import { getBestsellers } from '@/lib/data/products';
import { ProductCard } from '@/components/store/ProductCard';
import type { ProductCard as ProductCardType } from '@/types/product';
import styles from './BestSellers.module.css';

export async function BestSellers() {
  let products: ProductCardType[] = [];
  try {
    products = await getBestsellers(4);
  } catch {
    products = [];
  }

  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Best Sellers">
      <div className={styles.inner}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>RFC Picks</p>
            <h2 className={styles.title}>BEST SELLERS</h2>
          </div>
          <Link href="/shop" className={styles.viewAll}>
            VIEW ALL <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
