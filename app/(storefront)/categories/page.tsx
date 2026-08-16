import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from './categories.module.css';

export const metadata: Metadata = {
  title: 'Shop by Category | REVIVE FIGHT CLUB',
  description: 'Browse all combat sports categories — Boxing, MMA, Muay Thai, Kickboxing, Training Gear, Apparel and more.',
};

// Category emoji icons (since no images for categories)
const CATEGORY_ICONS: Record<string, string> = {
  boxing: '🥊',
  mma: '🤼',
  'muay-thai': '🦵',
  kickboxing: '🦶',
  'training-gear': '🏋️',
  protection: '🛡️',
  apparel: '👕',
  accessories: '🎽',
};

const CATEGORY_ACCENT: Record<string, string> = {
  boxing: '#E63946',
  mma: '#ff6b35',
  'muay-thai': '#ffd700',
  kickboxing: '#00b4d8',
  'training-gear': '#4ecdc4',
  protection: '#a8dadc',
  apparel: '#c77dff',
  accessories: '#80b918',
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('is_active', true)
    .order('name');

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>REVIVE FIGHT CLUB</p>
        <h1 className={styles.heroTitle}>Shop by Category</h1>
        <p className={styles.heroSub}>Find gear for your discipline. Professional grade equipment for every fighter.</p>
      </div>

      {/* Grid */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {(categories ?? []).map((cat) => {
            const icon = CATEGORY_ICONS[cat.slug] ?? '⚡';
            const accent = CATEGORY_ACCENT[cat.slug] ?? '#E63946';
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={styles.card}
                style={{ '--accent': accent } as React.CSSProperties}
              >
                <div className={styles.cardIcon}>{icon}</div>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{cat.name}</h2>
                  {cat.description && <p className={styles.cardDesc}>{cat.description}</p>}
                </div>
                <div className={styles.cardArrow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </div>
                <div className={styles.cardGlow} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
