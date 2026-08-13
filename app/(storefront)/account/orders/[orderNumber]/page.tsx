/**
 * RFC Store — Order Detail Page (Phase 7)
 *
 * Security:
 *   - Fetches by order_number (URL param) + user_id from session
 *   - Never trusts client-provided user identity
 *   - RLS enforces auth.uid() = user_id at DB level
 *   - Server re-verifies ownership in query (.eq("user_id", user.id))
 *
 * Data:
 *   - Uses order_items SNAPSHOT fields (product_name_snapshot, unit_price_snapshot, etc.)
 *   - Never uses current product price as historical order value
 *   - Shipping address from orders.shipping_address (JSONB snapshot)
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { ROUTES } from "@/lib/constants/site";
import styles from "./order-detail.module.css";

export const metadata: Metadata = {
  title: "Order Details — REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

function formatPrice(amount: number | string, currency: string = "INR") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/account/orders`);

  const { orderNumber } = await params;

  type ShippingAddress = {
    fullName?: string; phone?: string; line1?: string;
    line2?: string | null; city?: string; state?: string;
    postalCode?: string; country?: string;
  };

  type OrderItem = {
    id: string; product_name_snapshot: string; variant_name_snapshot: string | null;
    sku_snapshot: string | null; unit_price_snapshot: number; quantity: number; line_total: number;
  };

  type OrderDetailFull = {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: ShippingAddress | null;
    subtotal: number;
    shipping_amount: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
    created_at: string;
    user_id: string | null;
    order_items: OrderItem[];
  };

  // Fetch order — ownership enforced by user_id filter AND RLS
  const { data: rawOrder } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, payment_status,
      customer_name, customer_email, customer_phone,
      shipping_address,
      subtotal, shipping_amount, tax_amount, discount_amount,
      total_amount, currency,
      created_at,
      user_id,
      order_items (
        id, product_name_snapshot, variant_name_snapshot,
        sku_snapshot, unit_price_snapshot, quantity, line_total
      )
    `)
    .eq("order_number", orderNumber)
    .eq("user_id", user.id) // explicit ownership check — never trust URL alone
    .maybeSingle();

  if (!rawOrder) notFound();

  // Cast to typed object — Supabase join inference requires explicit typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = rawOrder as unknown as OrderDetailFull;

  const addr = order.shipping_address;
  const items: OrderItem[] = Array.isArray(order.order_items) ? order.order_items : [];
  const currency = order.currency || "INR";
  const hasDiscount = parseFloat(String(order.discount_amount ?? 0)) > 0;
  const hasTax = parseFloat(String(order.tax_amount ?? 0)) > 0;

  return (
    <AccountShell pageTitle={`Order ${order.order_number}`}>
      <div className={styles.page}>
        {/* Back link */}
        <Link href={ROUTES.account.orders} className={styles.backLink}>
          ← Back to Orders
        </Link>

        {/* Order header */}
        <div className={styles.header}>
          <div>
            <p className={styles.orderDate}>Placed {formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Status Timeline */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Order Status</h2>
          <OrderTimeline status={order.status} />
        </section>

        {/* Order Items */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Items Ordered</h2>
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemIcon} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                    <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.product_name_snapshot}</p>
                  {item.variant_name_snapshot && (
                    <p className={styles.itemVariant}>{item.variant_name_snapshot}</p>
                  )}
                  {item.sku_snapshot && (
                    <p className={styles.itemSku}>SKU: {item.sku_snapshot}</p>
                  )}
                </div>
                <div className={styles.itemPricing}>
                  <span className={styles.itemQty}>×{item.quantity}</span>
                  <span className={styles.itemUnit}>
                    {formatPrice(item.unit_price_snapshot, currency)} each
                  </span>
                  <span className={styles.itemTotal}>
                    {formatPrice(item.line_total, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two-column: summary + address */}
        <div className={styles.bottomGrid}>
          {/* Order Summary */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div className={styles.summaryTable}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, currency)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>
                  {parseFloat(String(order.shipping_amount ?? 0)) === 0
                    ? "FREE"
                    : formatPrice(order.shipping_amount, currency)}
                </span>
              </div>
              {hasTax && (
                <div className={styles.summaryRow}>
                  <span>Tax</span>
                  <span>{formatPrice(order.tax_amount, currency)}</span>
                </div>
              )}
              {hasDiscount && (
                <div className={styles.summaryRow} style={{ color: "var(--color-secondary)" }}>
                  <span>Discount</span>
                  <span>−{formatPrice(order.discount_amount, currency)}</span>
                </div>
              )}
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>{formatPrice(order.total_amount, currency)}</span>
              </div>
            </div>
          </section>

          {/* Shipping Address (SNAPSHOT — not live saved address) */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Shipped To</h2>
            {addr ? (
              <address className={styles.address}>
                <strong>{addr.fullName ?? order.customer_name}</strong><br />
                {addr.line1}
                {addr.line2 && <><br />{addr.line2}</>}
                <br />
                {addr.city}, {addr.state}
                {addr.postalCode && ` – ${addr.postalCode}`}
                <br />
                {addr.country === "IN" ? "India" : (addr.country ?? "India")}
              </address>
            ) : (
              <p className={styles.noAddress}>Address snapshot not available.</p>
            )}

            <div className={styles.contactInfo}>
              <p>{order.customer_name}</p>
              <p>{order.customer_phone}</p>
            </div>
          </section>
        </div>

        {/* Reorder — Architecture ready, not yet functional (Phase 8: payment) */}
        <div className={styles.reorderSection}>
          <button
            className={styles.reorderBtn}
            disabled
            title="Reorder will be available after payment integration"
            aria-disabled="true"
          >
            Reorder (Coming Soon)
          </button>
        </div>
      </div>
    </AccountShell>
  );
}
