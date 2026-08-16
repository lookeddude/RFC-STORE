import styles from './BrandStory.module.css';

export function BrandStory() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.content}>
            <span className={styles.eyebrow}>Our Ethos</span>
            <h2 className={styles.heading}>Built Different</h2>
            <p className={styles.description}>
              We don&apos;t do compromises. Our gear is forged in the fires of discipline and crafted for those who refuse to quit. Every stitch, every pad, every glove is built for the arena.
            </p>
            
            <div className={styles.pillars}>
              <div className={styles.pillar}>
                <h3 className={styles.pillarTitle}>Fight-Tested</h3>
                <p className={styles.pillarText}>Proven in championship rounds and grueling training camps by elite fighters.</p>
              </div>
              <div className={styles.pillar}>
                <h3 className={styles.pillarTitle}>Built to Last</h3>
                <p className={styles.pillarText}>Premium materials and uncompromising craftsmanship that endure year after year.</p>
              </div>
              <div className={styles.pillar}>
                <h3 className={styles.pillarTitle}>No Compromise</h3>
                <p className={styles.pillarText}>We never cut corners. When you step into the ring, your gear is the last thing you should worry about.</p>
              </div>
            </div>
          </div>
          
          <div className={styles.imageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1200&auto=format&fit=crop"
              alt="Fighter training in RFC gear" 
              className={styles.image}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
