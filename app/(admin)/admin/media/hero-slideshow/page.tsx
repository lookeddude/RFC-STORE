'use client';

/**
 * RFC Store — Admin Hero Slideshow Manager
 *
 * Slide List View with drag-and-drop reordering, status toggles,
 * duplicating, and instant deletion.
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  setHeroSlideStatusAction,
  deleteHeroSlideAction,
  duplicateHeroSlideAction,
  reorderHeroSlidesAction,
} from "@/lib/actions/admin/hero-slides";
import type { HeroSlide } from "@/types/hero-slide";
import styles from "./slideshow.module.css";

export default function AdminHeroSlideshowPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const loadSlides = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/hero-slides");
      if (res.ok) {
        const data = await res.json();
        setSlides(data.slides ?? []);
      }
    } catch {
      // silent catch
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    const res = await setHeroSlideStatusAction(id, nextStatus);
    if (res.success) {
      setSlides((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
      );
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateHeroSlideAction(id);
    if (res.success) {
      await loadSlides();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteHeroSlideAction(id);
    if (res.success) {
      setSlides((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSlides = [...slides];
    const item = newSlides.splice(draggedIndex, 1)[0];
    newSlides.splice(index, 0, item);
    setSlides(newSlides);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    const orderedIds = slides.map((s) => s.id);
    await reorderHeroSlidesAction(orderedIds);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Homepage Hero Slideshow</h1>
          <p className={styles.subtitle}>
            Control public homepage hero slides, images, timing, and order.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/media/hero-slideshow/new" className={styles.addBtn}>
            + Add New Slide
          </Link>
        </div>
      </div>

      {/* List / Empty State */}
      {isLoading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#6b7280" }}>
          Loading slideshow items...
        </div>
      ) : slides.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect width="18" height="14" x="3" y="5" rx="2"/>
              <path d="m10 9 5 3-5 3V9z"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>No homepage slides configured</p>
          <p className={styles.emptyDesc}>
            Create your first hero slide to customize the homepage background, copy, and CTAs.
          </p>
          <Link href="/admin/media/hero-slideshow/new" className={styles.addBtn} style={{ marginTop: 12 }}>
            + Create First Slide
          </Link>
        </div>
      ) : (
        <ul className={styles.slideList}>
          {slides.map((slide, index) => {
            const hasDesktop = !!slide.desktopImageUrl;
            const hasTablet = !!slide.tabletImageUrl;
            const hasMobile = !!slide.mobileImageUrl;

            let badgeVariant: "success" | "warning" | "neutral" = "neutral";
            if (slide.status === "published") badgeVariant = "success";
            if (slide.status === "draft") badgeVariant = "warning";

            return (
              <li
                key={slide.id}
                className={`${styles.slideCard} ${draggedIndex === index ? styles.dragging : ""}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Drag Handle */}
                <div className={styles.dragHandle} title="Drag to reorder">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="6" r="1"/>
                    <circle cx="15" cy="6" r="1"/>
                    <circle cx="9" cy="12" r="1"/>
                    <circle cx="15" cy="12" r="1"/>
                    <circle cx="9" cy="18" r="1"/>
                    <circle cx="15" cy="18" r="1"/>
                  </svg>
                </div>

                {/* Thumbnail */}
                <div className={styles.thumbWrap}>
                  {slide.desktopImageUrl || slide.tabletImageUrl || slide.mobileImageUrl ? (
                    <Image
                      src={(slide.desktopImageUrl || slide.tabletImageUrl || slide.mobileImageUrl)!}
                      alt={slide.internalName}
                      fill
                      className={styles.thumbImg}
                      unoptimized
                    />
                  ) : (
                    <span className={styles.thumbPlaceholder}>🥊</span>
                  )}
                </div>

                {/* Info */}
                <div className={styles.slideMeta}>
                  <p className={styles.slideName}>{slide.internalName}</p>
                  <div className={styles.slideDetails}>
                    <span>{slide.slideDuration / 1000}s duration</span>
                    <span>•</span>
                    <span style={{ textTransform: "capitalize" }}>{slide.transitionStyle} transition</span>
                    <span>•</span>
                    <div className={styles.deviceBadges}>
                      <span className={`${styles.deviceBadge} ${hasDesktop ? styles.deviceActive : styles.deviceMissing}`}>
                        Desktop {hasDesktop ? "✓" : "—"}
                      </span>
                      <span className={`${styles.deviceBadge} ${hasTablet ? styles.deviceActive : styles.deviceMissing}`}>
                        Tablet {hasTablet ? "✓" : "—"}
                      </span>
                      <span className={`${styles.deviceBadge} ${hasMobile ? styles.deviceActive : styles.deviceMissing}`}>
                        Mobile {hasMobile ? "✓" : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={styles.statusWrap}>
                  <AdminBadge label={slide.status} variant={badgeVariant} size="md" />
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button
                    className={styles.iconBtn}
                    title={slide.status === "published" ? "Unpublish slide" : "Publish slide"}
                    onClick={() => handleStatusToggle(slide.id, slide.status)}
                  >
                    {slide.status === "published" ? "👁️" : "🚀"}
                  </button>

                  <button
                    className={styles.iconBtn}
                    title="Duplicate slide"
                    onClick={() => handleDuplicate(slide.id)}
                  >
                    📋
                  </button>

                  <Link
                    href={`/admin/media/hero-slideshow/${slide.id}/edit`}
                    className={styles.editBtn}
                  >
                    Edit
                  </Link>

                  <ConfirmDialog
                    title="Delete Slide"
                    description={`Are you sure you want to delete "${slide.internalName}"? This action cannot be undone.`}
                    confirmLabel="Delete"
                    isDanger
                    onConfirm={() => handleDelete(slide.id)}
                    trigger={(open) => (
                      <button
                        className={`${styles.iconBtn} ${styles.dangerBtn}`}
                        title="Delete slide"
                        onClick={open}
                      >
                        🗑️
                      </button>
                    )}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
