/**
 * RFC Store — Editorial Banner (Redesigned)
 *
 * Split two-column layout:
 *   LEFT  — deep charcoal brand content: eyebrow, headline, stats, CTA
 *   RIGHT — fighter image (hand-wrapping ritual, red wraps)
 *
 * Smaller than old full-viewport version.
 * Fully token-based — no hardcoded colors.
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EDITORIAL_CONTENT } from "@/lib/content/homepage.content";

const STATS = [
  { value: "10K+", label: "Fighters Equipped" },
  { value: "Pro", label: "Grade Gear" },
  { value: "24h", label: "Fast Dispatch" },
];

export function EditorialBanner() {
  const { headline, subtext, cta, image } = EDITORIAL_CONTENT;

  return (
    <section
      style={{
        backgroundColor: "var(--rfc-dark)",
        overflow: "hidden",
      }}
      aria-label="Editorial — Engineered For Impact"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          maxWidth: "var(--container-max)",
          marginInline: "auto",
        }}
        className="editorial-grid"
      >
        {/* ── LEFT — Content ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(48px, 6vw, 80px) clamp(24px, 5vw, 80px)",
          }}
        >
          {/* Red accent bar + eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                display: "block",
                width: "32px",
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
              RFC Store
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 900,
              lineHeight: 0.95,
              textTransform: "uppercase",
              letterSpacing: "-0.025em",
              color: "var(--rfc-text-inv)",
              marginBottom: "20px",
            }}
          >
            {headline.replace(".", "")}
            <span style={{ color: "var(--rfc-accent)" }}>.</span>
          </h2>

          {/* Body */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              lineHeight: 1.7,
              color: "var(--rfc-text-inv-muted)",
              marginBottom: "36px",
              maxWidth: "420px",
            }}
          >
            {subtext}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "0",
              marginBottom: "40px",
              borderTop: "1px solid var(--rfc-border-dark)",
              borderBottom: "1px solid var(--rfc-border-dark)",
              paddingBlock: "20px",
            }}
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderRight:
                    i < STATS.length - 1
                      ? "1px solid var(--rfc-border-dark)"
                      : "none",
                  paddingInline: "12px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "clamp(22px, 3vw, 30px)",
                    fontWeight: 900,
                    color: "var(--rfc-text-inv)",
                    lineHeight: 1,
                    marginBottom: "4px",
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

          {/* CTA */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href={cta.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "48px",
                paddingInline: "32px",
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
                transition: "background-color 150ms ease, box-shadow 150ms ease",
                boxShadow: "0 4px 16px rgba(230,57,70,0.3)",
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
                height: "48px",
                paddingInline: "28px",
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
                transition: "border-color 150ms ease, background-color 150ms ease",
              }}
            >
              OUR STORY
            </Link>
          </div>
        </div>

        {/* ── RIGHT — Image ──────────────────────────────── */}
        <div
          style={{
            position: "relative",
            minHeight: "360px",
            overflow: "hidden",
          }}
          className="editorial-image-col"
        >
          {/* Red accent top bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              backgroundColor: "var(--rfc-accent)",
              zIndex: 2,
            }}
            aria-hidden="true"
          />

          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{
              objectFit: "cover",
              objectPosition: "center top",
            }}
            loading="lazy"
          />

          {/* Subtle left-side gradient to blend into content panel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(17,24,39,0.45) 0%, transparent 40%)",
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .editorial-grid {
          grid-template-columns: 1fr;
        }

        @media (min-width: 1024px) {
          .editorial-grid {
            grid-template-columns: 1fr 1fr;
            min-height: 480px;
          }
          .editorial-image-col {
            min-height: 480px !important;
          }
        }

        @media (max-width: 1023px) {
          .editorial-image-col {
            min-height: 300px !important;
            order: -1;
          }
          /* On mobile, red bar goes on top of image */
          .editorial-image-col > div:first-child {
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
