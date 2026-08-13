/**
 * RFC Store — Admin Customer Detail (Phase 8)
 * Note: Passwords/auth tokens are NEVER in profiles — they live only in auth.users (Supabase-managed).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge, orderStatusBadge, paymentStatusBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import styles from "@/components/admin/admin-page.module.css";
import detailStyles from "./customerDetail.module.css";

export const metadata: Metadata = {
  title: "Customer — Admin RFC Store",
  robots: { index: false, follow: false },
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [profileRes, ordersRes] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, phone, role, created_at").eq("id", id).maybeSingle(),
    supabase.from("orders").select("id, order_number, total_amount, status, payment_status, created_at")
      .eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);

  const profile = profileRes.data;
  if (!profile || !["customer"].includes(profile.role ?? "")) notFound();

  const orders = ordersRes.data ?? [];
  const totalSpent = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <Link href="/admin/customers" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
            ← Back to Customers
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 6 }}>
            {profile.full_name ?? profile.email}
          </h1>
          <p className={styles.pageSub}>Joined {formatDate(profile.created_at)}</p>
        </div>
      </div>

      <div className={detailStyles.layout}>
        {/* Sidebar: profile info */}
        <aside className={detailStyles.sidebar}>
          <div className={detailStyles.card}>
            <div className={detailStyles.avatar}>
              {(profile.full_name ?? profile.email).slice(0, 2).toUpperCase()}
            </div>
            <h2 className={detailStyles.cardTitle} style={{ marginTop: 12 }}>Profile</h2>
            <div className={detailStyles.field}>
              <span className={detailStyles.label}>Name</span>
              <span className={detailStyles.value}>{profile.full_name ?? "—"}</span>
            </div>
            <div className={detailStyles.field}>
              <span className={detailStyles.label}>Email</span>
              <span className={detailStyles.value}>{profile.email}</span>
            </div>
            <div className={detailStyles.field}>
              <span className={detailStyles.label}>Phone</span>
              <span className={detailStyles.value}>{profile.phone ?? "—"}</span>
            </div>
            <div className={detailStyles.field}>
              <span className={detailStyles.label}>Orders</span>
              <span className={detailStyles.value}>{orders.length}</span>
            </div>
            <div className={detailStyles.field}>
              <span className={detailStyles.label}>Total Spent</span>
              <span className={detailStyles.value} style={{ fontWeight: 800, color: "#0A0E14" }}>{formatPrice(totalSpent)}</span>
            </div>
          </div>
        </aside>

        {/* Main: orders table */}
        <div className={detailStyles.main}>
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Order History</h2>
            {orders.length === 0 ? (
              <AdminEmptyState
                title="No orders yet"
                description="This customer hasn't placed any orders."
                icon={<EmptyIcon />}
              />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const oStatus = orderStatusBadge(o.status);
                      const pStatus = paymentStatusBadge(o.payment_status);
                      return (
                        <tr key={o.id}>
                          <td className={styles.bold}>{o.order_number}</td>
                          <td className={styles.noWrap}>{formatDate(o.created_at)}</td>
                          <td className={styles.bold}>{formatPrice(o.total_amount)}</td>
                          <td><AdminBadge label={oStatus.label} variant={oStatus.variant} /></td>
                          <td><AdminBadge label={pStatus.label} variant={pStatus.variant} /></td>
                          <td>
                            <Link href={`/admin/orders/${o.id}`} className={styles.editBtn}>View</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
