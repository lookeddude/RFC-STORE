/**
 * RFC Store — Account Shell (Redesigned)
 *
 * Shared layout for ALL /account/* pages.
 *
 * Server component: fetches profile + counts + role.
 * Renders:
 *   - AccountIdentityBar (persistent across all account pages)
 *   - Mobile nav strip
 *   - Two-column layout: sidebar nav + content area
 *
 * Security: role is checked server-side — never client.
 */
import React from "react";
import { AccountNav, AccountNavMobile } from "./AccountNav";
import { AccountIdentityBar } from "./AccountIdentityBar";
import styles from "./AccountShell.module.css";
import { createClient } from "@/lib/supabase/server";

interface AccountShellProps {
  children: React.ReactNode;
  /** Optional compact section heading shown inside content area for sub-pages */
  pageTitle?: string;
}

export async function AccountShell({ children, pageTitle }: AccountShellProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let fullName: string | null = null;
  let avatarUrl: string | null = null;
  let memberSince: string | null = null;
  let phone: string | null = null;
  let orderCount = 0;
  let addressCount = 0;

  if (user) {
    // Parallel fetch: profile + order count + address count
    const [profileRes, orderCountRes, addressCountRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, role, created_at")
        .eq("id", user.id)
        .single(),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("addresses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    if (profileRes.data) {
      fullName = profileRes.data.full_name ?? null;
      phone = profileRes.data.phone ?? null;
      avatarUrl = profileRes.data.avatar_url ?? null;
      memberSince = profileRes.data.created_at ?? null;
      isAdmin =
        profileRes.data.role === "admin" ||
        profileRes.data.role === "super_admin";
    }

    orderCount = orderCountRes.count ?? 0;
    addressCount = addressCountRes.count ?? 0;
  }

  // Profile completion: 3 fields → name (40%), phone (30%), address (30%)
  const completionItems = [
    { field: "Full name", done: !!fullName, weight: 40 },
    { field: "Phone number", done: !!phone, weight: 30 },
    { field: "Shipping address", done: addressCount > 0, weight: 30 },
  ];
  const completionPct = completionItems
    .filter((c) => c.done)
    .reduce((sum, c) => sum + c.weight, 0);
  const missingFields = completionItems
    .filter((c) => !c.done)
    .map((c) => c.field);

  return (
    <div className={styles.page}>
      {/* Identity bar — always at top */}
      <AccountIdentityBar
        fullName={fullName}
        email={user?.email ?? ""}
        avatarUrl={avatarUrl}
        memberSince={memberSince}
        completionPct={completionPct}
        missingFields={missingFields}
        orderCount={orderCount}
        addressCount={addressCount}
        isAdmin={isAdmin}
      />

      {/* Mobile nav strip */}
      <div className={styles.mobileNavWrapper}>
        <AccountNavMobile isAdmin={isAdmin} />
      </div>

      {/* Two-column layout */}
      <div className={styles.layout}>
        {/* Sidebar — desktop only */}
        <aside className={styles.sidebar} aria-label="Account sidebar">
          <AccountNav isAdmin={isAdmin} />
        </aside>

        {/* Main content */}
        <main className={styles.content} id="account-content">
          {pageTitle && (
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
