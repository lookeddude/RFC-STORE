/**
 * RFC Store — Trust Bar
 *
 * 4 value propositions in a compact horizontal row.
 * Light surface (white). Between New Arrivals and Editorial.
 */
import styles from './TrustBar.module.css';

const TRUST_ITEMS = [
  {
    icon: '🚚',
    title: 'Free Shipping',
    desc: 'On all orders above ₹999',
  },
  {
    icon: '🔄',
    title: 'Easy Returns',
    desc: '7-day hassle-free returns',
  },
  {
    icon: '🛡️',
    title: '100% Authentic',
    desc: 'Pro-grade verified gear',
  },
  {
    icon: '⚡',
    title: 'Fast Dispatch',
    desc: 'Ships within 24 hours',
  },
];

export function TrustBar() {
  return (
    <div className={styles.bar} aria-label="Why shop RFC Store">
      <ul className={styles.list} role="list">
        {TRUST_ITEMS.map((item, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">{item.icon}</span>
            <div className={styles.text}>
              <strong className={styles.title}>{item.title}</strong>
              <span className={styles.desc}>{item.desc}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
