/**
 * RFC Store - Admin Shipments
 * Lists all orders that need shipping attention.
 * Filter: all / pending-dispatch / shipped / delivered
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from '@/components/admin/admin-page.module.css';

export const metadata: Metadata = {
  title: 'Shipments - Admin RFC Store',
  robots: { index: false, follow: false },
};

const STATUS_FILTERS = [
  { label: 'All Orders', value: 'all' },
  { label: 'Needs Dispatch', value: 'confirmed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = 'all' } = await searchParams;
  const supabase = await createClient();

  // Fetch orders relevant to shipping (exclude pending + cancelled)
  let query = supabase
    .from('orders')
    .select('id, order_number, status, customer_name, customer_email, customer_phone, created_at, total_amount, shipping_amount, tracking_number, tracking_courier, shipping_address')
    .not('status', 'in', '(pending,cancelled)')
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data: rawOrders = [] } = await query;
  const orders = rawOrders ?? [];

  const unshipped = (orders as any[]).filter((o: any) => !o.tracking_number && o.status !== 'delivered').length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <h1 className={styles.pageTitle}>Shipments</h1>
          <p className={styles.pageSubtitle}>
            Manage dispatch, tracking and delivery for all orders.
            {unshipped > 0 && (
              <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: 8 }}>
                {unshipped} order{unshipped !== 1 ? 's' : ''} need{unshipped === 1 ? 's' : ''} tracking
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/admin/shipments' : `/admin/shipments?filter=${f.value}`}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-label)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
              background: filter === f.value ? '#0A0E14' : '#fff',
              color: filter === f.value ? '#fff' : '#374151',
              border: '1px solid' + (filter === f.value ? ' #0A0E14' : ' #e5e7eb'),
            }}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(orders as any[]).map((order) => {
              const addr = order.shipping_address as Record<string,string> | null;
              const city = addr?.city ?? '';
              const needsTracking = !order.tracking_number && order.status !== 'delivered';
              return (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}
                      style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>
                      {order.order_number}
                    </Link>
                  </td>
                  <td>
                    <div className={styles.bold}>{order.customer_name}</div>
                    {city && <div className={styles.muted} style={{ fontSize: 11 }}>{city}</div>}
                  </td>
                  <td className={styles.muted}>{formatDate(order.created_at)}</td>
                  <td>{formatPrice(order.total_amount)}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: order.status === 'shipped' ? '#eff6ff' : order.status === 'delivered' ? '#f0fdf4' : '#fefce8',
                      color: order.status === 'shipped' ? '#1d4ed8' : order.status === 'delivered' ? '#15803d' : '#854d0e',
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.tracking_number ? (
                      <div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11 }}>{order.tracking_number}</div>
                        {order.tracking_courier && <div className={styles.muted} style={{ fontSize: 11 }}>{order.tracking_courier}</div>}
                      </div>
                    ) : (
                      <span style={{ color: needsTracking ? '#dc2626' : '#9ca3af', fontSize: 12 }}>
                        {needsTracking ? 'No tracking' : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/shipments/${order.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '5px 12px',
                        background: needsTracking ? '#E63946' : '#f3f4f6',
                        color: needsTracking ? '#fff' : '#374151',
                        borderRadius: 6, fontSize: 12, fontWeight: 600,
                        textDecoration: 'none',
                        fontFamily: 'var(--font-label)',
                      }}
                    >
                      {needsTracking ? 'Add Tracking' : 'Manage'}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                No orders found for this filter.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
