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
        minHeight: "var(--hero-min-height, 100vh)",
        backgroundColor: "var(--rfc-dark)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
      aria-label="Hero — Built For The Fight"
    >
      {/* Responsive hero height: 75vh on mobile, 100vh on desktop */}
      <style>{`
        :root { --hero-min-height: 60vh; }
        @media (min-width: 1024px) { :root { --hero-min-height: 100vh; } }
      `}</style>
      {/* Background Image */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "right center",
            opacity: 0.72,
          }}
        />
      </div>

      {/* Directional gradient — heavy left for text, lighter right for fighter */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: `
            linear-gradient(
              to right,
              rgba(17,24,39,0.88) 0%,
              rgba(17,24,39,0.55) 42%,
              rgba(17,24,39,0.15) 72%,
              transparent 100%
            ),
            linear-gradient(
              to top,
              rgba(17,24,39,0.5) 0%,
              transparent 40%
            )
          `,
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

      {/* Scroll hint chevron — mobile only */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          animation: "hero-bounce 2s ease-in-out infinite",
        }}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" opacity="0.6">
          <path d="M5 8l5 5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <style>{`
          @keyframes hero-bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(5px); }
          }
          @media (min-width: 768px) {
            [aria-label="Hero — Built For The Fight"] > div:last-child { display: none; }
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes hero-bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } }
          }
        `}</style>
      </div>
    </section>
  );
}
