/**
 * RFC Store — Cart Skeleton Loading State
 */
import styles from "./CartSkeleton.module.css";

export function CartSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.title} />
      <div className={styles.grid}>
        <div className={styles.items}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.itemRow}>
              <div className={styles.imgSk} />
              <div className={styles.nameGroup}>
                <div className={styles.nameSk} />
                <div className={styles.varSk} />
              </div>
              <div className={styles.qtySk} />
              <div className={styles.totalSk} />
              <div className={styles.removeSk} />
            </div>
          ))}
        </div>
        <div className={styles.summarySk} />
      </div>
    </div>
  );
}
