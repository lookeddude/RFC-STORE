/**
 * RFC Store — Track Order Page
 *
 * Route: /track-order
 *
 * Allows guests to look up any order by entering their email address
 * and order number. Returns full order details — items, status, address,
 * tracking info.
 *
 * Security:
 *   - Email + order number together authenticate the request (two factors)
 *   - Lookup is performed server-side via /api/orders/lookup
 *   - No session or auth token required
 *   - Rate-limited at the API route level
 */
'use client';

import { useState, useRef, FormEvent } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// ── Types ─────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
  sku_snapshot: string | null;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}

interface ShippingAddress {
  fullName?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
}

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer_name: string;
  shipping_address: ShippingAddress | null;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  cod_fee: number;
  total_amount: number;
  currency: string;
  created_at: string;
  razorpay_payment_id: string | null;
  tracking_number: string | null;
  tracking_courier: string | null;
  order_items: OrderItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────

function formatPrice(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_LABELS: Record<string, string> = {
  pending:          'Pending',
  pending_payment:  'Awaiting Payment',
  confirmed:        'Confirmed',
  processing:       'Processing',
  shipped:          'Shipped',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
  refund_pending:   'Refund Pending',
};

const PAY_LABELS: Record<string, string> = {
  pending:          'Pay on Delivery',
  paid:             'Paid',
  failed:           'Failed',
  refunded:         'Refunded',
  refund_pending:   'Refund Pending',
};

// ── Main Component ────────────────────────────────────────────────────

export default function TrackOrderPage() {
  const [email,       setEmail]       = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [order,       setOrder]       = useState<OrderData | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), orderNumber: orderNumber.trim() }),
      });

      const data = await res.json() as { order?: OrderData; error?: string };

      if (!res.ok || !data.order) {
        setError(data.error ?? 'No order found. Please double-check your details.');
      } else {
        setOrder(data.order);
        // Scroll to results
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    } catch {
      setError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setOrder(null);
    setError(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Page Header ──────────────────────────────── */}
        <header className={styles.header}>
          <p className={styles.eyebrow}>RFC Store</p>
          <h1 className={styles.title}>Track Your Order</h1>
          <p className={styles.subtitle}>
            Enter the email address you used at checkout and your order number to see live status and details.
          </p>
        </header>

        {/* ── Search Form ──────────────────────────────── */}
        {!order && (
          <section className={styles.searchCard}>
            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="to-email" className={styles.label}>
                    Email Address
                  </label>
                  <input
                    id="to-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={styles.input}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    maxLength={254}
                    aria-invalid={error ? 'true' : undefined}
                    disabled={loading}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="to-order-number" className={styles.label}>
                    Order Number
                  </label>
                  <input
                    id="to-order-number"
                    type="text"
                    autoComplete="off"
                    placeholder="RFC-20260818-123456"
                    className={styles.input}
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                    required
                    maxLength={30}
                    aria-invalid={error ? 'true' : undefined}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className={styles.errorBox} role="alert">
                  <AlertIcon />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !email.trim() || !orderNumber.trim()}
              >
                {loading ? (
                  <><span className={styles.spinner} aria-hidden /> Searching…</>
                ) : (
                  <><SearchIcon /> Find My Order</>
                )}
              </button>
            </form>

            <p className={styles.formHelp}>
              Your order number is in your confirmation email (format: RFC-YYYYMMDD-XXXXXX).{' '}
              Need help?{' '}
              <a href="mailto:revivefightclub@gmail.com">Contact us</a>.
            </p>
          </section>
        )}

        {/* ── Order Result ─────────────────────────────── */}
        {order && (
          <div className={styles.resultWrap} ref={resultRef}>

            <div className={styles.resultHeader}>
              <h2 className={styles.resultTitle}>Order Details</h2>
              <div className={styles.orderNumBadge}>
                <span className={styles.orderNumLabel}>Order Number</span>
                <span className={styles.orderNum}>{order.order_number}</span>
              </div>
            </div>

            {/* Status Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                Order Status · Placed {formatDate(order.created_at)}
              </h3>

              <div className={styles.statusGrid}>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Order</span>
                  <span className={`${styles.statusBadge} ${styles[order.status] ?? ''}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Payment</span>
                  <span className={`${styles.statusBadge} ${styles[`pay_${order.payment_status}`] ?? ''}`}>
                    {PAY_LABELS[order.payment_status] ?? order.payment_status}
                  </span>
                </div>
              </div>

              {/* Tracking Info */}
              {order.tracking_number && (
                <div className={styles.trackingCard}>
                  <p className={styles.trackingLabel}>Shipment Tracking</p>
                  {order.tracking_courier && (
                    <p className={styles.trackingRow}>
                      Courier: <strong>{order.tracking_courier}</strong>
                    </p>
                  )}
                  <p className={styles.trackingRow}>
                    Tracking #: <strong>{order.tracking_number}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Items Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Items Ordered</h3>
              <ul className={styles.itemList}>
                {order.order_items.map(item => (
                  <li key={item.id} className={styles.item}>
                    <div>
                      <div className={styles.itemName}>{item.product_name_snapshot}</div>
                      {item.variant_name_snapshot && (
                        <div className={styles.itemVariant}>{item.variant_name_snapshot}</div>
                      )}
                    </div>
                    <div className={styles.itemRight}>
                      <span className={styles.itemQty}>×{item.quantity}</span>
                      <span className={styles.itemTotal}>{formatPrice(Number(item.line_total))}</span>
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
                  <span>
                    {Number(order.shipping_amount) === 0
                      ? 'FREE'
                      : formatPrice(Number(order.shipping_amount))}
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
                    <span>−{formatPrice(Number(order.discount_amount))}</span>
                  </div>
                )}
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total_amount))}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            {order.shipping_address && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Shipping To</h3>
                <address className={styles.address}>
                  {order.shipping_address.fullName && (
                    <div className={styles.addrName}>{order.shipping_address.fullName}</div>
                  )}
                  {order.shipping_address.line1 && <div>{order.shipping_address.line1}</div>}
                  {order.shipping_address.line2 && <div>{order.shipping_address.line2}</div>}
                  {order.shipping_address.city && (
                    <div>
                      {order.shipping_address.city}
                      {order.shipping_address.state ? `, ${order.shipping_address.state}` : ''}
                      {order.shipping_address.postalCode ? ` – ${order.shipping_address.postalCode}` : ''}
                    </div>
                  )}
                  {order.shipping_address.country && (
                    <div>
                      {order.shipping_address.country === 'IN' ? 'India' : order.shipping_address.country}
                    </div>
                  )}
                </address>
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <button onClick={handleReset} className={styles.newSearchBtn}>
                ← Track Another Order
              </button>

              <div className={styles.loginPrompt}>
                <p>
                  Have an account?{' '}
                  <Link href={`/login?redirect=/account/orders`}>Log in</Link>
                  {' '}to see all your orders in one place.
                  Placed this order as a guest?{' '}
                  <Link href={`/signup`}>Create an account</Link>
                  {' '}with the same email to automatically link it.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true"
      style={{ flexShrink: 0, color: 'var(--rfc-error)', marginTop: '1px' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
