/**
 * RFC Store — Order Confirmation Page
 *
 * Route: /order-confirmation/[orderNumber]
 *
 * Security:
 *   - Reads order via admin client server-side
 *   - user_id check: if order has user_id, must match session user
 *   - Guest orders (user_id = null): accessible by URL only
 *   - No customer data injected into page metadata
 *   - orderNumber is RFC-YYYYMMDD-XXXXXX format (not a UUID)
 *
 * If orderNumber doesn't exist → notFound()
 * If authenticated user tries to view another user's order → notFound()
 *
 * Phase 7 integration: link to order history in account dashboard
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";
import { SHIPPING_CONFIG } from "@/lib/config/shipping";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export const metadata: Metadata = {
  title: "Order Confirmed | REVIVE FIGHT CLUB",
  description: "Your RFC Store order has been placed successfully.",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;

  // Sanitize — order numbers are RFC-YYYYMMDD-XXXXXX format
  if (!orderNumber || !/^RFC-\d{8}-\d+$/.test(orderNumber)) {
    notFound();
  }

  const admin = createAdminClient();
  const supabase = await createClient();

  // Fetch order with items (admin client — bypasses RLS for server-side render)
  // user_id included here to avoid a second DB round-trip for the security check below
  const { data: orderRaw, error } = await admin
    .from("orders")
    .select(`
      id, order_number, status, payment_status, user_id,
      customer_name, customer_email, customer_phone,
      shipping_address, subtotal, shipping_amount, tax_amount,
      discount_amount, total_amount, currency, created_at,
      order_items (
        id, product_name_snapshot, variant_name_snapshot,
        sku_snapshot, unit_price_snapshot, quantity, line_total
      )
    `)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !orderRaw) {
    notFound();
  }

  const order = orderRaw as {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    user_id: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: {
      fullName: string; phone: string; line1: string; line2?: string | null;
      city: string; state: string; postalCode: string; country: string;
    };
    subtotal: number;
    shipping_amount: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
    created_at: string;
    order_items: Array<{
      id: string;
      product_name_snapshot: string;
      variant_name_snapshot: string | null;
      sku_snapshot: string | null;
      unit_price_snapshot: number;
      quantity: number;
      line_total: number;
    }>;
  };

  // Security: if this order belongs to a specific user, verify session matches.
  // user_id is already available from the first query — no second DB round-trip needed.
  const { data: { session } } = await supabase.auth.getSession();
  if (order.user_id) {
    if (!session?.user || session.user.id !== order.user_id) {
      notFound();
    }
  }

  const addr = order.shipping_address;
  const estimatedDelivery = (() => {
    const d = new Date(order.created_at);
    d.setDate(d.getDate() + SHIPPING_CONFIG.ESTIMATED_DAYS_MAX);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Success Hero ──────────────────────────────── */}
        <div className={styles.hero}>
          <div className={styles.checkCircle} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className={styles.heroTitle}>Order Confirmed!</h1>
          <p className={styles.heroSub}>
            Thank you, <strong>{order.customer_name}</strong>. Your order is being prepared.
          </p>
          <div className={styles.orderNumBadge}>
            <span className={styles.orderNumLabel}>Order Number</span>
            <span className={styles.orderNum}>{order.order_number}</span>
          </div>
        </div>

        <div className={styles.layout}>

          {/* ── Left Column ──────────────────────────────── */}
          <div className={styles.leftCol}>

            {/* Order Items */}
            <section className={styles.card} aria-label="Order items">
              <h2 className={styles.cardTitle}>Items Ordered</h2>
              <ul className={styles.itemList}>
                {order.order_items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.product_name_snapshot}</div>
                      {item.variant_name_snapshot && (
                        <div className={styles.itemVariant}>{item.variant_name_snapshot}</div>
                      )}
                      {item.sku_snapshot && (
                        <div className={styles.itemSku}>SKU: {item.sku_snapshot}</div>
                      )}
                    </div>
                    <div className={styles.itemRight}>
                      <div className={styles.itemQty}>×{item.quantity}</div>
                      <div className={styles.itemTotal}>{formatPrice(Number(item.line_total))}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Shipping</span>
                  <span data-free={Number(order.shipping_amount) === 0}>
                    {Number(order.shipping_amount) === 0 ? "FREE" : formatPrice(Number(order.shipping_amount))}
                  </span>
                </div>
                {Number(order.tax_amount) > 0 && (
                  <div className={styles.totalRow}>
                    <span>Tax</span>
                    <span>{formatPrice(Number(order.tax_amount))}</span>
                  </div>
                )}
                {Number(order.discount_amount) > 0 && (
                  <div className={styles.totalRow}>
                    <span>Discount</span>
                    <span className={styles.discountVal}>−{formatPrice(Number(order.discount_amount))}</span>
                  </div>
                )}
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total_amount))}</span>
                </div>
              </div>
            </section>

            {/* What's Next */}
            <section className={styles.card} aria-label="Next steps">
              <h2 className={styles.cardTitle}>What Happens Next?</h2>
              <ol className={styles.steps}>
                <li className={styles.step}>
                  <div className={styles.stepNum}>1</div>
                  <div>
                    <div className={styles.stepTitle}>Order Confirmed</div>
                    <div className={styles.stepDesc}>Your order has been received and saved securely.</div>
                  </div>
                </li>
                <li className={styles.step}>
                  <div className={styles.stepNum}>2</div>
                  <div>
                    <div className={styles.stepTitle}>Payment Processing</div>
                    <div className={styles.stepDesc}>
                      Our team will contact you at <strong>{order.customer_email}</strong> to complete payment.
                    </div>
                  </div>
                </li>
                <li className={styles.step}>
                  <div className={styles.stepNum}>3</div>
                  <div>
                    <div className={styles.stepTitle}>Dispatch &amp; Delivery</div>
                    <div className={styles.stepDesc}>
                      Estimated delivery by <strong>{estimatedDelivery}</strong> after payment.
                    </div>
                  </div>
                </li>
              </ol>
            </section>
          </div>

          {/* ── Right Column ─────────────────────────────── */}
          <div className={styles.rightCol}>

            {/* Shipping Address */}
            <section className={styles.card} aria-label="Shipping address">
              <h2 className={styles.cardTitle}>Shipping To</h2>
              <address className={styles.address}>
                <div className={styles.addrName}>{addr.fullName}</div>
                <div>{addr.line1}</div>
                {addr.line2 && <div>{addr.line2}</div>}
                <div>{addr.city}, {addr.state} – {addr.postalCode}</div>
                <div>{addr.country === "IN" ? "India" : addr.country}</div>
                <div className={styles.addrPhone}>{addr.phone}</div>
              </address>
            </section>

            {/* Order Status */}
            <section className={styles.card} aria-label="Order status">
              <h2 className={styles.cardTitle}>Order Status</h2>
              <div className={styles.statusGrid}>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Order</span>
                  <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Payment</span>
                  <span className={`${styles.statusBadge} ${styles[`pay_${order.payment_status}`]}`}>
                    {order.payment_status === "pending" ? "Pay on Delivery" : order.payment_status}
                  </span>
                </div>
              </div>

              {/* COD Payment Info */}
              <div className={styles.codPaymentBlock}>
                <div className={styles.codPaymentHeader}>
                  <span className={styles.codPaymentIcon}>💵</span>
                  <div>
                    <p className={styles.codPaymentTitle}>Cash on Delivery</p>
                    <p className={styles.codPaymentText}>
                      Keep <strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong> ready when your order arrives.
                    </p>
                  </div>
                </div>
                <ul className={styles.codSteps}>
                  <li>✓ Order placed &amp; confirmed</li>
                  <li>⏳ Processing &amp; dispatch (2–3 days)</li>
                  <li>🚚 Out for delivery</li>
                  <li>💵 Pay on delivery &amp; receive</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className={styles.card} aria-label="Contact information">
              <h2 className={styles.cardTitle}>Confirmation Sent To</h2>
              <p className={styles.contactEmail}>{order.customer_email}</p>
              <p className={styles.contactNote}>
                Keep your order number <strong>{order.order_number}</strong> for reference.
              </p>
            </section>
          </div>
        </div>

        {/* ── Footer CTAs ───────────────────────────────── */}
        <div className={styles.footer}>
          <Link href="/shop" className={styles.shopBtn}>
            CONTINUE SHOPPING
          </Link>
          <Link href="/" className={styles.homeLink}>
            Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
