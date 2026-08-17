/**
 * RFC Store — Editorial Banner (Stacked Layout)
 *
 * Two stacked rows:
 *   TOP    — dark charcoal, full-width text content
 *   BOTTOM — full-width image strip with subtle overlay
 *
 * Polished: all styles migrated from inline/global to CSS Module.
 * Eyebrow removed (craft-floor ban). Stats kept — they carry real
 * product proof, not decorative metrics.
 */
import Image from "next/image";
import Link from "next/link";
import { EDITORIAL_CONTENT } from "@/lib/content/homepage.content";
import { StatsRow } from "./StatsRow";
import styles from "./EditorialBanner.module.css";

const STATS = [
  { value: "10K+", label: "Fighters Equipped" },
  { value: "Pro",  label: "Grade Gear" },
  { value: "24h",  label: "Fast Dispatch" },
  { value: "7-Day", label: "Easy Returns" },
];

export function EditorialBanner() {
  const { headline, subtext, cta, image } = EDITORIAL_CONTENT;

  // Split at last "." so we can colour only the terminal punctuation
  const headlineBody = headline.replace(/\.$/, "");

  return (
    <section className={styles.section} aria-label="RFC Store — Engineered For Impact">

      {/* ── TOP ROW — Text Content ───────────────────────── */}
      <div className={styles.textBlock}>

        {/* Headline + body in 2-col on large screens */}
        <div className={styles.contentRow}>

          {/* Headline */}
          <h2 className={styles.headline}>
            {headlineBody}<span className={styles.accentDot}>.</span>
          </h2>

          {/* Right column — body + CTAs */}
          <div className={styles.rightCol}>
            <p className={styles.body}>{subtext}</p>

            <div className={styles.ctaRow}>
              <Link href={cta.href} className={styles.ctaPrimary}>
                {cta.label}
              </Link>
              <Link href="/about" className={styles.ctaSecondary}>
                OUR STORY
              </Link>
            </div>
          </div>
        </div>

        {/* Stats row — animated entrance via StatsRow client component */}
        <StatsRow stats={STATS} />
      </div>

      {/* ── BOTTOM ROW — Full-Width Image Strip ─────────── */}
      <div className={styles.imageStrip}>
        {/* Red accent top border */}
        <div className={styles.redLine} aria-hidden="true" />

        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className={styles.img}
          loading="lazy"
        />

        {/* Gradient: strong at top, fades down */}
        <div className={styles.overlayTop} aria-hidden="true" />
        {/* Side vignette */}
        <div className={styles.overlaySide} aria-hidden="true" />
      </div>
    </section>
  );
}
