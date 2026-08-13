/**
 * RFC Store — Admin Order Detail (Phase 8)
 * Server-rendered. Uses snapshot fields for historical accuracy.
 * Status update handled by OrderStatusUpdater client component.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge, orderStatusBadge, paymentStatusBadge } from "@/components/admin/AdminBadge";
import { OrderStatusUpdater } from "./OrderStatusUpdater";
import styles from "@/components/admin/admin-page.module.css";
import detailStyles from "./orderDetail.module.css";

export const metadata: Metadata = {
  title: "Order Details — Admin RFC Store",
  robots: { index: false, follow: false },
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rawOrder } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = rawOrder as any;

  if (!order) notFound();

  const items = (order.order_items ?? []) as {
    id: string;
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    sku_snapshot: string | null;
    unit_price_snapshot: number;
    quantity: number;
    line_total: number;
  }[];

  const addr = order.shipping_address as Record<string, string> | null;
  const oStatus = orderStatusBadge(order.status);
  const pStatus = paymentStatusBadge(order.payment_status);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <Link href="/admin/orders" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
            ← Back to Orders
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 6 }}>Order {order.order_number}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <AdminBadge label={oStatus.label} variant={oStatus.variant} size="md" />
            <AdminBadge label={pStatus.label} variant={pStatus.variant} size="md" />
          </div>
        </div>
      </div>

      <div className={detailStyles.layout}>
        {/* Main: items + totals */}
        <div className={detailStyles.main}>
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Order Items</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.bold}>{item.product_name_snapshot}</div>
                        {item.variant_name_snapshot && (
                          <div className={styles.muted}>{item.variant_name_snapshot}</div>
                        )}
                      </td>
                      <td className={styles.muted}>{item.sku_snapshot ?? "—"}</td>
                      <td>{formatPrice(item.unit_price_snapshot)}</td>
                      <td className={styles.bold}>{item.quantity}</td>
                      <td className={styles.bold}>{formatPrice(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className={detailStyles.totals}>
              <div className={detailStyles.totalRow}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shipping_amount > 0 && (
                <div className={detailStyles.totalRow}>
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping_amount)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className={detailStyles.totalRow}>
                  <span>Tax</span>
                  <span>{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className={detailStyles.totalRow}>
                  <span>Discount</span>
                  <span style={{ color: "#16a34a" }}>− {formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className={`${detailStyles.totalRow} ${detailStyles.totalFinal}`}>
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: status, customer, shipping */}
        <aside className={detailStyles.sidebar}>
          {/* Order Status */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Order Status</h2>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
            <div style={{ marginTop: 14 }}>
              <p className={detailStyles.fieldLabel}>Payment Status</p>
              <AdminBadge label={pStatus.label} variant={pStatus.variant} size="md" />
              <p className={detailStyles.readonlyHint}>
                Payment status is set by the payment provider and cannot be manually changed.
              </p>
            </div>
          </div>

          {/* Customer */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Customer</h2>
            <p className={detailStyles.fieldLabel}>Name</p>
            <p className={detailStyles.fieldValue}>{order.customer_name}</p>
            <p className={detailStyles.fieldLabel}>Email</p>
            <p className={detailStyles.fieldValue}>{order.customer_email}</p>
            <p className={detailStyles.fieldLabel}>Phone</p>
            <p className={detailStyles.fieldValue}>{order.customer_phone}</p>
            <p className={detailStyles.fieldLabel}>Order Date</p>
            <p className={detailStyles.fieldValue}>{formatDate(order.created_at)}</p>
          </div>

          {/* Shipping Address */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Shipping Address</h2>
            {addr ? (
              <div className={detailStyles.address}>
                {addr.full_name && <p>{addr.full_name}</p>}
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}</p>
                {addr.country && <p>{addr.country}</p>}
                {addr.phone && <p style={{ marginTop: 8, color: "#6b7280" }}>{addr.phone}</p>}
              </div>
            ) : (
              <p className={detailStyles.fieldValue} style={{ color: "#9ca3af" }}>No shipping address</p>
            )}
          </div>

          {/* Payment Info */}
          {(order.payment_provider || order.payment_reference) && (
            <div className={detailStyles.card}>
              <h2 className={detailStyles.cardTitle}>Payment</h2>
              {order.payment_provider && (
                <>
                  <p className={detailStyles.fieldLabel}>Provider</p>
                  <p className={detailStyles.fieldValue}>{order.payment_provider}</p>
                </>
              )}
              {order.payment_reference && (
                <>
                  <p className={detailStyles.fieldLabel}>Reference</p>
                  <p className={detailStyles.fieldValue} style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {order.payment_reference}
                  </p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
