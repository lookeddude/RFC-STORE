'use client';

/**
 * RFC Store — Hero Slideshow (Complete Rewrite)
 *
 * Clean, responsive hero carousel with:
 *  - Mobile: full image, text anchored to bottom-left, bottom-to-top gradient
 *  - Desktop: full image, text left/center/right, left-to-right gradient
 *  - Autoplay + pause-on-hover
 *  - Touch swipe (mobile)
 *  - Keyboard arrow navigation
 *  - Dot indicators + prev/next arrows
 *  - All slide fields supported: eyebrow, heading, description,
 *    primaryBtn, secondaryBtn, overlayStrength, textPosition,
 *    transitionStyle, transitionSpeed, slideDuration
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HeroSlide } from '@/types/hero-slide';
import styles from './HeroSlideshowClient.module.css';

interface Props {
  slides: HeroSlide[];
}

export function HeroSlideshowClient({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const touchStart             = useRef<number | null>(null);

  const slide = slides[current];

  const goTo     = useCallback((i: number) => setCurrent(i), []);
  const goNext   = useCallback(() => setCurrent(p => (p + 1) % slides.length), [slides.length]);
  const goPrev   = useCallback(() => setCurrent(p => (p - 1 + slides.length) % slides.length), [slides.length]);

  /* ── Autoplay ──────────────────────────────────────────── */
  useEffect(() => {
    if (!slide?.autoplay || paused || slides.length < 2) return;
    const t = setInterval(goNext, slide.slideDuration ?? 5000);
    return () => clearInterval(t);
  }, [current, paused, slide, slides.length, goNext]);

  /* ── Keyboard ──────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  /* ── Touch swipe ───────────────────────────────────────── */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 50)  goNext();
    if (diff < -50) goPrev();
    touchStart.current = null;
  };

  if (!slides.length) return null;

  /* ── Image sources ─────────────────────────────────────── */
  const getImg = (s: HeroSlide) =>
    s.desktopImageUrl ?? s.tabletImageUrl ?? s.mobileImageUrl ?? '';
  const getMobileImg = (s: HeroSlide) =>
    s.mobileImageUrl ?? s.tabletImageUrl ?? s.desktopImageUrl ?? '';

  /* ── Transition speed ──────────────────────────────────── */
  const speedMs = { fast: 300, normal: 550, slow: 900 }[slide.transitionSpeed ?? 'normal'] ?? 550;

  /* ── Text alignment class ──────────────────────────────── */
  const alignClass = {
    left:   styles.alignLeft,
    center: styles.alignCenter,
    right:  styles.alignRight,
  }[slide.textAlignment ?? 'left'] ?? styles.alignLeft;

  const posClass = {
    left:   styles.posLeft,
    center: styles.posCenter,
    right:  styles.posRight,
  }[slide.textPosition ?? 'left'] ?? styles.posLeft;

  return (
    <section
      className={styles.hero}
      aria-label="Hero slideshow"
      onMouseEnter={() => slide?.pauseOnHover && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slides ── */}
      {slides.map((s, i) => {
        const isActive = i === current;
        const transitionClass = {
          fade:      styles.transFade,
          slide:     styles.transSlide,
          crossfade: styles.transFade,
          zoom:      styles.transZoom,
          none:      styles.transNone,
        }[s.transitionStyle ?? 'fade'] ?? styles.transFade;

        return (
          <div
            key={s.id}
            className={`${styles.slide} ${transitionClass} ${isActive ? styles.slideActive : ''}`}
            style={{ '--speed': `${speedMs}ms` } as React.CSSProperties}
            aria-hidden={!isActive}
          >
            {/* Background image — <picture> for responsive sources */}
            {getImg(s) && (
              <picture className={styles.picture}>
                <source media="(max-width: 767px)" srcSet={getMobileImg(s)} />
                <img
                  src={getImg(s)}
                  alt={s.desktopImageAlt ?? s.heading}
                  className={styles.img}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined}
                />
              </picture>
            )}

            {/* Overlay */}
            <div className={`${styles.overlay} ${styles[`overlay${s.overlayStrength?.charAt(0).toUpperCase()}${s.overlayStrength?.slice(1)}` as keyof typeof styles] ?? styles.overlayMedium}`} />

            {/* Text content */}
            <div className={`${styles.content} ${posClass}`}>
              <div className={`${styles.textBox} ${alignClass}`}>
                {s.eyebrow && (
                  <p className={styles.eyebrow}>{s.eyebrow}</p>
                )}

                <h1 className={styles.heading}>{s.heading}</h1>

                {s.description && (
                  <p className={styles.description}>{s.description}</p>
                )}

                {(s.primaryButtonText || s.secondaryButtonText) && (
                  <div className={styles.buttons}>
                    {s.primaryButtonText && s.primaryButtonUrl && (
                      <Link href={s.primaryButtonUrl} className={styles.btnPrimary}>
                        {s.primaryButtonText}
                      </Link>
                    )}
                    {s.secondaryButtonText && s.secondaryButtonUrl && (
                      <Link href={s.secondaryButtonUrl} className={styles.btnSecondary}>
                        {s.secondaryButtonText}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Prev / Next arrows (hidden when only 1 slide) ── */}
      {slides.length > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={goPrev}
            aria-label="Previous slide"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={goNext}
            aria-label="Next slide"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {slides.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Slide indicators">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      )}

      {/* ── Scroll cue ── */}
      <div className={styles.scrollCue} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
