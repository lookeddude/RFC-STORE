import React from "react";
import { AccountNav, AccountNavMobile } from "./AccountNav";
import styles from "./AccountShell.module.css";
import { createClient } from "@/lib/supabase/server";

interface AccountShellProps {
  greeting: string;
  subheading?: string;
  children: React.ReactNode;
}

/**
 * RFC Store — Account Shell
 *
 * Shared layout for all /account pages.
 * Renders: page header, mobile nav strip, sidebar nav (desktop), content area.
 *
 * Server component: fetches the user's role from DB to conditionally
 * show the Admin Panel button in AccountNav — secure, no client-side role check.
 */
export async function AccountShell({ greeting, subheading, children }: AccountShellProps) {
  // Fetch role server-side — never trust client for role checks
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <header className={styles.header}>
        <h1 className={styles.greeting}>{greeting}</h1>
        {subheading && (
          <p className={styles.subheading}>{subheading}</p>
        )}
      </header>

      {/* Mobile nav strip */}
      <div className={styles.mobileNavWrapper} aria-hidden="false">
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
          {children}
        </main>
      </div>
    </div>
  );
}

