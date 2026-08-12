/**
 * RFC Store — 404 Not Found Page
 * Matches Stitch design screen "RFC 404 Not Found"
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ROUTES, RFC_BRAND } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      className="arena"
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Large 404 watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-headline)",
          fontSize: "clamp(200px, 30vw, 400px)",
          fontWeight: 700,
          color: "rgba(255,59,48,0.05)",
          userSelect: "none",
          letterSpacing: "-0.05em",
          lineHeight: 1,
        }}
      >
        404
      </div>

      <Container style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-label)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-secondary)",
            marginBottom: "var(--space-4)",
          }}
        >
          {RFC_BRAND.shortName} — Page Not Found
        </div>

        <h1
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "clamp(40px, 6vw, 80px)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            color: "var(--color-on-primary)",
            marginBottom: "var(--space-4)",
            lineHeight: 1,
          }}
        >
          Out of Bounds
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--font-body-lg-size)",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "400px",
            margin: "0 auto var(--space-8)",
            lineHeight: 1.6,
          }}
        >
          The page you&apos;re looking for stepped out of the ring. Let&apos;s
          get you back on your feet.
        </p>

        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href={ROUTES.home} style={{ textDecoration: "none" }}>
            <Button variant="primary" size="lg">
              Back to Home
            </Button>
          </Link>
          <Link href={ROUTES.shop} style={{ textDecoration: "none" }}>
            <Button
              variant="ghost"
              size="lg"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.25)" }}
            >
              Shop Gear
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
