/**
 * RFC Store — Product Detail Page
 *
 * Route: /shop/[slug]
 *
 * Server Component — all data fetched at render time.
 * Client components (gallery, variant selector, add to cart) are
 * imported inside this server shell.
 *
 * Architecture:
 *   page.tsx (server) — fetches product + related products
 *   └── ProductGallery (client)   — image browsing
 *   └── ProductInfo (server)      — name, price, description
 *   └── AddToCartBar (client)     — variants, qty, CTA, wishlist
 *   └── ProductTabs (client)      — description, specs, shipping
 *   └── RelatedProducts (server)  — same-category products
 *   └── ProductStructuredData     — JSON-LD SEO
 *
 * SEO:
 *   - generateMetadata: product title, description, OG image
 *   - ProductStructuredData: Product schema JSON-LD
 *   - Canonical URL via metadata.alternates
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  ProductGallery,
  ProductInfo,
  AddToCartBar,
  ProductTabs,
  RelatedProducts,
  ProductStructuredData,
} from "@/components/pdp";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import styles from "./pdp.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rfcstore.in";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// ── SEO Metadata ──────────────────────────────────────────

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | REVIVE FIGHT CLUB",
    };
  }

  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];

  const title = product.metaTitle ?? `${product.name} | REVIVE FIGHT CLUB`;
  const description =
    product.metaDescription ??
    product.shortDescription ??
    `Shop ${product.name} at RFC Store. ${product.category?.name ?? "Premium fight gear"} engineered for performance.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/shop/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/shop/${slug}`,
      ...(primaryImage
        ? {
            images: [
              {
                url: primaryImage.url,
                alt: primaryImage.altText ?? product.name,
              },
            ],
          }
        : {}),
    },
  };
}

// ── Page ──────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch product + related products in parallel
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Parallel fetch: related products (non-blocking — empty array on error)
  const relatedProducts = product.categoryId
    ? await getRelatedProducts(product.categoryId, slug, 4)
    : [];

  // Compute badge for gallery
  const badge: { label: string; variant: "sale" | "badge" } | null =
    product.compareAtPrice
      ? { label: "SALE", variant: "sale" }
      : product.isFeatured
      ? { label: "FEATURED", variant: "badge" }
      : null;

  const productUrl = `${BASE_URL}/shop/${slug}`;

  return (
    <>
      {/* Structured Data */}
      <ProductStructuredData product={product} url={productUrl} />

      <Container>
        <div className={styles.page}>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
            <Link href="/shop" className={styles.breadcrumbLink}>Shop</Link>
            {product.category && (
              <>
                <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className={styles.breadcrumbLink}
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
            <span className={styles.breadcrumbCurrent} aria-current="page">
              {product.name}
            </span>
          </nav>

          {/* PDP Layout: Gallery (left) + Info Panel (right) */}
          <div className={styles.pdpGrid}>
            {/* Left: Image Gallery */}
            <div className={styles.galleryCol}>
              <ProductGallery
                images={product.images}
                productName={product.name}
                badge={badge}
              />
            </div>

            {/* Right: Product Info + CTA */}
            <div className={styles.infoCol}>
              <ProductInfo product={product} />

              <div className={styles.divider} aria-hidden="true" />

              <AddToCartBar product={product} />
            </div>
          </div>

          {/* Full-width tabs below the grid */}
          <ProductTabs product={product} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}
        </div>
      </Container>
    </>
  );
}
