"use client";
/**
 * RFC Store — Account Navigation
 *
 * Renders:
 *  - Desktop: vertical sidebar list
 *  - Mobile: horizontal scroll strip
 *
 * isAdmin prop is passed from AccountShell (server component, DB-verified).
 * The Admin Panel button is ONLY rendered when isAdmin = true.
 * Role is never checked client-side — always comes from server.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants/site";
import styles from "./AccountNav.module.css";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Overview",  href: ROUTES.account.root },
  { label: "Orders",    href: ROUTES.account.orders },
  { label: "Addresses", href: ROUTES.account.addresses },
  { label: "Profile",   href: ROUTES.account.profile },
] as const;

interface AccountNavProps {
  isAdmin?: boolean;
}

/** Desktop sidebar navigation */
export function AccountNav({ isAdmin = false }: AccountNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.account.root) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.nav} aria-label="Account navigation">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(styles.navLink, isActive(item.href) && styles.navLinkActive)}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          <span>{item.label}</span>
          {isActive(item.href) && (
            <svg className={styles.chevron} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          )}
        </Link>
      ))}

      {/* Admin Panel button — only shown when role = admin/super_admin */}
      {isAdmin && (
        <div className={styles.adminSeparator}>
          <Link href="/admin" className={styles.adminBtn} aria-label="Go to Admin Panel">
            <AdminIcon />
            <span>Admin Panel</span>
          </Link>
        </div>
      )}

      {/* Logout — POST form for CSRF safety */}
      <div className={styles.separator}>
        <form className={styles.logoutForm} action="/api/auth/logout" method="POST">
          <button type="submit" className={styles.logoutBtn}>
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}

/** Mobile horizontal nav strip */
export function AccountNavMobile({ isAdmin = false }: AccountNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.account.root) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.mobileNav} aria-label="Account navigation">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(styles.mobileNavLink, isActive(item.href) && styles.mobileNavLinkActive)}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}

      {/* Admin Panel button — mobile strip */}
      {isAdmin && (
        <Link href="/admin" className={styles.mobileAdminBtn} aria-label="Go to Admin Panel">
          <AdminIcon size={14} />
          <span>Admin Panel</span>
        </Link>
      )}

      <form action="/api/auth/logout" method="POST">
        <button type="submit" className={styles.mobileLogoutBtn}>
          Logout
        </button>
      </form>
    </nav>
  );
}

/* ── Icon ────────────────────────────────────────────────── */
function AdminIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

