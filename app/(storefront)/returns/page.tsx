import type { Metadata } from 'next';
import styles from './returns.module.css';

export const metadata: Metadata = {
  title: 'Returns, Replacement & Refund Policy — Revive Fight Club',
  description: 'Full returns, replacement and refund policy for RFC Store. 7-day returns, free replacement on damaged/wrong items, hassle-free process.',
};

export default function ReturnsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <p className={styles.category}>CUSTOMER POLICY</p>
          <h1 className={styles.title}>Returns, Replacement<br />&amp; Refund Policy</h1>
          <p className={styles.updated}>Last updated: August 2026</p>
          <p className={styles.intro}>
            At Revive Fight Club, we stand behind every product we sell. If something
            isn&apos;t right, we make it right — fast, no hassle.
          </p>
        </div>

        {/* Quick Summary Cards */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}>📦</span>
            <span className={styles.summaryNum}>7 Days</span>
            <span className={styles.summaryLabel}>Return Window</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}>🔄</span>
            <span className={styles.summaryNum}>Free</span>
            <span className={styles.summaryLabel}>Replacement on Damage</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}>💳</span>
            <span className={styles.summaryNum}>5–7 Days</span>
            <span className={styles.summaryLabel}>Refund Processing</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}>📧</span>
            <span className={styles.summaryNum}>48 Hours</span>
            <span className={styles.summaryLabel}>Damage Report Window</span>
          </div>
        </div>

        <div className={styles.content}>

          {/* Section 1 */}
          <section className={styles.section}>
            <h2>1. Return Window</h2>
            <p>
              You may initiate a return within <strong>7 calendar days</strong> from
              the date of delivery. Requests raised after 7 days will not be accepted
              unless the item is damaged or incorrect (see Section 7).
            </p>
          </section>

          {/* Section 2 */}
          <section className={styles.section}>
            <h2>2. Eligible Items for Return</h2>
            <p>To qualify for a return, the item must be:</p>
            <ul>
              <li>Unused and in the same condition as received</li>
              <li>In its original packaging with all tags intact</li>
              <li>Accompanied by proof of purchase (order number)</li>
              <li>Not marked as a non-returnable item (see Section 3)</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className={styles.section}>
            <h2>3. Non-Returnable Items</h2>
            <p>The following items <strong>cannot</strong> be returned:</p>
            <ul>
              <li>Items that have been used, worn, or washed</li>
              <li>Apparel without original tags or packaging</li>
              <li>Customised or personalised products</li>
              <li>Gloves, hand wraps, mouthguards, or any protective gear that has made contact with skin (hygiene reasons)</li>
              <li>Items purchased during clearance or final-sale events (clearly marked at time of purchase)</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className={styles.section}>
            <h2>4. How to Initiate a Return</h2>
            <p>Follow these steps to raise a return request:</p>
            <ul>
              <li><strong>Step 1 —</strong> Email us at <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a> within 7 days of delivery</li>
              <li><strong>Step 2 —</strong> Include your order number, the item(s) you wish to return, and the reason for the return</li>
              <li><strong>Step 3 —</strong> Attach clear photographs of the item in its current condition</li>
              <li><strong>Step 4 —</strong> Our team will review and respond within 1–2 business days with return instructions</li>
              <li><strong>Step 5 —</strong> Ship the item back using a trackable courier at your own cost (unless the return is due to our error)</li>
            </ul>
            <p>
              <strong>Note:</strong> Do not ship items back without receiving written approval from our team. Unapproved returns will not be processed.
            </p>
          </section>

          {/* Section 5 */}
          <section className={styles.section}>
            <h2>5. Refunds — Online Payments (Razorpay)</h2>
            <p>
              If you paid online via Razorpay (UPI, card, net banking, etc.), once we
              receive and inspect the returned item, your refund will be processed to
              your <strong>original payment method</strong> within <strong>5–7 business days</strong>
              from the date of approval.
            </p>
            <p>
              You will receive an email confirmation once the refund has been initiated.
              Bank processing times may vary.
            </p>
            <p>
              <strong>Non-refundable charges:</strong> Shipping fees and payment gateway
              charges are not refunded.
            </p>
          </section>

          {/* Section 6 */}
          <section className={styles.section}>
            <h2>6. Refunds — Cash on Delivery (COD) Orders</h2>
            <p>
              For COD orders, refunds are processed via <strong>bank transfer (NEFT/IMPS)</strong>.
              You will need to provide your bank account details (account number, IFSC code,
              account holder name) when submitting your return request.
            </p>
            <p>
              Refunds will be initiated within <strong>5–7 business days</strong> after
              we receive and inspect the returned item.
            </p>
            <p>
              <strong>Non-refundable charges:</strong> The COD handling fee (₹99) and
              shipping charges are not refunded.
            </p>
          </section>

          {/* Section 7 */}
          <section className={styles.section}>
            <h2>7. Damaged, Defective or Wrong Items</h2>
            <p>
              If you receive an item that is damaged, defective, or different from what
              you ordered, we will replace it at <strong>no cost to you</strong>.
            </p>
            <p>To report a damaged or wrong item:</p>
            <ul>
              <li>Contact us within <strong>48 hours of delivery</strong></li>
              <li>Email <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a> with your order number</li>
              <li>Attach clear photos and/or an unboxing video showing the issue</li>
            </ul>
            <p>
              Reports raised after 48 hours of delivery will be assessed on a case-by-case
              basis and may not qualify for a free replacement.
            </p>
          </section>

          {/* Section 8 */}
          <section className={styles.section}>
            <h2>8. Exchanges &amp; Size Replacements</h2>
            <p>
              We currently process exchanges on a <strong>return-and-reorder</strong> basis.
              If you need a different size or colour:
            </p>
            <ul>
              <li>Initiate a return as per Section 4</li>
              <li>Once your return is approved, place a new order for the correct size/colour</li>
              <li>If stock is limited, contact us first and we will check availability</li>
            </ul>
            <p>
              Email <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a> with
              your order number and exchange details and we will assist you through the process.
            </p>
          </section>

          {/* Section 9 */}
          <section className={styles.section}>
            <h2>9. Return Shipping Costs</h2>
            <ul>
              <li><strong>Damaged / Wrong items:</strong> RFC covers the return shipping cost</li>
              <li><strong>Change of mind / Size issue:</strong> Customer bears the return shipping cost</li>
              <li>We recommend using a trackable shipping service. RFC is not responsible for items lost in return transit</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className={styles.section}>
            <h2>10. Contact Us</h2>
            <p>
              For any questions regarding returns, replacements, or refunds, reach out to our support team:
            </p>
            <ul>
              <li>Email: <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a></li>
              <li>Response time: 1–2 business days</li>
            </ul>
            <p>
              We are committed to making every RFC experience a positive one. If something
              isn&apos;t right, tell us — we will fix it.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
