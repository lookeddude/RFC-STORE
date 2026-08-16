import type { Metadata } from 'next';
import styles from './returns.module.css';

export const metadata: Metadata = {
  title: 'Returns & Refund Policy — Revive Fight Club',
  description: 'Returns and Refund Policy for Revive Fight Club.',
};

export default function ReturnsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.category}>LEGAL</p>
          <h1 className={styles.title}>Returns &amp; Refund Policy</h1>
          <p className={styles.updated}>Last updated: August 2026</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Return Window</h2>
            <p>7 days from delivery date.</p>
          </section>

          <section className={styles.section}>
            <h2>2. Eligible Items</h2>
            <p>Unused, original packaging, tags intact.</p>
          </section>

          <section className={styles.section}>
            <h2>3. Non-Returnable Items</h2>
            <p>Used gear, worn apparel, customised items.</p>
          </section>

          <section className={styles.section}>
            <h2>4. How to Return</h2>
            <p>Email <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a> with order number and photos.</p>
          </section>

          <section className={styles.section}>
            <h2>5. Refunds (Cash on Delivery)</h2>
            <p>Processed within 5-7 business days after we receive item. COD orders: refunded via bank transfer. Shipping fee and COD fee (₹99) are non-refundable.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Refund for Online Payments</h2>
            <p>If you paid online via Razorpay, refunds will be processed to your original payment method. Processing time: [CONFIRM: X-Y business days] from the date of refund approval.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Exchanges</h2>
            <p>Exchanges require contacting support. Please email <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a> with your order number and exchange details.</p>
          </section>

          <section className={styles.section}>
            <h2>8. Damaged / Wrong Items</h2>
            <p>We replace at no cost, contact within 48 hours of delivery.</p>
          </section>

          <section className={styles.section}>
            <h2>9. Contact</h2>
            <p>Email: <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
