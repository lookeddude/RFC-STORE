import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './training.module.css';

export const metadata: Metadata = {
  title: 'Training | REVIVE FIGHT CLUB',
  description: 'Combat sports training guides, tips and techniques for boxing, MMA, Muay Thai and kickboxing.',
};

const TRAINING_GUIDES = [
  {
    discipline: 'Boxing',
    icon: '🥊',
    tag: 'BEGINNER — ADVANCED',
    title: 'The Complete Boxing Fundamentals Guide',
    desc: 'Master the jab, cross, hook and uppercut. Build the foundation every boxer needs — footwork, guard, head movement and punch combinations.',
    tips: ['Start every session with 10 min shadow boxing', 'Never skip hand wrapping — protect your hands', 'Work the slip rope daily for head movement'],
    accentColor: '#E63946',
  },
  {
    discipline: 'MMA',
    icon: '🤼',
    tag: 'INTERMEDIATE — ADVANCED',
    title: 'MMA Conditioning & Grappling Drills',
    desc: 'Build the gas tank, strength and technical grappling skills that separate average fighters from champions. 12-week structured program.',
    tips: ['3x weekly strength + conditioning sessions', 'Drill takedown entries for 15 min every session', 'Finish every training with 10 min of drilling submissions'],
    accentColor: '#ff6b35',
  },
  {
    discipline: 'Muay Thai',
    icon: '🦵',
    tag: 'ALL LEVELS',
    title: 'Muay Thai Striking System — 8 Limbs',
    desc: 'Learn the art of the 8 limbs. Punches, kicks, elbows and knees. The complete striking system used by champions across Southeast Asia.',
    tips: ['Kick the bag 200 times each leg daily', 'Clinch work is 40% of Muay Thai — never skip it', 'Develop your push kick (teep) as your primary weapon'],
    accentColor: '#ffd700',
  },
  {
    discipline: 'Kickboxing',
    icon: '🦶',
    tag: 'BEGINNER — INTERMEDIATE',
    title: 'Kickboxing Power & Speed Development',
    desc: 'Build explosive kicks and devastating punch combinations. The kickboxing system for fighters who want knockout power with elite cardio.',
    tips: ['Stretch hip flexors 15 min before every kick session', 'Shadowbox in front of a mirror to fix technique', 'Work combination drills on pads 3x per week'],
    accentColor: '#00b4d8',
  },
];

const TRAINING_PRINCIPLES = [
  { number: '01', title: 'Consistency Over Intensity', desc: 'Train 5 days a week at 80% effort rather than 2 days at 100%. Champions are built through consistency.' },
  { number: '02', title: 'Technique First', desc: 'Bad habits formed early are hard to break. Master the fundamentals before adding power or speed.' },
  { number: '03', title: 'Recovery Is Training', desc: 'Sleep 8 hours. Eat enough protein. Your body grows stronger during rest, not during training.' },
  { number: '04', title: 'Invest In Your Gear', desc: 'Professional gear protects your body and enhances performance. Never compromise on quality.' },
];

export default function TrainingPage() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <div className={styles.hero}>
        <p className={styles.eyebrow}>REVIVE FIGHT CLUB</p>
        <h1 className={styles.heroTitle}>Train Like a<br /><span className={styles.heroRed}>Champion</span></h1>
        <p className={styles.heroSub}>Combat sports training guides, techniques and principles from the world of professional fighting.</p>
        <Link href="/shop" className={styles.heroCta}>SHOP TRAINING GEAR</Link>
      </div>

      {/* Training Principles */}
      <section className={styles.principlesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>4 Principles Every Fighter Lives By</h2>
          <div className={styles.principlesGrid}>
            {TRAINING_PRINCIPLES.map((p) => (
              <div key={p.number} className={styles.principleCard}>
                <span className={styles.principleNumber}>{p.number}</span>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className={styles.principleDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Guides */}
      <section className={styles.guidesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Discipline Training Guides</h2>
          <div className={styles.guidesGrid}>
            {TRAINING_GUIDES.map((guide) => (
              <article
                key={guide.discipline}
                className={styles.guideCard}
                style={{ '--accent': guide.accentColor } as React.CSSProperties}
              >
                <div className={styles.guideHeader}>
                  <span className={styles.guideIcon}>{guide.icon}</span>
                  <div>
                    <span className={styles.guideTag}>{guide.tag}</span>
                    <h3 className={styles.guideTitle}>{guide.title}</h3>
                  </div>
                </div>
                <p className={styles.guideDesc}>{guide.desc}</p>
                <ul className={styles.guideTips}>
                  {guide.tips.map((tip, i) => (
                    <li key={i} className={styles.guideTip}>
                      <span className={styles.tipDot} aria-hidden="true" />
                      {tip}
                    </li>
                  ))}
                </ul>
                <div className={styles.guideAccentBar} aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.container}>
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Ready to Train Harder?</h2>
            <p className={styles.ctaDesc}>Get the gear that professionals trust. Free shipping on orders above ₹999.</p>
            <Link href="/shop" className={styles.ctaBtn}>SHOP ALL GEAR</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
