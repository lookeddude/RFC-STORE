"use client";
/**
 * RFC Store — Account Navigation (Phase 7)
 *
 * Renders:
 *  - Desktop: vertical sidebar list
 *  - Mobile: horizontal scroll strip
 *
 * Stitch spec: active item = bg-secondary (coral red), others = on-surface-variant
 * Logout: POST /api/auth/logout via HTML form (CSRF-safe, no client JS required)
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

/** Desktop sidebar navigation */
export function AccountNav() {
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
export function AccountNavMobile() {
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
      <form action="/api/auth/logout" method="POST">
        <button type="submit" className={styles.mobileLogoutBtn}>
          Logout
        </button>
      </form>
    </nav>
  );
}
