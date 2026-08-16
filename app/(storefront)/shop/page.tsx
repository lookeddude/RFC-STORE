/**
 * RFC Store — Shop Page
 *
 * Production /shop route implementing the full Stitch design:
 *   - Breadcrumbs → Header → Category Tabs → (Sidebar + Grid)
 *
 * Server Component: fetches products and categories from Supabase.
 * All filter/sort/search/pagination state lives in URL searchParams.
 * Zero client JS needed for the initial render.
 *
 * URL structure:
 *   /shop                               → All products
 *   /shop?category=boxing               → Category filter
 *   /shop?sort=price-asc                → Sorted
 *   /shop?q=gloves                      → Searched
 *   /shop?minPrice=1000                 → Min price
 *   /shop?maxPrice=5000                 → Max price
 *   /shop?inStock=true                  → In-stock only
 *   /shop?tags=muay-thai,sparring       → Tag filter
 *   /shop?page=2                        → Page 2
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import {
  ShopHeader,
  CategoryTabs,
  FilterSidebar,
  ShopToolbar,
  MobileFilterDrawer,
  ProductGrid,
  LoadMore,
} from "@/components/shop";
import {
  getProducts,
  getCategories,
  getCategoryBySlug,
  getAvailableTags,
} from "@/lib/data/products";
import type { SortOption, ProductFilters } from "@/types/product";
import styles from "./shop.module.css";

export const metadata: Metadata = {
  title: "Shop | REVIVE FIGHT CLUB",
  description:
    "Browse our complete collection of premium fight gear, boxing equipment, MMA gear, Muay Thai equipment, apparel and training accessories.",
  openGraph: {
    title: "Shop All Gear | REVIVE FIGHT CLUB",
    description:
      "Professional grade combat sports equipment engineered for the arena. Shop boxing gloves, MMA gear, Muay Thai equipment and more.",
    type: "website",
  },
};

const PAGE_SIZE = 12;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    tags?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Await searchParams (Next.js 16 requires awaiting this)
  const params = await searchParams;

  // ── Parse & validate URL params ────────────────────────
  const categorySlug = params.category ?? null;
  const rawSort = params.sort ?? "featured";
  const sort: SortOption = isValidSort(rawSort) ? rawSort : "featured";
  const searchQuery = params.q ?? "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const inStock = params.inStock === "true";
  // Tags: split on comma, normalise to lowercase, trim, cap length + count
  const rawTags = params.tags ?? "";
  const tags = rawTags
    .split(",")
    .map((t) => t.trim().toLowerCase().slice(0, 50))
    .filter((t) => t.length > 0)
    .slice(0, 10);
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  // ── Parallel data fetches ──────────────────────────────
  const [categories, availableTags] = await Promise.all([
    getCategories(),
    getAvailableTags(),
  ]);

  // Resolve category slug → ID (DB filter uses category_id)
  let activeCategoryId: string | null = null;
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    activeCategoryId = category?.id ?? null;
  }

  // ── Build filters ──────────────────────────────────────
  const filters: ProductFilters = {
    ...(activeCategoryId ? { categoryId: activeCategoryId } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    ...(inStock ? { inStock: true } : {}),
    ...(tags.length > 0 ? { tags } : {}),
  };

  const hasFilters =
    activeCategoryId !== null ||
    !!searchQuery ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    inStock ||
    tags.length > 0;

  // Active filter count for mobile drawer badge
  const activeFilterCount =
    (activeCategoryId !== null ? 1 : 0) +
    (inStock ? 1 : 0) +
    tags.length +
    (minPrice !== undefined ? 1 : 0) +
    (maxPrice !== undefined ? 1 : 0);

  // ── Fetch products ─────────────────────────────────────
  const { products, total } = await getProducts(filters, sort, page, PAGE_SIZE);

  return (
    <Container>
      <div className={styles.page}>
        {/* Page Header — breadcrumbs + title + count */}
        <ShopHeader totalProducts={total} />

        {/* Category Tab Bar */}
        <Suspense fallback={null}>
          <CategoryTabs categories={categories} activeSlug={categorySlug} />
        </Suspense>

        {/* Main content: Sidebar + Grid */}
        <div className={styles.layout}>
          {/* Left Sidebar Filters — hidden on mobile via CSS */}
          <Suspense fallback={null}>
            <FilterSidebar
              categories={categories}
              activeCategoryId={activeCategoryId}
              activeMinPrice={minPrice ?? null}
              activeMaxPrice={maxPrice ?? null}
              availableTags={availableTags}
              activeTags={tags}
              activeInStock={inStock}
            />
          </Suspense>

          {/* Right: Toolbar + Product Grid + Load More */}
          <div className={styles.main}>
            {/* Toolbar row: Mobile filter trigger + Search + Sort */}
            <div className={styles.toolbarRow}>
              <Suspense fallback={null}>
                <MobileFilterDrawer
                  categories={categories}
                  activeCategoryId={activeCategoryId}
                  activeMinPrice={minPrice ?? null}
                  activeMaxPrice={maxPrice ?? null}
                  availableTags={availableTags}
                  activeTags={tags}
                  activeInStock={inStock}
                  activeFilterCount={activeFilterCount}
                />
              </Suspense>
              <Suspense fallback={null}>
                <ShopToolbar
                  key={searchQuery}
                  currentSort={sort}
                  currentSearch={searchQuery}
                  total={total}
                />
              </Suspense>
            </div>

            {/* Product Grid */}
            <ProductGrid products={products} hasFilters={hasFilters} />

            {/* Load More */}
            <Suspense fallback={null}>
              <LoadMore
                currentPage={page}
                totalProducts={total}
                pageSize={PAGE_SIZE}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </Container>
  );
}

// ── Type guard ─────────────────────────────────────────────
const VALID_SORTS: SortOption[] = [
  "featured",
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
];

function isValidSort(value: string): value is SortOption {
  return VALID_SORTS.includes(value as SortOption);
}
