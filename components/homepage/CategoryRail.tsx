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
  boxing:           'linear-gradient(135deg, #A01525 0%, #3D0A0E 60%, #160304 100%)',
  mma:              'linear-gradient(135deg, #152030 0%, #0A151F 60%, #050D14 100%)',
  'muay-thai':      'linear-gradient(135deg, #8B3000 0%, #4A1200 60%, #1A0600 100%)',
  kickboxing:       'linear-gradient(135deg, #12346B 0%, #071A40 60%, #020C22 100%)',
  bjj:              'linear-gradient(135deg, #0E3320 0%, #051A0F 60%, #020C07 100%)',
  'training-gear':  'linear-gradient(135deg, #2D3748 0%, #1A2030 60%, #0D1018 100%)',
  protection:       'linear-gradient(135deg, #3D4551 0%, #1F2533 60%, #0D1018 100%)',
  apparel:          'linear-gradient(135deg, #1E2A40 0%, #0E1520 60%, #05080F 100%)',
  accessories:      'linear-gradient(135deg, #2A2535 0%, #12101A 60%, #080510 100%)',
};

const DEFAULT_BG = 'linear-gradient(135deg, #1E2030 0%, #0D1018 100%)';

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
