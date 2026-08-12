/**
 * RFC Store — Sitemap
 * Dynamically generates the XML sitemap for SEO.
 * Phase 1: Static routes only. Phase 2+ will add product/category URLs.
 */
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Static storefront routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}${ROUTES.shop}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTES.categories}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${ROUTES.search}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Phase 2+: Add dynamic product and category URLs here
  // const products = await fetchProducts();
  // const productRoutes = products.map(p => ({ url: `${baseUrl}/shop/${p.slug}`, ... }));

  return [...staticRoutes];
}
