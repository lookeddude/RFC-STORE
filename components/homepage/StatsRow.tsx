/**
 * RFC Store — StatsRow (Client Component)
 *
 * Triggers a staggered entrance on the editorial stats when they
 * scroll into view. Uses IntersectionObserver + CSS classes.
 *
 * No animation library — pure CSS transitions toggled by data-attribute.
 * prefers-reduced-motion: skips the entrance, renders final state.
 */
'use client';

import { useEffect, useRef } from 'react';
import styles from './StatsRow.module.css';

interface Stat {
  value: string;
  label: string;
}

interface StatsRowProps {
  stats: Stat[];
  className?: string;
}

export function StatsRow({ stats, className }: StatsRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    // If reduced motion, skip animation — render final state immediately
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      el.querySelectorAll('[data-stat]').forEach((item) => {
        (item as HTMLElement).setAttribute('data-visible', 'true');
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const items = el.querySelectorAll('[data-stat]');
          items.forEach((item, i) => {
            setTimeout(() => {
              (item as HTMLElement).setAttribute('data-visible', 'true');
            }, i * 90); // 90ms stagger per stat
          });
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rowRef} className={[styles.stats, className].filter(Boolean).join(` `)}>
      {stats.map((stat, i) => (
        <div key={i} className={styles.stat} data-stat data-visible="false">
          <p className={styles.statValue}>{stat.value}</p>
          <p className={styles.statLabel}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
