/**
 * RFC Store — Category Page
 *
 * Route: /categories/[slug]
 *
 * Dedicated product listing page for a single category.
 * Full shop experience: search, filters, sort, pagination.
 *
 * Reuses all existing shop components:
 *   ShopHeader  — category name + breadcrumb
 *   FilterSidebar  — price + tags + in-stock (no category checkboxes)
 *   MobileFilterDrawer — mobile filter drawer
 *   ShopToolbar  — search + sort
 *   ProductGrid  — product cards
 *   LoadMore  — pagination
 *
 * URL structure:
 *   /categories/boxing
 *   /categories/boxing?sort=price-asc
 *   /categories/boxing?q=gloves
 *   /categories/boxing?inStock=true
 *   /categories/boxing?tags=sparring
 *   /categories/boxing?minPrice=500&maxPrice=3000
 *   /categories/boxing?page=2
 *
 * SEO: generateMetadata returns category-specific title, description,
 * and canonical URL.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import {
  ShopHeader,
  FilterSidebar,
  ShopToolbar,
  MobileFilterDrawer,
  ProductGrid,
  LoadMore,
} from "@/components/shop";
import {
  getProducts,
  getCategoryBySlug,
  getAvailableTags,
} from "@/lib/data/products";
import type { SortOption, ProductFilters } from "@/types/product";
import styles from "../../shop/shop.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rfcstore.in";
const PAGE_SIZE = 12;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    tags?: string;
    page?: string;
  }>;
}

// ── SEO Metadata ──────────────────────────────────────────

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found | REVIVE FIGHT CLUB" };
  }

  const title = `${category.name} | REVIVE FIGHT CLUB`;
  const description =
    category.description ??
    `Shop premium ${category.name.toLowerCase()} gear at RFC Store. Professional grade equipment engineered for peak performance.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/categories/${slug}`,
    },
    openGraph: {
      title: `${category.name} Gear | REVIVE FIGHT CLUB`,
      description,
      type: "website",
      url: `${BASE_URL}/categories/${slug}`,
    },
  };
}

// ── Page ──────────────────────────────────────────────────

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const rawParams = await searchParams;

  // Fetch category — 404 if not found or inactive
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  // ── Parse & validate URL params ────────────────────────
  const rawSort = rawParams.sort ?? "featured";
  const sort: SortOption = isValidSort(rawSort) ? rawSort : "featured";
  const searchQuery = rawParams.q ?? "";
  const minPrice = rawParams.minPrice ? parseFloat(rawParams.minPrice) : undefined;
  const maxPrice = rawParams.maxPrice ? parseFloat(rawParams.maxPrice) : undefined;
  const inStock = rawParams.inStock === "true";
  const rawTags = rawParams.tags ?? "";
  const tags = rawTags
    .split(",")
    .map((t) => t.trim().toLowerCase().slice(0, 50))
    .filter((t) => t.length > 0)
    .slice(0, 10);
  const page = Math.max(1, parseInt(rawParams.page ?? "1", 10));

  // ── Fetch available tags for filter sidebar ────────────
  const availableTags = await getAvailableTags();

  // ── Build filters ──────────────────────────────────────
  // Category is always set to the current page's category.
  // No category checkboxes in sidebar (pass categories={[]} to FilterSidebar).
  const filters: ProductFilters = {
    categoryId: category.id,
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    ...(inStock ? { inStock: true } : {}),
    ...(tags.length > 0 ? { tags } : {}),
  };

  const hasFilters =
    !!searchQuery ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    inStock ||
    tags.length > 0;

  const activeFilterCount =
    (inStock ? 1 : 0) +
    tags.length +
    (minPrice !== undefined ? 1 : 0) +
    (maxPrice !== undefined ? 1 : 0);

  // ── Fetch products ─────────────────────────────────────
  const { products, total } = await getProducts(filters, sort, page, PAGE_SIZE);

  return (
    <Container>
      <div className={styles.page}>
        {/* Page Header — breadcrumb: Home / Shop / Category */}
        <ShopHeader
          totalProducts={total}
          title={category.name}
          description={
            category.description ??
            `Professional grade ${category.name.toLowerCase()} equipment engineered for peak performance.`
          }
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: category.name, href: `/categories/${slug}` },
          ]}
        />

        {/* Main content: Sidebar + Grid (no CategoryTabs on category pages) */}
        <div className={styles.layout}>
          {/* Left Sidebar — no category checkboxes (categories=[]) */}
          <Suspense fallback={null}>
            <FilterSidebar
              categories={[]}
              activeCategoryId={category.id}
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
                  categories={[]}
                  activeCategoryId={category.id}
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
