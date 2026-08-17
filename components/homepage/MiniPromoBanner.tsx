/**
 * RFC Store — Mini Promo Banner
 *
 * Compact (~160px) dark promotional strip between product sections.
 * Left: bold headline + subtext. Right: CTA button.
 * NOT a full hero clone.
 */
import Link from 'next/link';
import styles from './MiniPromoBanner.module.css';

interface MiniPromoBannerProps {
  headline?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function MiniPromoBanner({
  headline = 'TRAIN HARD. GEAR HARDER.',
  subtext = 'Engineered for those who refuse to quit.',
  ctaLabel = 'SHOP NOW',
  ctaHref = '/shop',
}: MiniPromoBannerProps) {
  return (
    <div className={styles.banner}>
      {/* Subtle diagonal stripe texture */}
      <div className={styles.pattern} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.headline}>{headline}</p>
          <p className={styles.subtext}>{subtext}</p>
        </div>

        <Link href={ctaHref} className={styles.cta}>
          {ctaLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
