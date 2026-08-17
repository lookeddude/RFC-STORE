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
  const { data: orderRaw, error } = await admin
    .from("orders")
    .select(`
      id, order_number, status, payment_status, payment_method, user_id,
      customer_name, customer_email, customer_phone,
      shipping_address, subtotal, shipping_amount, tax_amount,
      discount_amount, cod_fee, total_amount, currency, created_at,
      razorpay_payment_id,
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

  const order = orderRaw as unknown as {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
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
    cod_fee: number;
    total_amount: number;
    currency: string;
    created_at: string;
    razorpay_payment_id: string | null;
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

  // Security: if this order belongs to a specific user, verify the authenticated user matches.
  const { data: { user: sessionUser } } = await supabase.auth.getUser();
  if (order.user_id) {
    if (!sessionUser || sessionUser.id !== order.user_id) {
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
            <CheckIcon size={32} strokeWidth={2.5} color="#fff" />
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
                {Number(order.cod_fee) > 0 && (
                  <div className={styles.totalRow}>
                    <span>COD Handling Fee</span>
                    <span>{formatPrice(Number(order.cod_fee))}</span>
                  </div>
                )}
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
                    <div className={styles.stepTitle}>Order Processing</div>
                    <div className={styles.stepDesc}>
                      A confirmation has been sent to <strong>{order.customer_email}</strong>. Your order is being prepared for dispatch.
                    </div>
                  </div>
                </li>
                <li className={styles.step}>
                  <div className={styles.stepNum}>3</div>
                  <div>
                    <div className={styles.stepTitle}>Dispatch &amp; Delivery</div>
                    <div className={styles.stepDesc}>
                      Estimated delivery by <strong>{estimatedDelivery}</strong>.
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

              {/* Payment Method Info */}
              {order.payment_method === 'razorpay' ? (
                <div className={styles.codPaymentBlock}>
                  <div className={styles.codPaymentHeader}>
                    <span className={styles.codPaymentIcon}>
                      <LockIcon />
                    </span>
                    <div>
                      <p className={styles.codPaymentTitle}>Online Payment — Paid</p>
                      <p className={styles.codPaymentText}>
                        Your payment of <strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong> was processed securely via Razorpay.
                      </p>
                      {order.razorpay_payment_id && (
                        <p className={styles.txnId}>
                          Transaction ID: {order.razorpay_payment_id}
                        </p>
                      )}
                    </div>
                  </div>
                  <ul className={styles.codSteps}>
                    <li>
                      <CheckIcon size={14} color="#15803d" />
                      <span>Payment received &amp; verified</span>
                    </li>
                    <li>
                      <CheckIcon size={14} color="#15803d" />
                      <span>Order confirmed</span>
                    </li>
                    <li>
                      <ClockIcon size={14} color="#15803d" />
                      <span>Processing &amp; dispatch (2–3 days)</span>
                    </li>
                    <li>
                      <TruckIcon size={14} color="#15803d" />
                      <span>Delivered to your address</span>
                    </li>
                  </ul>
                  {/* Invoice download */}
                  <a
                    href={`/api/invoices/${order.id}`}
                    className={styles.invoiceBtn}
                  >
                    <FileTextIcon />
                    <span>Download Invoice</span>
                  </a>
                </div>
              ) : (
                <div className={styles.codPaymentBlock}>
                  <div className={styles.codPaymentHeader}>
                    <span className={styles.codPaymentIcon}>
                      <BanknoteIcon />
                    </span>
                    <div>
                      <p className={styles.codPaymentTitle}>Cash on Delivery</p>
                      <p className={styles.codPaymentText}>
                        Keep <strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong> ready when your order arrives.
                      </p>
                    </div>
                  </div>
                  <ul className={styles.codSteps}>
                    <li>
                      <CheckIcon size={14} color="#15803d" />
                      <span>Order placed &amp; confirmed</span>
                    </li>
                    <li>
                      <ClockIcon size={14} color="#15803d" />
                      <span>Processing &amp; dispatch (2–3 days)</span>
                    </li>
                    <li>
                      <TruckIcon size={14} color="#15803d" />
                      <span>Out for delivery</span>
                    </li>
                    <li>
                      <BanknoteIcon size={14} color="#15803d" />
                      <span>Pay on delivery &amp; receive</span>
                    </li>
                  </ul>
                </div>
              )}
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

// ── Icons ──────────────────────────────────────────────────

function CheckIcon({ size = 16, strokeWidth = 2.5, color = "currentColor" }: { size?: number; strokeWidth?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BanknoteIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function ClockIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TruckIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
