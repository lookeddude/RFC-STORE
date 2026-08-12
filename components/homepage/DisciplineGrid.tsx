/**
 * RFC Store — Discipline Grid (Shop by Discipline)
 *
 * Bento-style grid: 4 combat sport categories.
 * Boxing spans large (2×2), MMA and Muay Thai are medium (1×1),
 * Training Gear spans wide (2×1) — matching the Stitch grid layout.
 *
 * Content from DISCIPLINES in homepage.content.ts.
 * All items are links to their category pages.
 * Image hover: subtle scale-up zoom.
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DISCIPLINES } from "@/lib/content/homepage.content";
import type { Discipline } from "@/lib/content/homepage.content";
import styles from "./DisciplineGrid.module.css";
import { cn } from "@/lib/utils/cn";

export function DisciplineGrid() {
  return (
    <section className={styles.section} aria-labelledby="discipline-heading">
      {/* Section Header */}
      <div className={styles.header}>
        <h2 id="discipline-heading" className={styles.heading}>
          Shop by Discipline
        </h2>
        <Link href="/categories" className={styles.viewAll} aria-label="View all categories">
          VIEW ALL CATEGORIES
          <ArrowIcon />
        </Link>
      </div>

      {/* Bento Grid */}
      <div className={styles.grid} role="list">
        {DISCIPLINES.map((discipline) => (
          <DisciplineCard key={discipline.slug} discipline={discipline} />
        ))}
      </div>
    </section>
  );
}

/* ── Discipline Card ─────────────────────────────────────── */

function DisciplineCard({ discipline }: { discipline: Discipline }) {
  const { title, description, href, image, gridSize } = discipline;

  return (
    <Link
      href={href}
      className={cn(styles.card, styles[`card--${gridSize}`])}
      role="listitem"
      aria-label={`Shop ${title}`}
    >
      {/* Background Image */}
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
        className={styles.cardImage}
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className={styles.gradient} aria-hidden="true" />

      {/* Text */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {description && (
          <p className={styles.cardDesc}>{description}</p>
        )}
      </div>
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, transition: "transform 200ms ease" }}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
