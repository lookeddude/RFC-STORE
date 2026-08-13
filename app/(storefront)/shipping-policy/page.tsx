import type { Metadata } from 'next';
import styles from './shipping-policy.module.css';

export const metadata: Metadata = {
  title: 'Shipping Policy — Revive Fight Club',
  description: 'Shipping Policy for Revive Fight Club.',
};

export default function ShippingPolicyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.category}>LEGAL</p>
          <h1 className={styles.title}>Shipping Policy</h1>
          <p className={styles.updated}>Last updated: August 2026</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Delivery Areas</h2>
            <p>Currently shipping across India.</p>
          </section>

          <section className={styles.section}>
            <h2>2. Delivery Timeframe</h2>
            <p>5–7 business days from order confirmation. Remote areas may take longer.</p>
          </section>

          <section className={styles.section}>
            <h2>3. Shipping Charges</h2>
            <p>Free shipping on orders above ₹999. Standard shipping: ₹99 for orders below ₹999.</p>
          </section>

          <section className={styles.section}>
            <h2>4. Cash on Delivery</h2>
            <p>Available across India. COD handling fee: ₹99 per order.</p>
          </section>

          <section className={styles.section}>
            <h2>5. Order Processing</h2>
            <p>Orders are processed within 1–2 business days. Orders placed on weekends/holidays processed next business day.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Tracking</h2>
            <p>You will receive tracking information via email once your order is dispatched.</p>
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
