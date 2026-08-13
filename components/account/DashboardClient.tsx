import Link from "next/link";
import type { ProfileRow, AddressRow, OrderListItem } from "@/types/account";
import { ORDER_STATUS_LABELS } from "@/types/account";
import { ROUTES } from "@/lib/constants/site";
import styles from "./DashboardClient.module.css";

interface DashboardClientProps {
  profile: ProfileRow | null;
  recentOrder: OrderListItem | null;
  defaultAddress: AddressRow | null;
  email: string;
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
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * RFC Store — Account Dashboard Bento Grid
 * Server component — receives pre-fetched data from page.tsx
 */
export function DashboardClient({
  profile,
  recentOrder,
  defaultAddress,
  email,
}: DashboardClientProps) {
  return (
    <div className={styles.grid}>
      {/* ── Recent Order ─────────────────────────────────── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Recent Order</h2>
            {recentOrder && (
              <p className={styles.orderMeta}>{recentOrder.order_number}</p>
            )}
          </div>
          {recentOrder && (
            <span className={styles.statusBadge}>
              {ORDER_STATUS_LABELS[recentOrder.status] ?? recentOrder.status}
            </span>
          )}
        </div>

        {recentOrder ? (
          <>
            <div className={styles.orderProduct}>
              <div className={styles.orderProductIcon}>
                {/* Generic icon — we store snapshots not images in MVP */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                  <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <div>
                <p className={styles.orderProductName}>
                  {recentOrder.item_count} {recentOrder.item_count === 1 ? "item" : "items"}
                </p>
                <p className={styles.orderProductMeta}>
                  Placed {formatDate(recentOrder.created_at)}
                </p>
                <p className={styles.orderProductPrice}>
                  {formatPrice(recentOrder.total_amount, recentOrder.currency)}
                </p>
              </div>
            </div>
            <Link
              href={`/account/orders/${recentOrder.order_number}`}
              className={styles.viewOrderLink}
            >
              View Order Details →
            </Link>
          </>
        ) : (
          <div className={styles.emptyCard}>
            <p className={styles.emptyText}>No orders yet.</p>
            <Link href={ROUTES.shop} className={styles.emptyBtn}>
              Start Shopping →
            </Link>
          </div>
        )}
      </div>

      {/* ── Right Column ─────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Default Address ──────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Default Address</h2>
            <Link href={ROUTES.account.addresses} className={styles.cardLink}>
              {defaultAddress ? "Edit" : "Add"}
            </Link>
          </div>
          {defaultAddress ? (
            <address className={styles.address}>
              <span className={styles.addressName}>{defaultAddress.full_name}</span>
              {defaultAddress.line1}
              {defaultAddress.line2 && <>, {defaultAddress.line2}</>}
              <br />
              {defaultAddress.city}, {defaultAddress.state} – {defaultAddress.postal_code}
              <br />
              {defaultAddress.country === "IN" ? "India" : defaultAddress.country}
            </address>
          ) : (
            <div className={styles.emptyCard}>
              <p className={styles.emptyText}>No saved address.</p>
              <Link href={`${ROUTES.account.addresses}/new`} className={styles.emptyBtn}>
                Add Address
              </Link>
            </div>
          )}
        </div>

        {/* ── Profile Details ───────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Profile Details</h2>
            <Link href={ROUTES.account.profile} className={styles.cardLink}>
              Manage
            </Link>
          </div>
          <div>
            <div className={styles.profileRow}>
              {/* Email icon */}
              <svg className={styles.profileIcon} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span>{email}</span>
            </div>
            {profile?.phone && (
              <div className={styles.profileRow}>
                {/* Phone icon */}
                <svg className={styles.profileIcon} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.28 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{profile.phone}</span>
              </div>
            )}
            {!profile?.phone && (
              <p className={styles.emptyText} style={{ fontSize: 13, marginTop: 4 }}>
                No phone number added.{" "}
                <Link href={ROUTES.account.profile} className={styles.cardLink}>
                  Add now
                </Link>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
