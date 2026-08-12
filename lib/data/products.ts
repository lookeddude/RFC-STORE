/**
 * RFC Store — Product Data Access Layer
 *
 * All Supabase product queries live here — never inside components.
 * Server-only: uses lib/supabase/server.ts.
 *
 * Architecture:
 *   UI → data functions here → Supabase → PostgreSQL
 *
 * Reused by: /shop, /categories/[slug], search, homepage, Phase 4 product detail.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductCard as ProductCardType,
  Category,
  ProductFilters,
  SortOption,
} from "@/types/product";

// ── Types (DB row shapes) ─────────────────────────────────

interface DBProduct {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  base_price: number;
  compare_at_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  categories: DBCategory | null;
  product_images: DBProductImage[];
}

interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface DBProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

// ── Mappers ───────────────────────────────────────────────

function mapCategory(raw: DBCategory): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    imageUrl: raw.image_url,
    parentId: null,
    sortOrder: raw.sort_order,
    isActive: raw.is_active,
  };
}

function mapProductCard(raw: DBProduct): ProductCardType {
  const primaryImage =
    raw.product_images.find((img) => img.is_primary) ??
    raw.product_images[0] ??
    null;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    shortDescription: raw.short_description,
    primaryImage: primaryImage
      ? {
          id: primaryImage.id,
          productId: raw.id,
          url: primaryImage.url,
          altText: primaryImage.alt_text,
          sortOrder: primaryImage.sort_order,
          isPrimary: primaryImage.is_primary,
        }
      : null,
    basePrice: Number(raw.base_price),
    compareAtPrice: raw.compare_at_price ? Number(raw.compare_at_price) : null,
    category: raw.categories
      ? {
          id: raw.categories.id,
          name: raw.categories.name,
          slug: raw.categories.slug,
        }
      : null,
    isNew: raw.is_new_arrival,
    isFeatured: raw.is_featured,
    isBestseller: raw.is_bestseller,
    hasLowStock: false, // Phase 5: compute from inventory table
  };
}

// ── Sort Mapping ──────────────────────────────────────────

function getSortConfig(sort: SortOption): {
  column: string;
  ascending: boolean;
} {
  switch (sort) {
    case "newest":
      return { column: "created_at", ascending: false };
    case "oldest":
      return { column: "created_at", ascending: true };
    case "price-asc":
      return { column: "base_price", ascending: true };
    case "price-desc":
      return { column: "base_price", ascending: false };
    case "name-asc":
      return { column: "name", ascending: true };
    case "name-desc":
      return { column: "name", ascending: false };
    case "featured":
    default:
      return { column: "is_featured", ascending: false };
  }
}

// ── Public API ────────────────────────────────────────────

const PRODUCT_CARD_SELECT = `
  id, created_at, updated_at,
  name, slug, short_description,
  category_id, base_price, compare_at_price,
  is_active, is_featured, is_new_arrival, is_bestseller, tags,
  meta_title, meta_description,
  categories (
    id, name, slug, description, image_url, sort_order, is_active
  ),
  product_images (
    id, url, alt_text, sort_order, is_primary
  )
`.trim();

const DEFAULT_PAGE_SIZE = 12;

/**
 * Fetches paginated products for the Shop listing page.
 * Applies category filter, price range, search, and sort.
 */
export async function getProducts(
  filters: ProductFilters = {},
  sort: SortOption = "featured",
  page = 1,
  limit = DEFAULT_PAGE_SIZE
): Promise<{ products: ProductCardType[]; total: number }> {
  const supabase = await createClient();
  const { column, ascending } = getSortConfig(sort);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT, { count: "exact" })
    .eq("is_active", true)
    .order(column, { ascending })
    .range(offset, offset + limit - 1);

  // Category filter
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  // Price filters
  if (filters.minPrice !== undefined) {
    query = query.gte("base_price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("base_price", filters.maxPrice);
  }

  // Text search
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getProducts] Supabase error:", error.message);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return {
    products: (data as unknown as DBProduct[]).map(mapProductCard),
    total: count ?? 0,
  };
}

/**
 * Fetches all active categories ordered by sort_order.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getCategories] Supabase error:", error.message);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return (data as DBCategory[]).map(mapCategory);
}

/**
 * Fetches a single category by slug.
 */
export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[getCategoryBySlug] Supabase error:", error.message);
    return null;
  }

  return data ? mapCategory(data as DBCategory) : null;
}

/**
 * Fetches a single product by slug with all fields including inventory.
 * Used by Phase 4 Product Detail page.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (*),
      product_images (id, url, alt_text, sort_order, is_primary),
      product_variants (
        id, name, sku, price, compare_at_price, attributes, is_available,
        inventory (quantity, reserved, low_threshold)
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[getProductBySlug] Supabase error:", error.message);
    return null;
  }

  if (!data) return null;

  const raw = data as unknown as DBProduct & {
    product_variants: Array<{
      id: string;
      name: string;
      sku: string;
      price: number;
      compare_at_price: number | null;
      attributes: Record<string, string>;
      is_available: boolean;
      inventory: { quantity: number; reserved: number; low_threshold: number } | null;
    }>;
  };

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    shortDescription: raw.short_description,
    categoryId: raw.category_id,
    category: raw.categories ? mapCategory(raw.categories as DBCategory) : null,
    basePrice: Number(raw.base_price),
    compareAtPrice: raw.compare_at_price ? Number(raw.compare_at_price) : null,
    images: [...raw.product_images]
      .sort((a, b) => (a.is_primary ? -1 : 1) - (b.is_primary ? -1 : 1) || a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        productId: raw.id,
        url: img.url,
        altText: img.alt_text,
        sortOrder: img.sort_order,
        isPrimary: img.is_primary,
      })),
    variants: raw.product_variants.map((v) => {
      const inv = v.inventory;
      const available = inv ? Math.max(0, inv.quantity - inv.reserved) : 0;
      return {
        id: v.id,
        productId: raw.id,
        name: v.name,
        sku: v.sku,
        price: Number(v.price),
        compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : null,
        attributes: v.attributes,
        inventoryCount: available,
        isAvailable: v.is_available && available > 0,
      };
    }),
    isActive: raw.is_active,
    isFeatured: raw.is_featured,
    tags: raw.tags,
    metaTitle: raw.meta_title,
    metaDescription: raw.meta_description,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Fetches related products in the same category (for PDP recommendations).
 * Excludes the current product.
 */
export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 4
): Promise<ProductCardType[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("slug", excludeSlug)
    .order("is_featured", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRelatedProducts] Supabase error:", error.message);
    return [];
  }

  return (data as unknown as DBProduct[]).map(mapProductCard);
}

/**
 * Fetches featured products for the homepage.
 * Phase 3+: replaces homepage seed data.
 */
export async function getFeaturedProducts(
  limit = 4
): Promise<ProductCardType[]> {
  const { products } = await getProducts({}, "featured", 1, limit);
  return products.filter((p) => p.isFeatured).slice(0, limit);
}
