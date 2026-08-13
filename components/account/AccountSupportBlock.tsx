import Link from 'next/link';
import styles from './AccountSupportBlock.module.css';

export function AccountSupportBlock() {
  return (
    <div className={styles.container}>
      <h3 className={styles.label}>NEED HELP?</h3>
      <p className={styles.descriptor}>Orders &middot; Shipping &middot; Returns &middot; Products</p>
      
      <div className={styles.actions}>
        <a href="mailto:support@revivefightclub.com" className={styles.button}>
          CONTACT SUPPORT
        </a>
        <Link href="/training" className={styles.button}>
          VIEW RETURNS POLICY
        </Link>
      </div>
    </div>
  );
}
