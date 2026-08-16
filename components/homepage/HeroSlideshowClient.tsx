'use client';

/**
 * RFC Store — Hero Slideshow Client Engine
 *
 * Fully responsive carousel with:
 * - <picture> responsive device image fallback
 * - Touch swipe (mobile)
 * - Keyboard (← / →)
 * - Autoplay & Pause-on-hover
 * - Multiple transition styles & speeds
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { HeroSlide } from '@/types/hero-slide';
import styles from './HeroSlideshowClient.module.css';

interface HeroSlideshowClientProps {
  slides: HeroSlide[];
}

export function HeroSlideshowClient({ slides }: HeroSlideshowClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentSlide = slides[currentIndex] || slides[0];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay timer
  useEffect(() => {
    if (!currentSlide || !currentSlide.autoplay || isPaused || slides.length <= 1) {
      return;
    }

    const duration = currentSlide.slideDuration || 5000;
    const timer = setInterval(() => {
      goToNext();
    }, duration);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, currentSlide, slides.length, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;

    // Minimum 50px swipe threshold
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className={styles.slideshow}
      aria-label="Homepage Hero Carousel"
      onMouseEnter={() => currentSlide?.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.slideTrack}>
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const speedMs =
            slide.transitionSpeed === 'fast'
              ? 300
              : slide.transitionSpeed === 'slow'
              ? 900
              : 600;

          // Image fallback chain
          const desktopSrc = slide.desktopImageUrl || slide.tabletImageUrl || slide.mobileImageUrl;
          const tabletSrc = slide.tabletImageUrl || slide.desktopImageUrl || slide.mobileImageUrl;
          const mobileSrc = slide.mobileImageUrl || slide.tabletImageUrl || slide.desktopImageUrl;

          return (
            <div
              key={slide.id}
              className={`
                ${styles.slide}
                ${styles[`style-${slide.transitionStyle || 'fade'}`]}
                ${isActive ? styles.slideActive : ''}
              `}
              style={{ '--trans-speed': `${speedMs}ms` } as React.CSSProperties}
              aria-hidden={!isActive}
            >
              {/* Responsive Image via <picture> */}
              {desktopSrc && (
                <picture className={styles.pictureWrap}>
                  {/* Mobile portrait */}
                  <source media="(max-width: 767px)" srcSet={mobileSrc!} />
                  {/* Tablet */}
                  <source media="(max-width: 1023px)" srcSet={tabletSrc!} />
                  {/* Desktop */}
                  <img
                    src={desktopSrc}
                    alt={slide.desktopImageAlt || slide.heading}
                    className={styles.slideImage}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
              )}

              {/* Dynamic Overlay */}
              <div className={`${styles.overlay} ${styles[`overlay-${slide.overlayStrength || 'medium'}`]}`} />

              {/* Text Content */}
              <div className={`${styles.contentContainer} ${styles[`pos-${slide.textPosition || 'left'}`]}`}>
                <div className={`${styles.contentBox} ${styles[`align-${slide.textAlignment || 'left'}`]}`}>
                  {slide.eyebrow && <p className={styles.eyebrow}>{slide.eyebrow}</p>}

                  <h1 className={styles.heading}>{slide.heading}</h1>

                  {slide.description && <p className={styles.description}>{slide.description}</p>}

                  <div className={styles.btnGroup}>
                    {slide.primaryButtonText && slide.primaryButtonUrl && (
                      <Link href={slide.primaryButtonUrl} className={styles.btnPrimary}>
                        {slide.primaryButtonText}
                      </Link>
                    )}
                    {slide.secondaryButtonText && slide.secondaryButtonUrl && (
                      <Link href={slide.secondaryButtonUrl} className={styles.btnSecondary}>
                        {slide.secondaryButtonText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Only if multiple slides) */}
      {slides.length > 1 && (
        <div className={styles.navArrows}>
          <button
            onClick={goToPrev}
            className={styles.arrowBtn}
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className={styles.arrowBtn}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      )}

      {/* Navigation Progress & Dots */}
      {slides.length > 1 && (
        <div className={styles.progressWrapper}>
          <span className={styles.progressIndicator}>
            {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
          <div className={styles.dotsContainer}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
