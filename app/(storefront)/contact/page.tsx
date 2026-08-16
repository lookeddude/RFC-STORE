import type { Metadata } from 'next';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact Us — Revive Fight Club',
  description: 'Get in touch with Revive Fight Club for customer support, order inquiries, and grievance redressal.',
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.category}>SUPPORT</p>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.updated}>We are here to assist fighters and athletes.</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Customer Support</h2>
            <p>
              Have a question about our combat gear, training equipment, or need assistance with your purchase? Reach out to our team:
            </p>
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <span className={styles.contactCardLabel}>Email</span>
                <span className={styles.contactCardValue}>
                  <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a>
                </span>
              </div>
              <div className={styles.contactCard}>
                <span className={styles.contactCardLabel}>Phone</span>
                <span className={styles.contactCardValue}>[CONFIRM: phone number]</span>
              </div>
              <div className={styles.contactCard}>
                <span className={styles.contactCardLabel}>Instagram</span>
                <span className={styles.contactCardValue}>
                  <a
                    href="https://instagram.com/revivefightclub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @revivefightclub
                  </a>
                </span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>2. Order Inquiries</h2>
            <div className={styles.noticeBox}>
              <p>
                <strong>Notice:</strong> For order inquiries, please reference your order number.
              </p>
            </div>
            <p>
              Whether you are checking shipment status, requesting modifications before dispatch, or initiating an exchange, including your Order ID helps our support team assist you quickly.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Grievance Redressal</h2>
            <p>
              In accordance with the Consumer Protection (E-Commerce) Rules and applicable laws, consumer grievances may be escalated to:
            </p>
            <ul>
              <li><strong>Grievance Officer:</strong> [CONFIRM: name and contact] — resolve within 30 days</li>
              <li><strong>Email:</strong> <a href="mailto:revivefightclub@gmail.com">revivefightclub@gmail.com</a> (Please mention &quot;Grievance Officer&quot; in the subject line)</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
