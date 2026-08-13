"use client";
/**
 * RFC Store — Admin Shell (Phase 8)
 *
 * Client component for sidebar + header interactivity.
 * Role/auth guard runs in the server layout — this component
 * only handles UI state (mobile menu open/close).
 */
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AdminShell.module.css";

interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  adminRole: string;
}

// ── Navigation Items ──────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const NAV_ITEMS: NavGroup[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: <DashboardIcon />, exact: true },
    ],
  },
  {
    section: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products", icon: <ProductIcon /> },
      { label: "Categories", href: "/admin/categories", icon: <CategoryIcon /> },
      { label: "Inventory", href: "/admin/inventory", icon: <InventoryIcon /> },
    ],
  },
  {
    section: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: <OrderIcon /> },
      { label: "Customers", href: "/admin/customers", icon: <CustomerIcon /> },
    ],
  },
  {
    section: "Content",
    items: [
      { label: "Media Library", href: "/admin/media", icon: <MediaIcon /> },
      { label: "Hero Slideshow", href: "/admin/media/hero-slideshow", icon: <SlideshowNavIcon /> },
      { label: "Settings", href: "/admin/settings", icon: <SettingsIcon /> },
    ],
  },
];

export function AdminShell({ children, adminName, adminEmail, adminRole }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const initials = adminName
    ? adminName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : adminEmail.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  };

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <div className={styles.adminLayout}>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className={`${styles.mobileOverlay} ${styles.mobileOverlayVisible}`}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ""}`}
        aria-label="Admin navigation">
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <Link href="/admin" className={styles.sidebarLogoInner} onClick={closeMobile}>
            <div style={{
              width: 32, height: 32,
              background: "var(--color-secondary, #E63946)",
              borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <span className={styles.sidebarLogoText}>RFC Store</span>
              <span className={styles.sidebarLogoSub}>Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((group) => (
            <React.Fragment key={group.section}>
              <span className={styles.navSection}>{group.section}</span>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive(item.href, item.exact) ? styles.navItemActive : ""}`}
                  onClick={closeMobile}
                  aria-current={isActive(item.href, item.exact) ? "page" : undefined}
                >
                  <span className={styles.navItemIcon}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Footer: user + logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarUserAvatar}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className={styles.sidebarUserName}>{adminName || adminEmail}</div>
              <div className={styles.sidebarUserRole}>{adminRole}</div>
            </div>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={isPending}
            aria-label="Sign out"
          >
            <LogoutIcon />
            {isPending ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileOpen}
            >
              <MenuIcon />
            </button>
          </div>
          <div className={styles.headerRight}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {adminName || adminEmail}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content} id="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Icon Components ───────────────────────────────────────
function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  );
}
function ProductIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
      <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
function CategoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3H3v7h7V3z"/><path d="M21 3h-7v7h7V3z"/>
      <path d="M21 14h-7v7h7v-7z"/><path d="M10 14H3v7h7v-7z"/>
    </svg>
  );
}
function InventoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
      <path d="M12 3v6"/>
    </svg>
  );
}
function OrderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
function CustomerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function MediaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  );
}
function SlideshowNavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="14" x="3" y="5" rx="2"/>
      <path d="m10 9 5 3-5 3V9z"/>
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12"/>
      <line x1="4" x2="20" y1="6" y2="6"/>
      <line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
  );
}
