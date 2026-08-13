/**
 * RFC Store — Hero Section
 *
 * Full-screen dark arena hero. Background image over deep charcoal.
 * Uses RFC design tokens throughout — no hardcoded colors.
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
        backgroundColor: "var(--rfc-dark)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
      aria-label="Hero — Built For The Fight"
    >
      {/* Background Image */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.55 }}
        />
      </div>

      {/* Subtle bottom gradient — anchors text to base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to top, rgba(17,24,39,0.65) 0%, rgba(17,24,39,0.1) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "var(--container-max)",
          marginInline: "auto",
          padding: "clamp(24px, 5vw, 64px) clamp(16px, 4vw, 64px)",
          color: "var(--rfc-text-inv)",
        }}
      >
        <div style={{ maxWidth: "640px" }}>
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: "var(--font-label)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--rfc-accent)",
              marginBottom: "16px",
            }}
          >
            Revive Fight Club
          </p>

          <h1
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(52px, 8vw, 96px)",
              fontWeight: 900,
              lineHeight: 0.92,
              textTransform: "uppercase",
              letterSpacing: "-0.025em",
              color: "var(--rfc-text-inv)",
              marginBottom: "24px",
            }}
          >
            {headline}
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "17px",
              lineHeight: 1.65,
              color: "var(--rfc-text-inv-muted)",
              marginBottom: "36px",
              maxWidth: "460px",
            }}
          >
            {subheadline}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Primary CTA — RFC Red */}
            <Link
              href={primaryCta.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "52px",
                paddingInline: "36px",
                backgroundColor: "var(--rfc-accent)",
                color: "#ffffff",
                fontFamily: "var(--font-label)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "var(--radius-sharp)",
                border: "1.5px solid var(--rfc-accent)",
                transition:
                  "background-color var(--transition-fast), box-shadow var(--transition-fast)",
                boxShadow: "0 4px 16px rgba(230,57,70,0.35)",
              }}
            >
              {primaryCta.label}
            </Link>

            {/* Secondary CTA — Ghost inverse */}
            <Link
              href={secondaryCta.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "52px",
                paddingInline: "36px",
                backgroundColor: "transparent",
                color: "var(--rfc-text-inv)",
                fontFamily: "var(--font-label)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "var(--radius-sharp)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                transition:
                  "background-color var(--transition-fast), border-color var(--transition-fast)",
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
