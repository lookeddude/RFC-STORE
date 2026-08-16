/**
 * RFC Store — Admin Products List (Phase 8)
 * Server-rendered. Search + filter + pagination via URL params.
 * All queries via Supabase anon client (admin RLS policies unlock the data).
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPagination } from "@/components/admin/AdminPagination";
import styles from "@/components/admin/admin-page.module.css";
import pageStyles from "./products.module.css";

export const metadata: Metadata = {
  title: "Products — Admin RFC Store",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const search = sp.q ?? "";
  const statusFilter = sp.status ?? ""; // '' = all, 'active', 'draft'
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, name, slug, base_price, compare_at_price, is_active, is_featured,
       category_id, created_at, updated_at,
       categories(name),
       product_images(url, is_primary)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  if (statusFilter === "active") {
    query = query.eq("is_active", true);
  } else if (statusFilter === "draft") {
    query = query.eq("is_active", false);
  }

  const { data: products, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <h1 className={styles.pageTitle}>Products</h1>
          <p className={styles.pageSub}>{count ?? 0} products in catalogue</p>
        </div>
        <Link href="/admin/products/new" className={styles.primaryBtn}>
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className={styles.filtersBar}>
        <input
          className={styles.searchInput}
          name="q"
          defaultValue={search}
          placeholder="Search products…"
          aria-label="Search products"
        />
        <select
          className={styles.filterSelect}
          name="status"
          defaultValue={statusFilter}
          onChange={undefined}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        <button type="submit" className={styles.primaryBtn}>Search</button>
        {(search || statusFilter) && (
          <Link href="/admin/products" className={pageStyles.clearLink}>Clear</Link>
        )}
      </form>

      {/* Table */}
      {!products || products.length === 0 ? (
        <AdminEmptyState
          title="No products found"
          description={search ? `No products matching "${search}"` : "Create your first product to get started."}
          ctaLabel="Add Product"
          ctaHref="/admin/products/new"
          icon={<EmptyProductIcon />}
        />
      ) : (
        <>
          <div className={styles.tableContainer}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {products.map((p: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const primaryImg = p.product_images?.find((i: any) => i.is_primary)
                      ?? p.product_images?.[0];
                    const cat = p.categories as { name: string } | null;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className={styles.productRow}>
                            {primaryImg?.url ? (
                              <Image
                                src={primaryImg.url}
                                alt={p.name}
                                width={44}
                                height={44}
                                className={styles.imgThumb}
                                unoptimized
                              />
                            ) : (
                              <div className={styles.imgPlaceholder}>
                                <PlaceholderIcon />
                              </div>
                            )}
                            <div>
                              <div className={styles.productName}>{p.name}</div>
                              <div className={styles.productMeta}>{p.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className={styles.muted}>{cat?.name ?? "—"}</td>
                        <td>
                          <div className={styles.priceCell}>{formatPrice(p.base_price)}</div>
                          {p.compare_at_price && (
                            <div className={styles.comparePrice}>{formatPrice(p.compare_at_price)}</div>
                          )}
                        </td>
                        <td>
                          <AdminBadge
                            label={p.is_active ? "Active" : "Draft"}
                            variant={p.is_active ? "success" : "neutral"}
                          />
                        </td>
                        <td>
                          <div className={styles.actionCell}>
                            <Link href={`/admin/products/${p.id}`} className={styles.editBtn}>
                              Edit
                            </Link>
                            <Link href={`/shop/${p.slug}`} target="_blank" className={styles.editBtn}>
                              View ↗
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/products"
            searchParams={sp}
          />
        </>
      )}
    </div>
  );
}

function EmptyProductIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
      <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function PlaceholderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  );
}
