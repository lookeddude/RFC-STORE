/**
 * RFC Store — Editorial Banner (Stacked Layout)
 *
 * Two stacked rows:
 *   TOP    — dark charcoal, full-width text content
 *   BOTTOM — full-width image strip with subtle overlay
 *
 * Works identically on desktop and mobile.
 * Compact, punchy, premium.
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EDITORIAL_CONTENT } from "@/lib/content/homepage.content";

const STATS = [
  { value: "10K+", label: "Fighters Equipped" },
  { value: "Pro", label: "Grade Gear" },
  { value: "24h", label: "Fast Dispatch" },
  { value: "7-Day", label: "Easy Returns" },
];

export function EditorialBanner() {
  const { headline, subtext, cta, image } = EDITORIAL_CONTENT;

  return (
    <section
      style={{ backgroundColor: "var(--rfc-dark)", overflow: "hidden" }}
      aria-label="Editorial — Engineered For Impact"
    >
      {/* ── TOP ROW — Text Content ─────────────────────── */}
      <div
        style={{
          maxWidth: "var(--container-max)",
          marginInline: "auto",
          padding: "clamp(48px, 6vw, 72px) clamp(20px, 5vw, 80px) clamp(40px, 5vw, 60px)",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <span
            style={{
              display: "block",
              width: "28px",
              height: "3px",
              backgroundColor: "var(--rfc-accent)",
              borderRadius: "2px",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-label)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--rfc-accent)",
            }}
          >
            RFC Store — Built Different
          </span>
        </div>

        {/* Headline + body in 2-col on large screens */}
        <div className="editorial-content-row">
          {/* Headline */}
          <h2
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(38px, 5.5vw, 72px)",
              fontWeight: 900,
              lineHeight: 0.95,
              textTransform: "uppercase",
              letterSpacing: "-0.025em",
              color: "var(--rfc-text-inv)",
              marginBottom: 0,
            }}
          >
            {headline.replace(".", "")}
            <span style={{ color: "var(--rfc-accent)" }}>.</span>
          </h2>

          {/* Right side — body + CTAs */}
          <div className="editorial-right-col">
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "15px",
                lineHeight: 1.7,
                color: "var(--rfc-text-inv-muted)",
                marginBottom: "28px",
                maxWidth: "400px",
              }}
            >
              {subtext}
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link
                href={cta.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "46px",
                  paddingInline: "28px",
                  backgroundColor: "var(--rfc-accent)",
                  color: "#ffffff",
                  fontFamily: "var(--font-label)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "var(--radius-sharp)",
                  border: "1.5px solid var(--rfc-accent)",
                  boxShadow: "0 4px 16px rgba(230,57,70,0.3)",
                  transition: "background-color 150ms ease",
                }}
              >
                {cta.label}
              </Link>
              <Link
                href="/about"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "46px",
                  paddingInline: "24px",
                  backgroundColor: "transparent",
                  color: "var(--rfc-text-inv)",
                  fontFamily: "var(--font-label)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "var(--radius-sharp)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  transition: "border-color 150ms ease",
                }}
              >
                OUR STORY
              </Link>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderTop: "1px solid var(--rfc-border-dark)",
            marginTop: "clamp(32px, 4vw, 48px)",
            paddingTop: "clamp(24px, 3vw, 32px)",
            gap: "0",
          }}
          className="editorial-stats"
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                borderRight:
                  i < STATS.length - 1
                    ? "1px solid var(--rfc-border-dark)"
                    : "none",
                paddingInline: "8px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: 900,
                  color: "var(--rfc-text-inv)",
                  lineHeight: 1,
                  marginBottom: "5px",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-label)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--rfc-text-inv-muted)",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM ROW — Full-Width Image Strip ────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(300px, 40vw, 520px)",
          overflow: "hidden",
        }}
      >
        {/* Red accent top border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: "var(--rfc-accent)",
            zIndex: 3,
          }}
          aria-hidden="true"
        />

        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center 25%",
          }}
          loading="lazy"
        />

        {/* Gradient: strong at top (connects to dark section), fades to nothing */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(17,24,39,0.6) 0%, rgba(17,24,39,0.1) 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* Side vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(17,24,39,0.35) 0%, transparent 20%, transparent 80%, rgba(17,24,39,0.35) 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      <style>{`
        /* Desktop: headline left, body+CTA right */
        .editorial-content-row {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .editorial-content-row {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 40px;
          }
          .editorial-content-row h2 {
            flex: 1;
            margin-bottom: 0;
          }
          .editorial-right-col {
            flex: 0 0 380px;
            max-width: 400px;
          }
        }

        /* Stats: 2-col on mobile, 4-col on desktop */
        @media (max-width: 640px) {
          .editorial-stats {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .editorial-stats > div:nth-child(2) {
            border-right: none !important;
          }
          .editorial-stats > div:nth-child(1),
          .editorial-stats > div:nth-child(2) {
            border-bottom: 1px solid var(--rfc-border-dark);
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </section>
  );
}
