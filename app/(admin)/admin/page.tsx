/**
 * RFC Store — Admin Dashboard (Phase 8)
 *
 * All metrics computed server-side via DB COUNT/SUM queries.
 * No fake data. Only real aggregations from actual tables.
 * Parallel queries for performance.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge, orderStatusBadge, paymentStatusBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Dashboard — Admin RFC Store",
  robots: { index: false, follow: false },
};

function formatPrice(amount: number | string, currency = "INR") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  // Parallel aggregation queries
  const [
    ordersRes,
    pendingRes,
    revenueRes,
    productsRes,
    lowStockRes,
    customersRes,
    recentOrdersRes,
  ] = await Promise.all([
    // Total orders
    supabase.from("orders").select("id", { count: "exact", head: true }),

    // Pending orders
    supabase.from("orders").select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    // Total revenue (paid orders only)
    supabase.from("orders").select("total_amount")
      .eq("payment_status", "paid"),

    // Total active products
    supabase.from("products").select("id", { count: "exact", head: true })
      .eq("is_active", true),

    // Low stock: items where quantity <= low_threshold (fetched client-side from inventory count)
    supabase.from("inventory").select("id, quantity, low_threshold", { count: "exact", head: false }),


    // Total customers
    supabase.from("profiles").select("id", { count: "exact", head: true })
      .eq("role", "customer"),

    // Recent 10 orders
    supabase.from("orders")
      .select("id, order_number, customer_name, customer_email, total_amount, currency, status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalOrders = ordersRes.count ?? 0;
  const pendingOrders = pendingRes.count ?? 0;
  const totalRevenue = (revenueRes.data ?? []).reduce(
    (sum: number, o: { total_amount: number }) => sum + (Number(o.total_amount) || 0), 0
  );
  const totalProducts = productsRes.count ?? 0;
  const inventoryData = (lowStockRes.data ?? []) as { quantity: number; low_threshold: number }[];
  const lowStockCount = inventoryData.filter((i) => i.quantity <= i.low_threshold).length;

  const totalCustomers = customersRes.count ?? 0;
  const recentOrders = (recentOrdersRes.data ?? []) as {
    id: string; order_number: string; customer_name: string; customer_email: string;
    total_amount: number; currency: string; status: string; payment_status: string; created_at: string;
  }[];

  return (
    <div className={styles.page}>
      {/* Page title */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSub}>RFC Store business overview</p>
      </div>

      {/* Metric Cards */}
      <div className={styles.metricsGrid}>
        <AdminMetricCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={<OrderIcon />}
          accent="blue"
        />
        <AdminMetricCard
          title="Pending Orders"
          value={pendingOrders.toLocaleString()}
          subtitle="Require action"
          icon={<PendingIcon />}
          accent={pendingOrders > 0 ? "yellow" : "default"}
        />
        <AdminMetricCard
          title="Total Revenue"
          value={formatPrice(totalRevenue)}
          subtitle="Paid orders only"
          icon={<RevenueIcon />}
          accent="green"
        />
        <AdminMetricCard
          title="Active Products"
          value={totalProducts.toLocaleString()}
          icon={<ProductIcon />}
          accent="default"
        />
        <AdminMetricCard
          title="Low Stock"
          value={lowStockCount.toLocaleString()}
          subtitle="Items below threshold"
          icon={<StockIcon />}
          accent={lowStockCount > 0 ? "red" : "default"}
        />
        <AdminMetricCard
          title="Customers"
          value={totalCustomers.toLocaleString()}
          icon={<CustomerIcon />}
          accent="default"
        />
      </div>

      {/* Recent Orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className={styles.viewAll}>View All →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <AdminEmptyState
            title="No orders yet"
            description="Orders placed by customers will appear here."
            icon={<EmptyOrderIcon />}
          />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const oStatus = orderStatusBadge(order.status);
                  const pStatus = paymentStatusBadge(order.payment_status);
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className={styles.orderNum}>{order.order_number}</span>
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{order.customer_name}</span>
                          <span className={styles.customerEmail}>{order.customer_email}</span>
                        </div>
                      </td>
                      <td className={styles.dateCell}>{formatDate(order.created_at)}</td>
                      <td className={styles.amountCell}>
                        {formatPrice(order.total_amount, order.currency)}
                      </td>
                      <td>
                        <AdminBadge label={oStatus.label} variant={oStatus.variant} />
                      </td>
                      <td>
                        <AdminBadge label={pStatus.label} variant={pStatus.variant} />
                      </td>
                      <td>
                        <Link href={`/admin/orders/${order.id}`} className={styles.viewLink}>
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 14 }}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link href="/admin/products/new" className={styles.actionCard}>
            <span className={styles.actionIcon}><ProductIcon /></span>
            <span>Add Product</span>
          </Link>
          <Link href="/admin/categories" className={styles.actionCard}>
            <span className={styles.actionIcon}><CategoryIcon /></span>
            <span>Manage Categories</span>
          </Link>
          <Link href="/admin/inventory" className={styles.actionCard}>
            <span className={styles.actionIcon}><StockIcon /></span>
            <span>Update Inventory</span>
          </Link>
          <Link href="/admin/orders?status=pending" className={styles.actionCard}>
            <span className={styles.actionIcon}><PendingIcon /></span>
            <span>Pending Orders</span>
          </Link>
          <Link href="/admin/media" className={styles.actionCard}>
            <span className={styles.actionIcon}><MediaIcon /></span>
            <span>Upload Images</span>
          </Link>
          <Link href="/admin/settings" className={styles.actionCard}>
            <span className={styles.actionIcon}><SettingsIcon /></span>
            <span>Store Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Icons
function OrderIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>; }
function PendingIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function RevenueIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function ProductIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function StockIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>; }
function CustomerIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function CategoryIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3H3v7h7V3z"/><path d="M21 3h-7v7h7V3z"/><path d="M21 14h-7v7h7v-7z"/><path d="M10 14H3v7h7v-7z"/></svg>; }
function MediaIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>; }
function SettingsIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EmptyOrderIcon() { return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>; }
