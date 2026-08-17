/**
 * RFC Store — Trust Bar
 *
 * 4 value propositions in a compact horizontal row.
 * Polished: emoji replaced with authored SVGs (craft-floor requirement).
 */
import styles from './TrustBar.module.css';

const TRUST_ITEMS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="16" r="1"/>
      </svg>
    ),
    title: 'Free Shipping',
    desc: 'On all orders above ₹999',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
    ),
    title: 'Easy Returns',
    desc: '7-day hassle-free returns',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: '100% Authentic',
    desc: 'Pro-grade verified gear',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
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
            <span className={styles.icon}>{item.icon}</span>
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
