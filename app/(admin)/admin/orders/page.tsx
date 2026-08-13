/**
 * RFC Store — Admin Orders List (Phase 8)
 * Server-rendered. Search + status filter + pagination via URL params.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge, orderStatusBadge, paymentStatusBadge } from "@/components/admin/AdminBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import styles from "@/components/admin/admin-page.module.css";

export const metadata: Metadata = {
  title: "Orders — Admin RFC Store",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const statusFilter = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email, total_amount, currency, status, payment_status, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`order_number.ilike.%${q}%,customer_email.ilike.%${q}%,customer_name.ilike.%${q}%`);
  }
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSub}>{count ?? 0} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className={styles.filtersBar}>
        <input
          className={styles.searchInput}
          name="q"
          defaultValue={q}
          placeholder="Search by order # or customer…"
          aria-label="Search orders"
        />
        <select className={styles.filterSelect} name="status" defaultValue={statusFilter}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <button type="submit" className={styles.primaryBtn}>Filter</button>
        {(q || statusFilter) && (
          <Link href="/admin/orders" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "9px 0" }}>Clear</Link>
        )}
      </form>

      {!orders || orders.length === 0 ? (
        <AdminEmptyState
          title="No orders found"
          description={q || statusFilter ? "Try adjusting your search or filters." : "Customer orders will appear here."}
          icon={<EmptyIcon />}
        />
      ) : (
        <>
          <div className={styles.tableContainer}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const oStatus = orderStatusBadge(order.status);
                    const pStatus = paymentStatusBadge(order.payment_status);
                    return (
                      <tr key={order.id}>
                        <td className={styles.bold}>{order.order_number}</td>
                        <td>
                          <div className={styles.bold}>{order.customer_name}</div>
                          <div className={styles.muted}>{order.customer_email}</div>
                        </td>
                        <td className={styles.noWrap}>{formatDate(order.created_at)}</td>
                        <td className={styles.bold}>{formatPrice(order.total_amount)}</td>
                        <td><AdminBadge label={oStatus.label} variant={oStatus.variant} /></td>
                        <td><AdminBadge label={pStatus.label} variant={pStatus.variant} /></td>
                        <td>
                          <Link href={`/admin/orders/${order.id}`} className={styles.editBtn}>View</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <AdminPagination page={page} totalPages={totalPages} basePath="/admin/orders" searchParams={sp} />
        </>
      )}
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
