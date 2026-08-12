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
 *   /shop                    → All products
 *   /shop?category=boxing    → Filtered
 *   /shop?sort=price-asc     → Sorted
 *   /shop?q=gloves           → Searched
 *   /shop?minPrice=1000      → Min price
 *   /shop?maxPrice=5000      → Max price
 *   /shop?page=2             → Page 2
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import {
  ShopHeader,
  CategoryTabs,
  FilterSidebar,
  ShopToolbar,
  ProductGrid,
  LoadMore,
} from "@/components/shop";
import { getProducts, getCategories, getCategoryBySlug } from "@/lib/data/products";
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
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Await searchParams (Next.js 16 requires awaiting this)
  const params = await searchParams;

  // Parse & validate URL params
  const categorySlug = params.category ?? null;
  const rawSort = params.sort ?? "featured";
  const sort: SortOption = isValidSort(rawSort) ? rawSort : "featured";
  const searchQuery = params.q ?? "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  // Fetch categories (for tabs + sidebar filter)
  const categories = await getCategories();

  // Resolve category to ID (filter uses category_id in DB)
  let activeCategoryId: string | null = null;
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    activeCategoryId = category?.id ?? null;
  }

  // Build filters
  const filters: ProductFilters = {
    ...(activeCategoryId ? { categoryId: activeCategoryId } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
  };

  const hasFilters =
    activeCategoryId !== null ||
    !!searchQuery ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  // Fetch products
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
          {/* Left Sidebar Filters */}
          <Suspense fallback={null}>
            <FilterSidebar
              categories={categories}
              activeCategoryId={activeCategoryId}
              activeMinPrice={minPrice ?? null}
              activeMaxPrice={maxPrice ?? null}
            />
          </Suspense>

          {/* Right: Toolbar + Product Grid + Load More */}
          <div className={styles.main}>
            {/* Search + Sort Toolbar */}
            <Suspense fallback={null}>
              <ShopToolbar key={searchQuery} currentSort={sort} currentSearch={searchQuery} />
            </Suspense>

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
