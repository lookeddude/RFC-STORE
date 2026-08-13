/**
 * RFC Store — Dynamic Sitemap (Phase 9)
 *
 * Fetches real product slugs + active categories from Supabase.
 * Falls back gracefully to static routes if DB is unavailable.
 *
 * Uses the anon key directly (no cookies) since products + categories
 * are publicly readable via RLS — no session required.
 *
 * Excludes: /account, /admin, /checkout, /cart, /api routes (private)
 */
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";

const BASE_URL = siteConfig.url;

/** Lightweight public Supabase client — no cookies, no session */
function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key);
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static storefront routes ─────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // ── Dynamic: products + categories from DB ───────────────
  try {
    const supabase = createPublicClient();

    // Fetch all active product slugs + updated_at
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
      url: `${BASE_URL}/shop/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Fetch all active categories for filtered shop URLs
    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
      url: `${BASE_URL}/shop?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (err) {
    // DB unavailable — return static routes only (never crash sitemap generation)
    console.error("[RFC Store] Sitemap: DB fetch failed, falling back to static routes:", err);
    return staticRoutes;
  }
}

