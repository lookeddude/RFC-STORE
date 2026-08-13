import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { CategoryActions } from "./CategoryActions";
import styles from "@/components/admin/admin-page.module.css";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  parent_id?: string | null;
};

export const metadata: Metadata = {
  title: "Categories — Admin RFC Store",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order, is_active, created_at")
    .order("sort_order", { ascending: true }) as { data: CategoryRow[] | null };

  // Get product counts per category
  const { data: productCounts } = await supabase
    .from("products")
    .select("category_id");

  const countMap = (productCounts ?? []).reduce(
    (acc: Record<string, number>, p: { category_id: string | null }) => {
      if (p.category_id) acc[p.category_id] = (acc[p.category_id] ?? 0) + 1;
      return acc;
    }, {}
  );

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageSub}>{categories?.length ?? 0} categories</p>
        </div>
        <CategoryActions mode="create" />
      </div>

      {!categories || categories.length === 0 ? (
        <AdminEmptyState
          title="No categories yet"
          description="Create your first product category."
          icon={<EmptyCategoryIcon />}
        />
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className={styles.productName}>{cat.name}</div>
                      {cat.description && (
                        <div className={styles.productMeta}>{cat.description.slice(0, 60)}{cat.description.length > 60 ? "…" : ""}</div>
                      )}
                    </td>
                    <td className={styles.muted}>{cat.slug}</td>
                    <td className={styles.bold}>{countMap[cat.id] ?? 0}</td>
                    <td className={styles.muted}>{cat.sort_order}</td>
                    <td>
                      <AdminBadge
                        label={cat.is_active ? "Active" : "Inactive"}
                        variant={cat.is_active ? "success" : "neutral"}
                      />
                    </td>
                    <td>
                      <CategoryActions mode="edit" category={cat} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyCategoryIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3H3v7h7V3z"/><path d="M21 3h-7v7h7V3z"/>
      <path d="M21 14h-7v7h7v-7z"/><path d="M10 14H3v7h7v-7z"/>
    </svg>
  );
}
