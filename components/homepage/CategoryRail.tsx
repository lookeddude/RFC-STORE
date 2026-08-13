/**
 * RFC Store — Category Rail
 *
 * Mobile: horizontally scrollable row of circular category cards
 * Desktop: flexible row of rectangular category cards
 *
 * Data: live from Supabase getCategories()
 * Fallback: discipline emojis if no image
 */
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/data/products';
import type { Category } from '@/types/product';
import styles from './CategoryRail.module.css';

// Emoji + gradient fallbacks per discipline slug
const DISCIPLINE_META: Record<string, { emoji: string; color: string }> = {
  boxing:        { emoji: '🥊', color: '#C81D28' },
  mma:           { emoji: '🥋', color: '#1F2937' },
  'muay-thai':   { emoji: '🦵', color: '#7C2D12' },
  kickboxing:    { emoji: '👊', color: '#1E3A5F' },
  bjj:           { emoji: '🤼', color: '#1A3A2A' },
  'training-gear': { emoji: '🏋️', color: '#374151' },
  protection:    { emoji: '🛡️', color: '#4B5563' },
  apparel:       { emoji: '👕', color: '#1F2937' },
  accessories:   { emoji: '⚡', color: '#374151' },
};

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
          VIEW ALL <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Scroll container */}
      <div className={styles.railOuter}>
        <ul className={styles.rail} role="list">
          {categories.map((cat) => {
            const meta = DISCIPLINE_META[cat.slug] ?? { emoji: '🥊', color: '#374151' };
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
                    style={!cat.imageUrl ? { background: `linear-gradient(135deg, ${meta.color}, #111827)` } : undefined}
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
                      <span className={styles.emoji} aria-hidden="true">{meta.emoji}</span>
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
