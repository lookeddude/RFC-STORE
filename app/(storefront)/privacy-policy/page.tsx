import type { Metadata } from 'next';
import styles from './privacy-policy.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy — Revive Fight Club',
  description: 'How Revive Fight Club collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.category}>LEGAL</p>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.updated}>Last updated: August 2026</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Information We Collect</h2>
            <p>When you shop with Revive Fight Club, we collect the following information:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and phone number when you register or place an order.</li>
              <li><strong>Order Information:</strong> Shipping address, order history, and payment method (Cash on Delivery or online payment via Razorpay).</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and pages visited on our website via standard server logs.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To process and deliver your orders.</li>
              <li>To send order confirmation and shipping updates via email.</li>
              <li>To respond to your customer service enquiries.</li>
              <li>To improve our website and product offerings.</li>
            </ul>
            <p>We do <strong>not</strong> sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section className={styles.section}>
            <h2>3. Data Storage & Security</h2>
            <p>Your data is securely stored using Supabase (PostgreSQL), hosted on AWS infrastructure with enterprise-grade encryption. We use Row-Level Security to ensure your account data is accessible only to you.</p>
            <p>Passwords are managed by Supabase Auth and are never stored in plain text.</p>
          </section>

          <section className={styles.section}>
            <h2>4. Payment Processing</h2>
            <p>When you pay online, your payment details are processed by Razorpay, a PCI-DSS compliant payment gateway. Revive Fight Club does not store card numbers, UPI credentials, or banking passwords. We only store payment confirmation references (transaction IDs) for order reconciliation.</p>
          </section>

          <section className={styles.section}>
            <h2>5. Cookies</h2>
            <p>We use essential session cookies for authentication and cart persistence. We do not use third-party advertising or tracking cookies.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Your Rights</h2>
            <ul>
              <li>You may request access to your personal data at any time.</li>
              <li>You may request deletion of your account and associated data.</li>
              <li>You may update your profile information from your account dashboard.</li>
            </ul>
            <p>To exercise these rights, email us at <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a>.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Contact</h2>
            <p>Revive Fight Club<br />
            Email: <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a><br />
            For privacy-related queries, please mention &quot;Privacy&quot; in your subject line.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
