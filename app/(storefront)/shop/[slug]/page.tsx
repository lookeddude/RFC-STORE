/**
 * RFC Store — Product Detail Page Placeholder
 *
 * Phase 3: Placeholder to ensure product card links are functional.
 * Full Product Detail implementation is Phase 4.
 *
 * Provides:
 *   - Valid route so clicking ProductCard doesn't 404
 *   - Breadcrumb navigation back to Shop
 *   - "Coming Soon" message
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getProductBySlug } from "@/lib/data/products";
import { slugToTitle } from "@/lib/utils/format";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const title = product?.name ?? slugToTitle(slug);
  return {
    title: `${title} | REVIVE FIGHT CLUB`,
    description: product?.shortDescription ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return (
    <Container>
      <div style={{ paddingBlock: "48px 120px" }}>
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 48,
            fontFamily: "var(--font-label)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          <Link href="/" style={{ color: "rgba(11,28,48,0.5)", textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ color: "rgba(11,28,48,0.3)" }}>/</span>
          <Link href="/shop" style={{ color: "rgba(11,28,48,0.5)", textDecoration: "none" }}>
            Shop
          </Link>
          <span style={{ color: "rgba(11,28,48,0.3)" }}>/</span>
          <span style={{ color: "var(--color-primary)" }}>
            {product?.name ?? slugToTitle(slug)}
          </span>
        </nav>

        {/* Phase 4 Placeholder */}
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(64px, 10vw, 120px)",
              fontWeight: 700,
              color: "rgba(11,28,48,0.04)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: 32,
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            RFC
          </div>

          <h1
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              color: "var(--color-primary)",
              marginBottom: 16,
            }}
          >
            {product?.name ?? slugToTitle(slug)}
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "rgba(11,28,48,0.55)",
              maxWidth: 440,
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Full product detail page coming in Phase 4 — including images,
            specifications, variants, and add to cart.
          </p>

          <Link
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 48,
              paddingInline: 32,
              fontFamily: "var(--font-label)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-on-secondary)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    </Container>
  );
}
