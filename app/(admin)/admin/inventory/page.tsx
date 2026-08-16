/**
 * RFC Store — Admin Inventory Page (Phase 8)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge, stockStatusBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { InventoryInlineEdit } from "./InventoryInlineEdit";
import styles from "@/components/admin/admin-page.module.css";

export const metadata: Metadata = {
  title: "Inventory — Admin RFC Store",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "";

  const supabase = await createClient();

  const { data: inventoryItems } = await supabase
    .from("inventory")
    .select(`
      id, variant_id, quantity, reserved, low_threshold, updated_at,
      product_variants(id, name, sku, is_available,
        products(id, name))
    `)
    .order("quantity", { ascending: true });

  let items = (inventoryItems ?? []) as {
    id: string;
    quantity: number;
    reserved: number;
    low_threshold: number;
    updated_at: string;
    product_variants: {
      id: string;
      name: string;
      sku: string;
      is_available: boolean;
      products: { id: string; name: string } | null;
    } | null;
  }[];

  if (filter === "low") {
    items = items.filter((i) => i.quantity <= i.low_threshold);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lowCount = (inventoryItems ?? []).filter((i: any) => i.quantity <= i.low_threshold).length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <h1 className={styles.pageTitle}>Inventory</h1>
          <p className={styles.pageSub}>
            {items.length} variants · {lowCount > 0 && <span style={{ color: "#dc2626", fontWeight: 700 }}>{lowCount} low stock</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/admin/inventory"
            className={styles.primaryBtn}
            style={filter ? { background: "#fff", color: "#374151", border: "1px solid #d1d5db" } : undefined}
          >
            All
          </Link>
          <Link
            href="/admin/inventory?filter=low"
            className={styles.primaryBtn}
            style={!filter ? { background: "#fff", color: "#374151", border: "1px solid #d1d5db" } : { background: "#dc2626" }}
          >
            Low Stock{lowCount > 0 ? ` (${lowCount})` : ""}
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <AdminEmptyState
          title={filter === "low" ? "No low-stock items" : "No inventory found"}
          description="Add products with variants to track inventory."
          icon={<EmptyIcon />}
        />
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant / SKU</th>
                  <th>In Stock</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const available = Math.max(0, item.quantity - item.reserved);
                  const sBadge = stockStatusBadge(item.quantity, item.low_threshold);
                  const variant = item.product_variants;
                  return (
                    <tr key={item.id}>
                      <td className={styles.bold}>{variant?.products?.name ?? "—"}</td>
                      <td>
                        <div className={styles.bold}>{variant?.name ?? "—"}</div>
                        <div className={styles.muted}>{variant?.sku ?? "—"}</div>
                      </td>
                      <td className={styles.bold}>{item.quantity}</td>
                      <td className={styles.muted}>{item.reserved}</td>
                      <td className={styles.bold}>{available}</td>
                      <td className={styles.muted}>{item.low_threshold}</td>
                      <td><AdminBadge label={sBadge.label} variant={sBadge.variant} /></td>
                      <td>
                        <InventoryInlineEdit
                          inventoryId={item.id}
                          currentQty={item.quantity}
                          currentThreshold={item.low_threshold}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  );
}
