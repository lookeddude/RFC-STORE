/**
 * RFC Store — Product Domain Types
 *
 * These types represent the product domain model.
 * They will align with the Supabase database schema in Phase 2.
 */

// ── Core Entities ─────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  /** e.g. { size: 'L', color: 'Red' } */
  attributes: Record<string, string>;
  inventoryCount: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: string | null;
  category: Category | null;
  basePrice: number;
  compareAtPrice: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Derived / Computed Types ──────────────────────────────

/** Product as it appears in a listing card — subset of full Product */
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  primaryImage: ProductImage | null;
  basePrice: number;
  compareAtPrice: number | null;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  hasLowStock: boolean;
  isOutOfStock: boolean;
}


/** A performance specification shown on product pages (from Stitch design) */
export interface PerformanceSpec {
  label: string;
  /** 0–100 value for the progress bar */
  value: number;
}

// ── Filter & Sort Types ───────────────────────────────────

export type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "featured";

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  inStock?: boolean;
}

// ── Cart Types ────────────────────────────────────────────

export interface CartItem {
  id: string;
  product: Pick<Product, "id" | "name" | "slug">;
  variant: ProductVariant;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
