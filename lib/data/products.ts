/**
 * RFC Store — Product Data Access Layer
 *
 * All Supabase product queries live here — never inside components.
 * Server-only: uses lib/supabase/server.ts.
 *
 * Architecture:
 *   UI → data functions here → Supabase → PostgreSQL
 *
 * Reused by: /shop, /categories/[slug], search, homepage, PDP.
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

/** Lightweight shape used only for the shop listing card query */
interface DBProductCard extends DBProduct {
  product_variants?: Array<{
    id: string;
    is_available: boolean;
    inventory: Array<{ quantity: number; reserved: number }> | null;
  }>;
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
    hasLowStock: false,
    isOutOfStock: (() => {
      const variants = (raw as DBProductCard).product_variants ?? [];
      if (variants.length === 0) return false;
      return variants.every((v) => {
        if (!v.is_available) return true;
        const inv = Array.isArray(v.inventory) ? v.inventory[0] : null;
        const available = inv ? Math.max(0, inv.quantity - inv.reserved) : 0;
        return available <= 0;
      });
    })(),

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

// ── Search Sanitisation ───────────────────────────────────

/**
 * Sanitises a raw user search string for safe use inside a PostgREST
 * .or() ilike filter string.
 *
 * PostgREST parses .or() as a raw filter expression. If user input
 * contains control characters (`,`, `.`, `(`, `)`) they would break
 * the expression structure — this is a PostgREST-level injection vector.
 *
 * Strategy: replace PostgREST control characters with spaces.
 * The search intent is preserved ("boxing,gloves" -> "boxing gloves").
 *
 * Sanitises:
 *   \   -> stripped (escape prefix)
 *   %   -> \% (ILIKE wildcard -> becomes literal percent)
 *   _   -> \_ (ILIKE single-char wildcard -> becomes literal underscore)
 *   ,   -> space (PostgREST .or() expression separator)
 *   .   -> space (PostgREST column.operator.value separator)
 *   (   -> space (PostgREST grouping open)
 *   )   -> space (PostgREST grouping close)
 *   '   -> space (PostgREST string quoting)
 *   "   -> space (PostgREST string quoting)
 */
function sanitiseSearchTerm(raw: string): string {
  return raw
    .trim()
    .replace(/\\/g, "")              // strip backslashes first
    .replace(/[%_]/g, "\\$&")        // escape ILIKE wildcards to literals
    .replace(/[,.()\'"]/g, " ")      // replace PostgREST-sensitive chars with space
    .replace(/\s+/g, " ")            // collapse multiple spaces
    .trim();
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
  ),
  product_variants (
    id, is_available,
    inventory (quantity, reserved)
  )
`.trim();


const DEFAULT_PAGE_SIZE = 12;

/**
 * Fetches paginated products for the Shop listing page.
 * Applies category filter, price range, tags, search, sort, and in-stock.
 *
 * When inStock=true: fetches all matching rows (no DB-level pagination),
 * filters in application layer, then manually paginates. This ensures
 * accurate total count and correct Load More / hasMore behaviour.
 * At current catalog scale (<500 products) this is safe.
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

  // When inStock filter is active, we must fetch ALL matching rows to
  // compute the true in-stock count and paginate correctly.
  // Without this, total/hasMore would be based on the unfiltered DB count
  // and the Load More button would show misleading remaining counts.
  const fetchAll = !!filters.inStock;

  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT, fetchAll ? undefined : { count: "exact" })
    .eq("is_active", true)
    .order(column, { ascending });

  // Apply DB-level pagination only when NOT doing fetch-all for inStock
  if (!fetchAll) {
    query = query.range(offset, offset + limit - 1);
  }

  // ── Category filter ───────────────────────────────────
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  // ── Price filters ─────────────────────────────────────
  if (filters.minPrice !== undefined) {
    query = query.gte("base_price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("base_price", filters.maxPrice);
  }

  // ── Tags filter ───────────────────────────────────────
  // .overlaps() is a fully SDK-parameterised method — tag values are
  // passed as an array, never concatenated into a filter string.
  // Returns products where tags array has ANY overlap with requested tags.
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps("tags", filters.tags);
  }

  // ── Text search ───────────────────────────────────────
  // Searches name and short_description via .or() with sanitised term.
  // sanitiseSearchTerm() replaces PostgREST control characters with spaces
  // to prevent filter string injection.
  // Tags are NOT searched here — use the tags filter for tag selection.
  if (filters.search) {
    const safe = sanitiseSearchTerm(filters.search);
    if (safe.length > 0) {
      const pattern = `%${safe}%`;
      query = query.or(
        `name.ilike.${pattern},short_description.ilike.${pattern}`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getProducts] Supabase error:", error.message);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  const mapped = (data as unknown as DBProduct[]).map(mapProductCard);

  // ── In-stock application-layer filter + pagination ────
  // Applied after mapping because PostgREST cannot filter parent rows
  // based on child join aggregates (inventory.quantity - inventory.reserved).
  // The isOutOfStock flag is already computed by mapProductCard().
  if (fetchAll) {
    const inStockProducts = mapped.filter((p) => !p.isOutOfStock);
    return {
      products: inStockProducts.slice(offset, offset + limit),
      total: inStockProducts.length, // accurate count for LoadMore/hasMore
    };
  }

  return {
    products: mapped,
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
 * Fetches all distinct tags from active products.
 * Used to populate the tags filter in the sidebar.
 *
 * Tags are normalised to lowercase on the read side only.
 * Existing DB tag values are never modified.
 * Mixed-casing in DB tags is a known Phase 1 limitation.
 */
export async function getAvailableTags(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("tags")
    .eq("is_active", true);

  if (error) {
    console.error("[getAvailableTags] Supabase error:", error.message);
    return [];
  }

  const allTags = (data ?? []).flatMap(
    (p: { tags: string[] | null }) => p.tags ?? []
  );
  // Normalise to lowercase, deduplicate, and sort alphabetically
  return [...new Set(allTags.map((t) => t.toLowerCase().trim()))].filter(Boolean).sort();
}

/**
 * Fetches a single product by slug with all fields including inventory.
 * Used by the Product Detail Page.
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
 */
export async function getFeaturedProducts(
  limit = 4
): Promise<ProductCardType[]> {
  const { products } = await getProducts({}, "featured", 1, limit);
  return products.filter((p) => p.isFeatured).slice(0, limit);
}

/**
 * Fetches products on sale (compare_at_price is set) for the Best Deals section.
 */
export async function getBestDeals(
  limit = 8
): Promise<ProductCardType[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .eq("is_active", true)
      .not("compare_at_price", "is", null)
      .order("compare_at_price", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getBestDeals] Supabase error:", error.message);
      return [];
    }

    return (data as unknown as DBProduct[]).map(mapProductCard);
  } catch {
    return [];
  }
}

/**
 * Fetches bestselling products (is_bestseller = true) for the Best Sellers section.
 * Falls back to featured products if none are flagged.
 */
export async function getBestsellers(
  limit = 4
): Promise<ProductCardType[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .eq("is_active", true)
      .eq("is_bestseller", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getBestsellers] Supabase error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return getFeaturedProducts(limit);
    }

    return (data as unknown as DBProduct[]).map(mapProductCard);
  } catch {
    return [];
  }
}

/**
 * Fetches new arrival products (is_new_arrival = true) for the New Arrivals section.
 * Falls back to most recently created products if none are flagged.
 */
export async function getNewArrivals(
  limit = 6
): Promise<ProductCardType[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .eq("is_active", true)
      .eq("is_new_arrival", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getNewArrivals] Supabase error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      const { products } = await getProducts({}, "newest", 1, limit);
      return products;
    }

    return (data as unknown as DBProduct[]).map(mapProductCard);
  } catch {
    return [];
  }
}
