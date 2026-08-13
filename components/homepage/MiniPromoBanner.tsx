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
      {/* Subtle background pattern — diagonal lines at low opacity */}
      <div className={styles.pattern} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          {/* Red accent bar */}
          <span className={styles.accentBar} aria-hidden="true" />
          <div>
            <p className={styles.headline}>{headline}</p>
            <p className={styles.subtext}>{subtext}</p>
          </div>
        </div>

        <Link href={ctaHref} className={styles.cta}>
          {ctaLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
