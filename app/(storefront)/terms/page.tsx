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
          <h1 className={styles.title}>Terms &amp; Conditions</h1>
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
            <h2>3. Payment Terms</h2>
            <p>We accept Cash on Delivery and online payment via Razorpay. For online payments, your order is confirmed only after payment is verified server-side. COD orders are confirmed immediately upon placement.</p>
          </section>

          <section className={styles.section}>
            <h2>4. Cancellation</h2>
            <p>Prepaid orders may be cancelled before shipment. Refunds for online payments are processed within [CONFIRM: X] business days.</p>
          </section>

          <section className={styles.section}>
            <h2>5. Shipping &amp; Delivery</h2>
            <p>5-7 business days, delays possible, not liable for courier delays.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Returns &amp; Refunds</h2>
            <p>See our Returns Policy page, items must be unused, 7-day window.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Intellectual Property</h2>
            <p>All content owned by Revive Fight Club.</p>
          </section>

          <section className={styles.section}>
            <h2>8. Contact</h2>
            <p>Email: <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
