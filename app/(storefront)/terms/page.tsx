import type { Metadata } from 'next';
import styles from './terms.module.css';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Revive Fight Club',
  description: 'Terms and Conditions for Revive Fight Club.',
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.category}>LEGAL</p>
          <h1 className={styles.title}>Terms & Conditions</h1>
          <p className={styles.updated}>Last updated: August 2026</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>By placing an order you agree to these terms.</p>
          </section>

          <section className={styles.section}>
            <h2>2. Products &amp; Pricing</h2>
            <p>Prices in INR, subject to change, errors may occur.</p>
          </section>

          <section className={styles.section}>
            <h2>3. Orders &amp; Payment</h2>
            <p>COD only currently, orders placed are binding, we reserve the right to cancel.</p>
          </section>

          <section className={styles.section}>
            <h2>4. Shipping &amp; Delivery</h2>
            <p>5-7 business days, delays possible, not liable for courier delays.</p>
          </section>

          <section className={styles.section}>
            <h2>5. Returns &amp; Refunds</h2>
            <p>See our Returns Policy page, items must be unused, 7-day window.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Intellectual Property</h2>
            <p>All content owned by Revive Fight Club.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Contact</h2>
            <p>Email: <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
