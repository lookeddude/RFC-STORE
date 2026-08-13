/**
 * RFC Store — Editorial Banner
 *
 * Dark cinematic section. Full-width image, centered headline, RFC red CTA.
 * Fully token-based — no hardcoded colors.
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EDITORIAL_CONTENT } from "@/lib/content/homepage.content";

export function EditorialBanner() {
  const { headline, subtext, cta, image } = EDITORIAL_CONTENT;

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        padding: "clamp(80px, 12vw, 160px) 24px",
        backgroundColor: "var(--rfc-dark)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
      aria-label="Editorial — Engineered For Impact"
    >
      {/* Background Image */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.35 }}
          loading="lazy"
        />
      </div>

      {/* Dark gradient overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(ellipse at center, rgba(17,24,39,0.3) 0%, rgba(17,24,39,0.7) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "680px",
          paddingInline: "var(--space-6)",
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-label)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--rfc-accent)",
            marginBottom: "16px",
          }}
        >
          RFC Store
        </p>

        <h2
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "clamp(38px, 7vw, 76px)",
            fontWeight: 900,
            lineHeight: 0.95,
            textTransform: "uppercase",
            letterSpacing: "-0.025em",
            color: "var(--rfc-text-inv)",
            marginBottom: "20px",
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "17px",
            lineHeight: 1.65,
            color: "var(--rfc-text-inv-muted)",
            marginBottom: "36px",
            maxWidth: "520px",
            marginInline: "auto",
          }}
        >
          {subtext}
        </p>

        {/* RFC Red CTA */}
        <Link
          href={cta.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "52px",
            paddingInline: "40px",
            backgroundColor: "var(--rfc-accent)",
            color: "#ffffff",
            fontFamily: "var(--font-label)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "var(--radius-sharp)",
            transition:
              "background-color var(--transition-fast), box-shadow var(--transition-fast)",
            boxShadow: "0 4px 18px rgba(230,57,70,0.4)",
          }}
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
