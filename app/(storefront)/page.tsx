/**
 * RFC Store — Homepage Shell
 *
 * Phase 1: Application shell demonstrating:
 *   - RFC brand identity from Stitch design
 *   - The Arena (dark hero) + The Lab (light section) duality
 *   - Global design tokens working end-to-end
 *   - Responsive layout foundation
 *   - Supabase connection verification link
 *
 * Phase 2 will replace this with the full homepage implementation.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      {/* ── The Arena — Hero Section (Dark) ──────────────── */}
      <section
        className="arena section"
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
        aria-labelledby="hero-headline"
      >
        {/* Background texture / accent lines */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(255,59,48,0.03) 0px,
                rgba(255,59,48,0.03) 1px,
                transparent 1px,
                transparent 80px
              )
            `,
            pointerEvents: "none",
          }}
        />

        {/* Accent — large RFC watermark */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "-5%",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "var(--font-headline)",
            fontSize: "clamp(160px, 20vw, 320px)",
            fontWeight: 700,
            color: "rgba(255,59,48,0.04)",
            userSelect: "none",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          RFC
        </div>

        <Container style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "800px" }}>
            <Badge variant="accent" style={{ marginBottom: "var(--space-6)" }}>
              Phase 1 Foundation
            </Badge>

            <h1
              id="hero-headline"
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "clamp(48px, 8vw, 96px)",
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "-0.025em",
                textTransform: "uppercase",
                color: "var(--color-on-primary)",
                marginBottom: "var(--space-6)",
              }}
            >
              Train Like
              <br />
              <span style={{ color: "var(--color-secondary)" }}>
                A Champion
              </span>
            </h1>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(16px, 2vw, 20px)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.65)",
                maxWidth: "520px",
                marginBottom: "var(--space-8)",
              }}
            >
              Premium combat sports equipment and athletic gear for fighters
              who demand the best. Built for the ring, designed for champions.
            </p>

            <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
              <Link href={ROUTES.shop} style={{ textDecoration: "none" }}>
                <Button variant="primary" size="lg">
                  Shop All Gear
                </Button>
              </Link>
              <Link href={ROUTES.categories} style={{ textDecoration: "none" }}>
                <Button variant="ghost" size="lg" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
                  Explore Categories
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Phase 1 Status Section (The Lab — Light) ──────── */}
      <section
        className="lab section--sm"
        aria-labelledby="phase1-heading"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <Container>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--space-6)",
              marginBottom: "var(--space-8)",
            }}
          >
            <div>
              <Badge style={{ marginBottom: "var(--space-3)" }}>
                Foundation Complete
              </Badge>
              <h2
                id="phase1-heading"
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                  marginBottom: "var(--space-4)",
                  color: "var(--color-text-primary)",
                }}
              >
                RFC Store
                <br />
                Phase 1
              </h2>
              <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                Production foundation established. Stitch design integrated.
                Supabase connected. Ready for Phase 2.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-4)",
              }}
            >
              {PHASE1_STATUS.map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "var(--space-4)",
                    backgroundColor: "var(--color-card-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-default)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      marginBottom: "var(--space-2)",
                    }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-label)",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: item.done
                        ? "var(--color-secondary-dark)"
                        : "var(--color-outline)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {item.status}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection test link */}
          <div
            style={{
              padding: "var(--space-4) var(--space-6)",
              backgroundColor: "var(--color-surface-container-low)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-4)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-label)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--color-text-secondary)",
                  marginBottom: "var(--space-1)",
                }}
              >
                Supabase Health Check
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                }}
              >
                GET /api/health → verifies Supabase connectivity
              </div>
            </div>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                fontFamily: "var(--font-label)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--color-secondary-dark)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-secondary-dark)",
                paddingBottom: "2px",
                flexShrink: 0,
              }}
            >
              Test Connection →
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}

/* ── Phase 1 Status Data ──────────────────────────────── */
const PHASE1_STATUS = [
  { icon: "⚡", label: "Next.js 16 + TypeScript", status: "Complete", done: true },
  { icon: "🎨", label: "Stitch Design System", status: "Complete", done: true },
  { icon: "🗄️", label: "Supabase Connected", status: "Complete", done: true },
  { icon: "🔐", label: "Auth Foundation", status: "Complete", done: true },
  { icon: "📦", label: "Component Library", status: "Complete", done: true },
  { icon: "🌐", label: "SEO Foundation", status: "Complete", done: true },
  { icon: "📐", label: "Responsive Layout", status: "Complete", done: true },
  { icon: "🚀", label: "Vercel Ready", status: "Complete", done: true },
] as const;
