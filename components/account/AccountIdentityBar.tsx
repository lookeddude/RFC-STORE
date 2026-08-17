/**
 * RFC Store — Account Identity Bar
 *
 * Shown at the top of every account page.
 * Displays: avatar (initials or image), name, email, member-since,
 * profile completion bar, and compact order/address stats.
 *
 * Server component — receives all data as props from AccountShell.
 */
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants/site";
import styles from "./AccountIdentityBar.module.css";

interface AccountIdentityBarProps {
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  memberSince: string | null;   // ISO date string
  completionPct: number;         // 0–100
  missingFields: string[];
  orderCount: number;
  addressCount: number;
  isAdmin: boolean;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatMemberSince(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function AccountIdentityBar({
  fullName,
  email,
  avatarUrl,
  memberSince,
  completionPct,
  missingFields,
  orderCount,
  addressCount,
  isAdmin,
}: AccountIdentityBarProps) {
  const initials = getInitials(fullName, email);
  const memberSinceLabel = formatMemberSince(memberSince);
  const displayName = fullName || email.split("@")[0];

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {/* ── Identity ─────────────────────────────────── */}
        <div className={styles.identity}>
          {/* Avatar */}
          <div className={styles.avatarWrap} aria-hidden="true">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${displayName} profile photo`}
                fill
                sizes="56px"
                className={styles.avatarImg}
              />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
          </div>

          {/* Name + meta */}
          <div className={styles.meta}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{displayName}</span>
              {isAdmin && (
                <span className={styles.adminBadge} title="Administrator">
                  Admin
                </span>
              )}
            </div>
            <span className={styles.email}>{email}</span>
            {memberSinceLabel && (
              <span className={styles.memberSince}>
                Member since {memberSinceLabel}
              </span>
            )}
          </div>
        </div>

        {/* ── Right side: Completion + Stats ───────────── */}
        <div className={styles.rightCol}>
          {/* Profile completion */}
          <div className={styles.completionBlock}>
            <div className={styles.completionHeader}>
              <span className={styles.completionLabel}>Profile</span>
              <span className={styles.completionPct}>{completionPct}%</span>
            </div>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={completionPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Profile ${completionPct}% complete`}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {completionPct < 100 && missingFields.length > 0 && (
              <Link
                href={ROUTES.account.profile}
                className={styles.completeLink}
              >
                <span>Complete profile</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            {completionPct === 100 && (
              <span className={styles.completePill}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 4 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Complete
              </span>
            )}
          </div>

          {/* Quick stats */}
          <div className={styles.stats}>
            <Link href={ROUTES.account.orders} className={styles.stat}>
              <span className={styles.statNumber}>{orderCount}</span>
              <span className={styles.statLabel}>
                {orderCount === 1 ? "Order" : "Orders"}
              </span>
            </Link>
            <div className={styles.statDivider} aria-hidden="true" />
            <Link href={ROUTES.account.addresses} className={styles.stat}>
              <span className={styles.statNumber}>{addressCount}</span>
              <span className={styles.statLabel}>
                {addressCount === 1 ? "Address" : "Addresses"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
