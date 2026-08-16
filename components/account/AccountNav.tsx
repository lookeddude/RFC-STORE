"use client";
/**
 * RFC Store — Account Navigation (Redesigned)
 *
 * Desktop: vertical sidebar with icons + grouped sections
 * Mobile: horizontal scrollable tab strip with icons
 *
 * isAdmin comes from AccountShell (server-verified).
 * Role is NEVER checked client-side.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import styles from "./AccountNav.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: ROUTES.account.root,
    icon: <HomeIcon />,
  },
  {
    label: "Orders",
    href: ROUTES.account.orders,
    icon: <BagIcon />,
  },
  {
    label: "Wishlist",
    href: ROUTES.account.wishlist,
    icon: <HeartIcon />,
  },
  {
    label: "Addresses",
    href: ROUTES.account.addresses,
    icon: <MapPinIcon />,
  },
  {
    label: "Profile",
    href: ROUTES.account.profile,
    icon: <UserIcon />,
  },
];

interface AccountNavProps {
  isAdmin?: boolean;
}

export function AccountNav({ isAdmin = false }: AccountNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.account.root) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.nav} aria-label="Account navigation">
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Account</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              styles.navLink,
              isActive(item.href) && styles.navLinkActive
            )}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">
              {item.icon}
            </span>
            <span className={styles.navLabel}>{item.label}</span>
            {isActive(item.href) && (
              <span className={styles.activeIndicator} aria-hidden="true" />
            )}
          </Link>
        ))}
      </div>

      {/* Admin block — only for admin/super_admin */}
      {isAdmin && (
        <div className={styles.adminSection}>
          <p className={styles.sectionLabel}>Admin</p>
          <Link
            href="/admin"
            className={styles.adminBtn}
            aria-label="Open Admin Panel"
          >
            <span className={styles.navIcon} aria-hidden="true">
              <ShieldIcon />
            </span>
            <span className={styles.navLabel}>Admin Panel</span>
            <span className={styles.adminArrow} aria-hidden="true">↗</span>
          </Link>
        </div>
      )}

      {/* Sign out */}
      <div className={styles.signOutSection}>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className={styles.signOutBtn}>
            <span className={styles.navIcon} aria-hidden="true">
              <LogOutIcon />
            </span>
            <span className={styles.navLabel}>Sign Out</span>
          </button>
        </form>
      </div>
    </nav>
  );
}

export function AccountNavMobile({ isAdmin = false }: AccountNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.account.root) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.mobileNav} aria-label="Account navigation">
      <div className={styles.mobileTabStrip}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              styles.mobileTab,
              isActive(item.href) && styles.mobileTabActive
            )}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <span className={styles.mobileTabIcon} aria-hidden="true">
              {item.icon}
            </span>
            <span className={styles.mobileTabLabel}>{item.label}</span>
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/admin"
            className={styles.mobileAdminTab}
            aria-label="Admin Panel"
          >
            <span className={styles.mobileTabIcon} aria-hidden="true">
              <ShieldIcon />
            </span>
            <span className={styles.mobileTabLabel}>Admin</span>
          </Link>
        )}
      </div>

      <form action="/api/auth/logout" method="POST" className={styles.mobileSignOutForm}>
        <button type="submit" className={styles.mobileSignOutBtn}>
          Sign Out
        </button>
      </form>
    </nav>
  );
}

/* ── Icons ────────────────────────────────────────────────── */
function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
