/**
 * RFC Store — Hero Section
 *
 * Full-screen dark arena hero section.
 * Background image with 60% opacity overlay from MMA fighter shoot.
 * "BUILT FOR THE FIGHT." headline, subtext, two CTAs.
 *
 * Content: HERO_CONTENT from homepage.content.ts
 * Image: next/image with priority loading (above the fold)
 * Architecture: CMS-ready — replace HERO_CONTENT.image.src with CMS URL
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_CONTENT } from "@/lib/content/homepage.content";

export function HeroSection() {
  const { headline, subheadline, primaryCta, secondaryCta, image } =
    HERO_CONTENT;

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--color-primary)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
      aria-label="Hero — Built For The Fight"
    >
      {/* Background Image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.6 }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "var(--container-max)",
          marginInline: "auto",
          padding: "var(--space-6) var(--space-6)",
          color: "var(--color-on-primary)",
        }}
      >
        <div style={{ maxWidth: "660px" }}>
          <h1
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(52px, 8vw, 96px)",
              fontWeight: 700,
              lineHeight: 0.92,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              marginBottom: "var(--space-5)",
            }}
          >
            {headline}
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              lineHeight: 1.6,
              color: "#c5c7c8",
              marginBottom: "var(--space-8)",
              maxWidth: "480px",
            }}
          >
            {subheadline}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-4)",
            }}
          >
            {/* Primary CTA */}
            <Link
              href={primaryCta.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "52px",
                paddingInline: "var(--space-8)",
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-on-secondary)",
                fontFamily: "var(--font-label)",
                fontSize: "var(--font-label-bold-size)",
                fontWeight: "var(--font-label-bold-weight)" as React.CSSProperties["fontWeight"],
                letterSpacing: "var(--font-label-bold-letter-spacing)",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--color-secondary)",
                transition: "background-color var(--transition-fast), border-color var(--transition-fast)",
              }}
            >
              {primaryCta.label}
            </Link>

            {/* Secondary CTA */}
            <Link
              href={secondaryCta.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "52px",
                paddingInline: "var(--space-8)",
                backgroundColor: "transparent",
                color: "var(--color-on-primary)",
                fontFamily: "var(--font-label)",
                fontSize: "var(--font-label-bold-size)",
                fontWeight: "var(--font-label-bold-weight)" as React.CSSProperties["fontWeight"],
                letterSpacing: "var(--font-label-bold-letter-spacing)",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--color-on-primary)",
                transition: "background-color var(--transition-fast), color var(--transition-fast)",
              }}
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
