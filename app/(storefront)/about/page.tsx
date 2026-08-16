import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About | REVIVE FIGHT CLUB',
  description: 'The story behind Revive Fight Club — premium combat sports gear built for fighters who demand the best.',
};

const VALUES = [
  { icon: '⚔️', title: 'Built for the Fight', desc: 'Every product is engineered for the demands of real training and real competition. No compromises.' },
  { icon: '🏆', title: 'Pro-Grade Quality', desc: 'We source and test our gear to the same standards used in professional fight camps around the world.' },
  { icon: '🤝', title: 'Fighter First', desc: 'Our team are fighters. We understand what you need because we train with the same gear we sell.' },
  { icon: '🌍', title: 'Made to Last', desc: 'Quality gear that lasts years, not months. Better for your wallet and better for the planet.' },
];

const STATS = [
  { number: '10,000+', label: 'Fighters Trust Us' },
  { number: '50+', label: 'Products' },
  { number: '4.9★', label: 'Average Rating' },
  { number: '2020', label: 'Founded' },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>OUR STORY</p>
          <h1 className={styles.heroTitle}>
            Built for<br />
            <span className={styles.heroRed}>The Fight.</span>
          </h1>
          <p className={styles.heroSub}>
            Revive Fight Club was born out of frustration — quality combat sports gear was either imported at sky-high prices
            or cheap gear that fell apart after a month of hard training. We built RFC to fix that.
          </p>
          <span className={styles.heroLine} aria-hidden="true" />
        </div>
      </div>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statNumber}>{s.number}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionBox}>
            <div className={styles.missionContent}>
              <span className={styles.missionEyebrow}>OUR MISSION</span>
              <h2 className={styles.missionTitle}>Democratise Professional Fight Gear</h2>
              <p className={styles.missionText}>
                We believe every fighter — from a beginner stepping into their first gym to a seasoned competitor — deserves
                access to the same quality gear that professionals train with. RFC is that access.
              </p>
              <p className={styles.missionText}>
                Every product in our catalogue has been tested in real training sessions by real fighters.
                If it doesn&apos;t make the cut in the gym, it doesn&apos;t make it to our store.
              </p>
            </div>
            <div className={styles.missionQuote}>
              <blockquote className={styles.quote}>
                &ldquo;Train harder. Fight smarter. Gear up with RFC.&rdquo;
              </blockquote>
              <cite className={styles.quoteAuthor}>— Revive Fight Club</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What We Stand For</h2>
          <div className={styles.valuesGrid}>
            {VALUES.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>
              Join <span className={styles.ctaTitleAccent}>the Fight</span>
            </h2>
            <p className={styles.ctaDesc}>Professional grade gear. Fighter tested. RFC approved.</p>
            <Link href="/shop" className={styles.ctaBtn}>SHOP NOW</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
