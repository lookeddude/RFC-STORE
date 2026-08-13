import React from "react";
import { AccountNav, AccountNavMobile } from "./AccountNav";
import styles from "./AccountShell.module.css";

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
 */
export function AccountShell({ greeting, subheading, children }: AccountShellProps) {
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
        <AccountNavMobile />
      </div>

      {/* Two-column layout */}
      <div className={styles.layout}>
        {/* Sidebar — desktop only */}
        <aside className={styles.sidebar} aria-label="Account sidebar">
          <AccountNav />
        </aside>

        {/* Main content */}
        <main className={styles.content} id="account-content">
          {children}
        </main>
      </div>
    </div>
  );
}
