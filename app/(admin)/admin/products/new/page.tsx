/**
 * RFC Store — Admin New Product Page (Phase 8)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import styles from "@/components/admin/admin-page.module.css";

export const metadata: Metadata = {
  title: "Add Product — Admin RFC Store",
  robots: { index: false, follow: false },
};

export default async function AdminNewProductPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <Link href="/admin/products" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
            ← Back to Products
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 6 }}>Add Product</h1>
        </div>
      </div>
      <ProductForm
        categories={categories ?? []}
        mode="create"
      />
    </div>
  );
}
