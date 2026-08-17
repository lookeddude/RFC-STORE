/**
 * RFC Store - Admin Shipment Detail
 * Full shipment management for a single order.
 * Shows order items, address, tracking form, status timeline.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TrackingUpdater } from '../../../admin/orders/[id]/TrackingUpdater';
import { OrderStatusUpdater } from '../../../admin/orders/[id]/OrderStatusUpdater';
import { AdminBadge, orderStatusBadge, paymentStatusBadge } from '@/components/admin/AdminBadge';
import styles from '@/components/admin/admin-page.module.css';
import detailStyles from '../../admin/orders/[id]/orderDetail.module.css';

export const metadata: Metadata = {
  title: 'Shipment Detail - Admin RFC Store',
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

const COURIER_TRACKING_URLS: Record<string, string> = {
  Delhivery: 'https://www.delhivery.com/track/package/',
  Bluedart:  'https://www.bluedart.com/tracking',
  DTDC:      'https://www.dtdc.in/tracking.asp',
  'Ecom Express': 'https://ecomexpress.in/tracking/',
  Shadowfax: 'https://track.shadowfax.in/',
  XpressBees: 'https://www.xpressbees.com/track',
  'India Post': 'https://www.indiapost.gov.in/vas/pages/trackconsignment.aspx',
  FedEx:     'https://www.fedex.com/en-in/tracking.html',
};

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: rawOrder } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();

  if (!rawOrder) notFound();
  const order = rawOrder as any;
  const items = (order.order_items ?? []) as any[];
  const addr = order.shipping_address as Record<string, string> | null;
  const oStatus = orderStatusBadge(order.status);
  const pStatus = paymentStatusBadge(order.payment_status);
  const trackingUrl = order.tracking_courier ? COURIER_TRACKING_URLS[order.tracking_courier] : null;

  // Status timeline steps
  const steps = [
    { key: 'confirmed', label: 'Order Confirmed' },
    { key: 'shipped',    label: 'Dispatched' },
    { key: 'delivered',  label: 'Delivered' },
  ];
  const stepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <Link href='/admin/shipments' style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            Back to Shipments
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 6 }}>
            Shipment for {order.order_number}
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <AdminBadge label={oStatus.label} variant={oStatus.variant} size='md' />
            <AdminBadge label={pStatus.label} variant={pStatus.variant} size='md' />
            <Link href={`/admin/orders/${order.id}`}
              style={{ fontSize: 12, color: '#2563eb', textDecoration: 'underline' }}>
              View full order
            </Link>
          </div>
        </div>
      </div>

      <div className={detailStyles.layout}>
        {/* Main column */}
        <div className={detailStyles.main}>

          {/* Delivery Timeline */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Delivery Timeline</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 16 }}>
              {steps.map((step, i) => {
                const done = i <= stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: done ? (active ? '#E63946' : '#16a34a') : '#e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {done ? (
                          <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='3'>
                            <path d='M20 6L9 17l-5-5'/>
                          </svg>
                        ) : (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? '#E63946' : done ? '#374151' : '#9ca3af', whiteSpace: 'nowrap' }}>
                        {step.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: i < stepIndex ? '#16a34a' : '#e5e7eb', margin: '0 8px', marginBottom: 22 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Items to Ship</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.bold}>{item.product_name_snapshot}</div>
                        {item.variant_name_snapshot && <div className={styles.muted}>{item.variant_name_snapshot}</div>}
                      </td>
                      <td className={styles.muted} style={{ fontFamily: 'monospace', fontSize: 11 }}>{item.sku_snapshot ?? ''}</td>
                      <td className={styles.bold}>{item.quantity}</td>
                      <td>{formatPrice(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={detailStyles.sidebar}>

          {/* Tracking - primary action */}
          <div className={detailStyles.card} style={{ borderLeft: '3px solid #E63946' }}>
            <h2 className={detailStyles.cardTitle}>Shipment Tracking</h2>
            {order.tracking_number && (
              <div style={{ marginBottom: 16 }}>
                <p className={detailStyles.fieldLabel}>Current Tracking Number</p>
                <p className={detailStyles.fieldValue} style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>
                  {order.tracking_number}
                </p>
                {order.tracking_courier && (
                  <>
                    <p className={detailStyles.fieldLabel} style={{ marginTop: 8 }}>Courier</p>
                    <p className={detailStyles.fieldValue}>{order.tracking_courier}</p>
                  </>
                )}
                {trackingUrl && (
                  <a href={trackingUrl} target='_blank' rel='noopener noreferrer'
                    style={{ fontSize: 12, color: '#2563eb', textDecoration: 'underline', display: 'block', marginTop: 8 }}>
                    Track on {order.tracking_courier} website
                  </a>
                )}
              </div>
            )}
            <TrackingUpdater
              orderId={order.id}
              currentTrackingNumber={order.tracking_number ?? null}
              currentCourier={order.tracking_courier ?? null}
            />
          </div>

          {/* Order Status */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Order Status</h2>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Shipping Address */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Ship To</h2>
            {addr ? (
              <div className={detailStyles.address}>
                {addr.full_name && <p style={{ fontWeight: 700 }}>{addr.full_name}</p>}
                {addr.phone && <p style={{ color: '#6b7280' }}>{addr.phone}</p>}
                <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                  {addr.line1 && <p>{addr.line1}</p>}
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}</p>
                  {addr.country && <p>{addr.country}</p>}
                </div>
              </div>
            ) : (
              <p className={detailStyles.fieldValue} style={{ color: '#9ca3af' }}>No address on file</p>
            )}
          </div>

          {/* Customer */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Customer</h2>
            <p className={detailStyles.fieldLabel}>Name</p>
            <p className={detailStyles.fieldValue}>{order.customer_name}</p>
            <p className={detailStyles.fieldLabel}>Phone</p>
            <p className={detailStyles.fieldValue}>{order.customer_phone}</p>
            <p className={detailStyles.fieldLabel}>Email</p>
            <p className={detailStyles.fieldValue}>{order.customer_email}</p>
            <p className={detailStyles.fieldLabel}>Order Date</p>
            <p className={detailStyles.fieldValue}>{formatDate(order.created_at)}</p>
          </div>

          {/* Invoice */}
          <div className={detailStyles.card}>
            <h2 className={detailStyles.cardTitle}>Documents</h2>
            <a href={`/api/invoices/${order.id}`} target='_blank' rel='noopener noreferrer'
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-label)',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              Download Invoice (PDF)
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
