"use client";
/**
 * RFC Store — Product Image Gallery
 *
 * Stitch design:
 *   - 4:5 aspect ratio main image (white bg, clean studio look)
 *   - Horizontal thumbnail strip below (click or keyboard to switch)
 *   - Keyboard: ArrowLeft / ArrowRight navigation
 *   - Touch swipe support on mobile
 *   - Active thumbnail: coral red border
 *   - Badge top-left: NEW / BEST SELLER / SALE
 *   - Smooth fade transition between images
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/product";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  badge?: { label: string; variant: "sale" | "badge" } | null;
}

export function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const activeImage = images[activeIdx] ?? null;
  const hasMultiple = images.length > 1;

  const goTo = useCallback(
    (idx: number) => setActiveIdx(Math.max(0, Math.min(idx, images.length - 1))),
    [images.length]
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(activeIdx - 1);
      if (e.key === "ArrowRight") goTo(activeIdx + 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIdx, goTo]);

  // Touch swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? activeIdx + 1 : activeIdx - 1);
    touchStartX.current = null;
  }

  return (
    <div className={styles.gallery}>
      {/* Main Image */}
      <div
        className={styles.main}
        role="img"
        aria-label={activeImage?.altText ?? `${productName} product image`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {badge && (
          <div className={styles.badge} data-variant={badge.variant} aria-label={badge.label}>
            {badge.label}
          </div>
        )}

        {activeImage ? (
          <Image
            key={activeImage.id}
            src={activeImage.url}
            alt={activeImage.altText ?? `${productName} — RFC Store`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
            className={styles.mainImage}
            priority
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <span>RFC</span>
          </div>
        )}

        {/* Arrow navigation for multiple images */}
        {hasMultiple && (
          <>
            <button
              className={styles.arrow}
              data-dir="prev"
              onClick={() => goTo(activeIdx - 1)}
              disabled={activeIdx === 0}
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
            <button
              className={styles.arrow}
              data-dir="next"
              onClick={() => goTo(activeIdx + 1)}
              disabled={activeIdx === images.length - 1}
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div className={styles.thumbs} role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.id}
              className={styles.thumb}
              data-active={i === activeIdx}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} view ${i + 1}`}
                fill
                sizes="80px"
                className={styles.thumbImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
