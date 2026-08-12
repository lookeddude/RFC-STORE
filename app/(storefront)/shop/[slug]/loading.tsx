/**
 * RFC Store — Product Detail Page Loading Skeleton
 * Shown while Supabase data fetches. Prevents blank screen + layout shift.
 */
import { Container } from "@/components/ui/Container";
import styles from "./pdp.loading.module.css";

export default function ProductDetailLoading() {
  return (
    <Container>
      <div className={styles.page}>
        {/* Breadcrumb skeleton */}
        <div className={styles.breadcrumb} />

        <div className={styles.grid}>
          {/* Left: Gallery skeleton */}
          <div className={styles.gallery}>
            <div className={styles.mainImage} />
            <div className={styles.thumbs}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={styles.thumb} />
              ))}
            </div>
          </div>

          {/* Right: Info skeleton */}
          <div className={styles.info}>
            <div className={styles.category} />
            <div className={styles.name} />
            <div className={styles.nameShort} />
            <div className={styles.price} />
            <div className={styles.desc} />
            <div className={styles.descShort} />
            <div className={styles.pillRow}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={styles.pill} />
              ))}
            </div>
            <div className={styles.ctaRow}>
              <div className={styles.qty} />
              <div className={styles.cta} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
