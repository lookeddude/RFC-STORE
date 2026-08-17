'use client';

/**
 * RFC Store — Hero Slideshow v3
 * Fresh frontend. All data comes from Supabase via admin panel.
 * Backend: hero_slides table (unchanged).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HeroSlide } from '@/types/hero-slide';
import s from './HeroSlideshowClient.module.css';

interface Props { slides: HeroSlide[]; }

/* ─── speed map ─────────────────────────────────────────── */
const SPEED: Record<string, number> = { fast: 280, normal: 520, slow: 860 };

export function HeroSlideshowClient({ slides }: Props) {
  const [idx, setIdx]     = useState(0);
  const [prev, setPrev]   = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const slide  = slides[idx];

  /* ── Navigation ──────────────────────────────────────── */
  const goTo = useCallback((next: number) => {
    setPrev(idx);
    setIdx(next);
    // clear prev after animation completes
    const ms = SPEED[slides[idx]?.transitionSpeed ?? 'normal'] ?? 520;
    setTimeout(() => setPrev(null), ms + 80);
  }, [idx, slides]);

  const next = useCallback(() => goTo((idx + 1) % slides.length), [goTo, idx, slides.length]);
  const prev_ = useCallback(() => goTo((idx - 1 + slides.length) % slides.length), [goTo, idx, slides.length]);

  /* ── Autoplay ─────────────────────────────────────────── */
  useEffect(() => {
    if (!slide?.autoplay || paused || slides.length < 2) return;
    const t = setInterval(next, slide.slideDuration ?? 5000);
    return () => clearInterval(t);
  }, [idx, paused, slide, slides.length, next]);

  /* ── Keyboard ─────────────────────────────────────────── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev_();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [next, prev_]);

  /* ── Touch ────────────────────────────────────────────── */
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const d = touchX.current - e.changedTouches[0].clientX;
    if (d > 48) next();
    else if (d < -48) prev_();
    touchX.current = null;
  };

  if (!slides.length) return null;

  const src  = (sl: HeroSlide) => sl.desktopImageUrl ?? sl.tabletImageUrl ?? sl.mobileImageUrl ?? '';
  const msrc = (sl: HeroSlide) => sl.mobileImageUrl  ?? sl.tabletImageUrl ?? sl.desktopImageUrl ?? '';

  return (
    <section
      className={s.root}
      aria-label="Hero slideshow"
      onMouseEnter={() => slide?.pauseOnHover && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slide stack ────────────────────────────────── */}
      {slides.map((sl, i) => {
        const isActive  = i === idx;
        const isPrev    = i === prev;
        const speed     = SPEED[sl.transitionSpeed ?? 'normal'] ?? 520;
        const tClass    = s[`t_${sl.transitionStyle ?? 'fade'}`] ?? s.t_fade;

        return (
          <div
            key={sl.id}
            className={[
              s.slide,
              tClass,
              isActive ? s.active : '',
              isPrev   ? s.leaving : '',
            ].join(' ')}
            style={{ '--spd': `${speed}ms` } as React.CSSProperties}
            aria-hidden={!isActive}
          >
            {/* Background — Next.js Image for LCP optimisation */}
            {src(sl) && (
              <Image
                src={src(sl)}
                alt={sl.desktopImageAlt ?? sl.heading}
                fill
                sizes="(max-width: 767px) 100vw, 100vw"
                className={s.img}
                priority={i === 0}   /* LCP element: preload first slide */
                loading={i === 0 ? undefined : 'lazy'}
                style={{ objectFit: 'cover', objectPosition: i === 0 ? 'center 20%' : undefined }}
              />
            )}

            {/* Scrim */}
            <div className={`${s.scrim} ${s[`scrim_${sl.overlayStrength ?? 'medium'}`]}`} />

            {/* Text */}
            <div className={[
              s.content,
              s[`pos_${sl.textPosition ?? 'left'}`],
            ].join(' ')}>
              <div className={[
                s.box,
                s[`align_${sl.textAlignment ?? 'left'}`],
              ].join(' ')}>
                {sl.eyebrow && <p className={s.eyebrow}>{sl.eyebrow}</p>}
                <h1 className={s.heading}>{sl.heading}</h1>
                {sl.description && <p className={s.desc}>{sl.description}</p>}
                {(sl.primaryButtonText || sl.secondaryButtonText) && (
                  <div className={s.btns}>
                    {sl.primaryButtonText && sl.primaryButtonUrl && (
                      <Link href={sl.primaryButtonUrl} className={s.btnA}>
                        {sl.primaryButtonText}
                      </Link>
                    )}
                    {sl.secondaryButtonText && sl.secondaryButtonUrl && (
                      <Link href={sl.secondaryButtonUrl} className={s.btnB}>
                        {sl.secondaryButtonText}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Controls ───────────────────────────────────── */}
      {slides.length > 1 && (
        <>
          {/* Prev arrow */}
          <button className={`${s.arr} ${s.arrL}`} onClick={prev_} aria-label="Previous slide" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          {/* Next arrow */}
          <button className={`${s.arr} ${s.arrR}`} onClick={next} aria-label="Next slide" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          {/* Progress dots */}
          <div className={s.dots} role="tablist">
            {slides.map((sl, i) => (
              <button
                key={sl.id}
                className={`${s.dot} ${i === idx ? s.dotOn : ''}`}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Slide ${i + 1}`}
                type="button"
              />
            ))}
          </div>

          {/* Autoplay progress bar */}
          {slide?.autoplay && !paused && (
            <div className={s.progressWrap}>
              <div
                key={idx}
                className={s.progress}
                style={{ animationDuration: `${slide.slideDuration ?? 5000}ms` }}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
