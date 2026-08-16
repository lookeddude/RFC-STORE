/**
 * RFC Store — Admin Edit Product Page (Phase 8)
 * Fetches full product detail including variants and images.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminBadge } from "@/components/admin/AdminBadge";
import type { AdminProductDetail } from "@/types/admin";
import styles from "@/components/admin/admin-page.module.css";
import editStyles from "./edit.module.css";

export const metadata: Metadata = {
  title: "Edit Product — Admin RFC Store",
  robots: { index: false, follow: false },
};

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [productRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id, name, slug, description, short_description, category_id,
        base_price, compare_at_price, is_active, is_featured, is_new_arrival, is_bestseller,
        tags, meta_title, meta_description, created_at, updated_at,
        product_variants(id, name, sku, price, compare_at_price, attributes, is_available,
          inventory(id, quantity, reserved, low_threshold)
        ),
        product_images(id, url, alt_text, sort_order, is_primary)
      `)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (!productRes.data) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = productRes.data as any;

  // Map to AdminProductDetail
  const product: AdminProductDetail = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    short_description: raw.short_description,
    category_id: raw.category_id,
    base_price: raw.base_price,
    compare_at_price: raw.compare_at_price,
    is_active: raw.is_active,
    is_featured: raw.is_featured,
    is_new_arrival: raw.is_new_arrival,
    is_bestseller: raw.is_bestseller,
    tags: raw.tags ?? [],
    meta_title: raw.meta_title,
    meta_description: raw.meta_description,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: (raw.product_variants ?? []).map((v: any) => ({
      id: v.id,
      product_id: raw.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      compare_at_price: v.compare_at_price,
      attributes: v.attributes ?? {},
      is_available: v.is_available,
      inventory: v.inventory ? {
        id: v.inventory.id,
        variant_id: v.id,
        quantity: v.inventory.quantity,
        reserved: v.inventory.reserved,
        low_threshold: v.inventory.low_threshold,
        updated_at: "",
      } : undefined,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: (raw.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  };

  const categories = categoriesRes.data ?? [];

  const primaryImg = product.images.find((i) => i.is_primary) ?? product.images[0];

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <Link href="/admin/products" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
            ← Back to Products
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 6 }}>{product.name}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <AdminBadge label={product.is_active ? "Active" : "Draft"} variant={product.is_active ? "success" : "neutral"} />
            {product.is_featured && <AdminBadge label="Featured" variant="primary" />}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/shop/${product.slug}`} target="_blank"
            className={styles.primaryBtn} style={{ background: "#fff", color: "#374151", border: "1px solid #d1d5db" }}>
            View in Store ↗
          </Link>
        </div>
      </div>

      {/* Product Images Summary */}
      {product.images.length > 0 && (
        <div className={editStyles.imagesSection}>
          <h2 className={editStyles.imgTitle}>Product Images ({product.images.length})</h2>
          <div className={editStyles.imgGrid}>
            {product.images.map((img) => (
              <div key={img.id} className={`${editStyles.imgItem} ${img.is_primary ? editStyles.imgPrimary : ""}`}>
                <Image src={img.url} alt={img.alt_text ?? product.name} width={80} height={80}
                  className={editStyles.img} unoptimized />
                {img.is_primary && <span className={editStyles.primaryLabel}>Primary</span>}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
            To add/remove images, go to <Link href="/admin/media" style={{ color: "#E63946" }}>Media Library</Link> and associate images with this product.
          </p>
        </div>
      )}

      {/* Edit Form */}
      <ProductForm product={product} categories={categories} mode="edit" />
    </div>
  );
}
