/**
 * RFC Store — Checkout Skeleton Loading State
 */
import styles from "./CheckoutSkeleton.module.css";

export function CheckoutSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.title} />
      </div>
      <div className={styles.layout}>
        {/* Form skeleton */}
        <div className={styles.formCol}>
          <div className={styles.section}>
            <div className={styles.sectionTitle} />
            <div className={styles.grid}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={styles.fieldGroup}>
                  <div className={styles.label} />
                  <div className={styles.input} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle} />
            <div className={styles.grid}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.fieldGroup}>
                  <div className={styles.label} />
                  <div className={styles.input} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Summary skeleton */}
        <div className={styles.summary} />
      </div>
    </div>
  );
}
