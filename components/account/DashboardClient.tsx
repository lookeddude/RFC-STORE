"use client";
/**
 * RFC Store — Account Dashboard (Redesigned)
 *
 * Overview content area. Receives pre-fetched data from page.tsx.
 * Layout: Recent Order | Default Address | Support
 *
 * 'use client' for potential future micro-interactions.
 * All data is passed as props — no client fetching.
 */
import React from "react";
import Link from "next/link";
import type { ProfileRow, AddressRow, OrderListItem } from "@/types/account";

import { ROUTES } from "@/lib/constants/site";
import styles from "./DashboardClient.module.css";

interface DashboardClientProps {
  profile: ProfileRow | null;
  recentOrder: OrderListItem | null;
  defaultAddress: AddressRow | null;
  email: string;
}

function formatPrice(amount: number | string, currency = "INR") {
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

/** Maps order status to a user-facing label + color class */
function statusConfig(status: string): { label: string; cls: string } {
  const map: Record<string, { label: string; cls: string }> = {
    pending:    { label: "Order Placed",   cls: "pending" },
    confirmed:  { label: "Confirmed",      cls: "confirmed" },
    processing: { label: "Processing",     cls: "processing" },
    shipped:    { label: "Shipped",        cls: "shipped" },
    delivered:  { label: "Delivered",      cls: "delivered" },
    cancelled:  { label: "Cancelled",      cls: "cancelled" },
    refunded:   { label: "Refunded",       cls: "cancelled" },
  };
  return map[status] ?? { label: status, cls: "pending" };
}

export function DashboardClient({
  recentOrder,
  defaultAddress,
  email,
}: DashboardClientProps) {
  const orderStatus = recentOrder ? statusConfig(recentOrder.status) : null;

  return (
    <div className={styles.grid}>
      {/* ── Recent Order ─────────────────────────────────── */}
      <section className={styles.orderSection} aria-label="Recent order">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recent Order</h2>
          {recentOrder && (
            <Link href={ROUTES.account.orders} className={styles.sectionLink}>
              All orders →
            </Link>
          )}
        </div>

        {recentOrder ? (
          <div className={styles.orderCard}>
            {/* Order header row */}
            <div className={styles.orderTopRow}>
              <div>
                <p className={styles.orderNumber}>{recentOrder.order_number}</p>
                <p className={styles.orderDate}>
                  {formatDate(recentOrder.created_at)}
                </p>
              </div>
              <span
                className={`${styles.statusPill} ${styles[`status_${orderStatus?.cls}`]}`}
                role="status"
              >
                {orderStatus?.label}
              </span>
            </div>

            {/* Order body */}
            <div className={styles.orderBody}>
              <div className={styles.orderIconRow}>
                <div className={styles.orderIconThumb} aria-hidden="true">
                  <PackageIcon />
                </div>
                <div className={styles.orderDetails}>
                  <span className={styles.orderItemCount}>
                    {recentOrder.item_count}{" "}
                    {recentOrder.item_count === 1 ? "item" : "items"}
                  </span>
                  <span className={styles.orderTotal}>
                    {formatPrice(recentOrder.total_amount, recentOrder.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <Link
              href={`/account/orders/${recentOrder.order_number}`}
              className={styles.viewOrderBtn}
              aria-label={`View order ${recentOrder.order_number}`}
            >
              View Order Details
              <ArrowRightIcon />
            </Link>
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <PackageIcon size={32} />
            </div>
            <p className={styles.emptyTitle}>No orders yet</p>
            <p className={styles.emptyText}>
              Your next training session deserves the right gear.
            </p>
            <Link href={ROUTES.shop} className={styles.emptyBtn}>
              Shop RFC Gear
            </Link>
          </div>
        )}
      </section>

      {/* ── Right column ─────────────────────────────────── */}
      <div className={styles.rightCol}>
        {/* Default Address */}
        <section className={styles.addressSection} aria-label="Default shipping address">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Default Address</h2>
            <Link
              href={ROUTES.account.addresses}
              className={styles.sectionLink}
            >
              {defaultAddress ? "Manage" : "Add"} →
            </Link>
          </div>

          {defaultAddress ? (
            <div className={styles.addressCard}>
              <div className={styles.addressLabelRow}>
                <span className={styles.addressLabelPill}>
                  {defaultAddress.label ?? "HOME"}
                </span>
                <span className={styles.defaultBadge}>Default</span>
              </div>
              <address className={styles.addressBody}>
                <strong className={styles.addressName}>
                  {defaultAddress.full_name}
                </strong>
                <br />
                {defaultAddress.line1}
                {defaultAddress.line2 && <>, {defaultAddress.line2}</>}
                <br />
                {defaultAddress.city}, {defaultAddress.state}{" "}
                {defaultAddress.postal_code}
                <br />
                {defaultAddress.country === "IN" ? "India" : defaultAddress.country}
              </address>
              <Link
                href={`/account/addresses/${defaultAddress.id}/edit`}
                className={styles.editAddressBtn}
              >
                Edit Address
              </Link>
            </div>
          ) : (
            <div className={styles.emptyAddressCard}>
              <p className={styles.emptyAddressText}>
                Add a shipping address to check out faster next time.
              </p>
              <Link
                href={`${ROUTES.account.addresses}/new`}
                className={styles.addAddressBtn}
              >
                + Add Address
              </Link>
            </div>
          )}
        </section>

        {/* Quick Links / Support */}
        <section className={styles.supportSection} aria-label="Account quick links">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Quick Links</h2>
          </div>
          <div className={styles.quickLinks}>
            <Link href={ROUTES.account.orders} className={styles.quickLink}>
              <BagIcon />
              <span>My Orders</span>
            </Link>
            <Link href={ROUTES.account.profile} className={styles.quickLink}>
              <UserIcon />
              <span>Edit Profile</span>
            </Link>
            <Link href={ROUTES.account.addresses} className={styles.quickLink}>
              <MapPinIcon />
              <span>Addresses</span>
            </Link>
            <a
              href="mailto:support@revivefightclub.com"
              className={styles.quickLink}
            >
              <MailIcon />
              <span>Support</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────── */
function PackageIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
