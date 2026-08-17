/**
 * RFC Store — Category Rail
 *
 * Mobile: horizontally scrollable row of circular category cards
 * Desktop: flexible row of rectangular category cards
 *
 * Data: live from Supabase getCategories()
 * Fallback: initial letter of category name when no image — clean,
 * brand-consistent, no emoji (craft-floor requirement).
 */
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/data/products';
import type { Category } from '@/types/product';
import styles from './CategoryRail.module.css';

// Brand-palette gradient backgrounds per discipline slug (no emoji)
const DISCIPLINE_BG: Record<string, string> = {
  boxing:           'linear-gradient(135deg, #C81D28 0%, #111827 100%)',
  mma:              'linear-gradient(135deg, #1F2937 0%, #0D1117 100%)',
  'muay-thai':      'linear-gradient(135deg, #7C2D12 0%, #111827 100%)',
  kickboxing:       'linear-gradient(135deg, #1E3A5F 0%, #111827 100%)',
  bjj:              'linear-gradient(135deg, #1A3A2A 0%, #111827 100%)',
  'training-gear':  'linear-gradient(135deg, #374151 0%, #111827 100%)',
  protection:       'linear-gradient(135deg, #4B5563 0%, #111827 100%)',
  apparel:          'linear-gradient(135deg, #1F2937 0%, #0D1117 100%)',
  accessories:      'linear-gradient(135deg, #374151 0%, #111827 100%)',
};

const DEFAULT_BG = 'linear-gradient(135deg, #374151 0%, #111827 100%)';

export async function CategoryRail() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  if (categories.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Shop by Category">
      <div className={styles.header}>
        <h2 className={styles.heading}>SHOP BY CATEGORY</h2>
        <Link href="/categories" className={styles.viewAll}>
          VIEW ALL
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* Scroll container */}
      <div className={styles.railOuter}>
        <ul className={styles.rail} role="list">
          {categories.map((cat) => {
            const bg = DISCIPLINE_BG[cat.slug] ?? DEFAULT_BG;
            // Initial letter fallback — clean typographic treatment
            const initial = cat.name.charAt(0).toUpperCase();
            return (
              <li key={cat.id} className={styles.item}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className={styles.card}
                  aria-label={`Shop ${cat.name}`}
                >
                  {/* Circle image */}
                  <div
                    className={styles.circle}
                    style={!cat.imageUrl ? { background: bg } : undefined}
                  >
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span className={styles.initial} aria-hidden="true">{initial}</span>
                    )}
                  </div>
                  {/* Name */}
                  <span className={styles.name}>{cat.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
