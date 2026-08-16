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
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <AdminBadge label={oStatus.label} variant={oStatus.variant} size="md" />
            <AdminBadge label={pStatus.label} variant={pStatus.variant} size="md" />
            {order.payment_method === 'cod' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', background: '#f0fdf4', color: '#15803d',
                border: '1px solid #22c55e', borderRadius: '4px',
                fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                💵 Cash on Delivery
              </span>
            )}
            {order.payment_method === 'razorpay' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', background: '#eff6ff', color: '#1d4ed8',
                border: '1px solid #3b82f6', borderRadius: '4px',
                fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                🔒 Razorpay
              </span>
            )}
            {/* Invoice download */}
            <a
              href={`/api/invoices/${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 12px',
                background: 'var(--rfc-surface)', color: 'var(--rfc-text)',
                border: '1px solid var(--rfc-border)', borderRadius: '6px',
                fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600,
                textDecoration: 'none', cursor: 'pointer',
              }}
            >
              📄 Download Invoice
            </a>
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
              {order.payment_method === 'cod' && order.payment_status === 'pending' && (
                <form action={`/api/admin/orders/${order.id}/mark-paid`} method="POST" style={{display:'inline', marginLeft: '12px'}}>
                  <button type="submit" style={{
                    padding: '8px 16px',
                    background: '#15803d', color: '#fff', border: 'none',
                    borderRadius: '6px', fontFamily: 'var(--font-label)',
                    fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.05em', cursor: 'pointer',
                  }}>
                    ✓ Mark as Paid (COD)
                  </button>
                </form>
              )}
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

          {/* Payment Info — Razorpay */}
          {order.payment_method === 'razorpay' && (
            <div className={detailStyles.card}>
              <h2 className={detailStyles.cardTitle}>Razorpay Payment</h2>
              {order.razorpay_order_id && (
                <>
                  <p className={detailStyles.fieldLabel}>Razorpay Order ID</p>
                  <p className={detailStyles.fieldValue} style={{ fontFamily: "monospace", fontSize: 11 }}>
                    {order.razorpay_order_id}
                  </p>
                </>
              )}
              {order.razorpay_payment_id && (
                <>
                  <p className={detailStyles.fieldLabel}>Payment ID (Transaction)</p>
                  <p className={detailStyles.fieldValue} style={{ fontFamily: "monospace", fontSize: 11 }}>
                    {order.razorpay_payment_id}
                  </p>
                  <a
                    href={`https://dashboard.razorpay.com/app/payments/${order.razorpay_payment_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#2563eb', textDecoration: 'underline' }}
                  >
                    View on Razorpay Dashboard ↗
                  </a>
                </>
              )}
              {order.payment_amount && (
                <>
                  <p className={detailStyles.fieldLabel} style={{ marginTop: 12 }}>Verified Amount</p>
                  <p className={detailStyles.fieldValue}>{formatPrice(order.payment_amount)}</p>
                </>
              )}
              {!order.razorpay_payment_id && (
                <p style={{ fontSize: 12, color: '#9ca3af' }}>Payment not yet captured.</p>
              )}
            </div>
          )}

          {/* Payment Info — COD (existing) */}
          {order.payment_method === 'cod' && (order.payment_provider || order.payment_reference) && (
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

          {/* Refund Info */}
          {(order.payment_status === 'refund_pending' || order.payment_status === 'refund_failed' || order.payment_status === 'refunded') && (
            <div className={detailStyles.card} style={{ borderColor: '#ef4444' }}>
              <h2 className={detailStyles.cardTitle} style={{ color: '#ef4444' }}>
                {order.payment_status === 'refunded' ? '✓ Refund Complete' : '⚠ Refund In Progress'}
              </h2>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>
                {order.payment_status === 'refund_pending' && 'A refund has been initiated. Processing typically takes 5-7 business days.'}
                {order.payment_status === 'refund_failed' && 'Refund failed. Please initiate manually via Razorpay Dashboard or contact support.'}
                {order.payment_status === 'refunded' && 'Customer has been refunded.'}
              </p>
              {order.payment_status === 'refund_failed' && (
                <a
                  href={`https://dashboard.razorpay.com/app/payments/${order.razorpay_payment_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#2563eb', textDecoration: 'underline', display: 'block', marginTop: 8 }}
                >
                  Process refund manually on Razorpay ↗
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
