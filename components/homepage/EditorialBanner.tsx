/**
 * RFC Store — Dark Editorial Banner
 *
 * Full-width dark arena section: "ENGINEERED FOR IMPACT."
 * Background image with cinematic opacity overlay.
 * Single CTA button — white on dark.
 *
 * Stitch design: section between Featured Gear and Footer.
 * Content from EDITORIAL_CONTENT in homepage.content.ts.
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
        padding: "160px 24px",
        backgroundColor: "var(--color-primary)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
      aria-label="Editorial — Engineered For Impact"
    >
      {/* Background Image at 40% opacity */}
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
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.4 }}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "720px",
          paddingInline: "var(--space-6)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 700,
            lineHeight: 1,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            color: "var(--color-on-primary)",
            marginBottom: "var(--space-6)",
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#c5c7c8",
            marginBottom: "var(--space-10)",
            maxWidth: "560px",
            marginInline: "auto",
          }}
        >
          {subtext}
        </p>

        <Link
          href={cta.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "52px",
            paddingInline: "var(--space-8)",
            backgroundColor: "var(--color-on-primary)",
            color: "var(--color-primary)",
            fontFamily: "var(--font-label)",
            fontSize: "var(--font-label-bold-size)",
            fontWeight: "var(--font-label-bold-weight)" as React.CSSProperties["fontWeight"],
            letterSpacing: "var(--font-label-bold-letter-spacing)",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "var(--radius-sm)",
            transition: "background-color var(--transition-fast), color var(--transition-fast)",
          }}
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
