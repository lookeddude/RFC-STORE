/**
 * RFC Store — Product Structured Data (JSON-LD)
 *
 * Injects Product schema for Google rich results.
 * Uses ONLY real product data — no fabricated ratings, reviews, or
 * availability not reflected in actual inventory.
 *
 * Phase 8+: Add AggregateRating when reviews system is live.
 */
import type { Product } from "@/types/product";

interface ProductStructuredDataProps {
  product: Product;
  url: string;
}

export function ProductStructuredData({ product, url }: ProductStructuredDataProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];

  const hasAvailableVariant = product.variants.length === 0
    ? true // product-level availability (no variant tracking yet)
    : product.variants.some((v) => v.isAvailable);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.shortDescription ?? undefined,
    url,
    ...(primaryImage ? { image: primaryImage.url } : {}),
    ...(product.category
      ? { category: product.category.name }
      : {}),
    ...(product.tags.length > 0 ? { keywords: product.tags.join(", ") } : {}),
    brand: {
      "@type": "Brand",
      name: "Revive Fight Club",
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.basePrice.toString(),
      availability: hasAvailableVariant
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Revive Fight Club",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
