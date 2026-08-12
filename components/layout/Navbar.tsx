"use client";

/**
 * RFC Store — Navigation Bar
 *
 * Stitch design spec (Light themed — "The Lab"):
 *   - Surface background (#F8F9FF) with bottom border
 *   - Sits below the fixed AnnouncementBar (offset by 36px bar height)
 *   - RFC brand logotype left-aligned
 *   - Nav links centre: Shop, Categories, Training, About
 *   - Right: inline search (desktop), cart icon, account icon
 *   - Auto-hide on scroll down, reappear on scroll up
 *   - Active link: Coral Red underline
 *   - Mobile: hamburger menu
 */
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NAV_LINKS, ROUTES, RFC_BRAND } from "@/lib/constants/site";
import { Container } from "@/components/ui/Container";
import styles from "./Navbar.module.css";
import { cn } from "@/lib/utils/cn";

/** Height of announcement bar — used to offset navbar position */
const ANNOUNCEMENT_BAR_HEIGHT = 36;

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const router = useRouter();

  // Auto-hide on scroll down, reappear on scroll up (Stitch JS behavior)
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > ANNOUNCEMENT_BAR_HEIGHT + 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          styles.navbar,
          !isVisible && styles["navbar--hidden"]
        )}
        role="banner"
        style={{ top: `${ANNOUNCEMENT_BAR_HEIGHT}px` }}
      >
        <Container>
          <nav className={styles.nav} aria-label="Main navigation">
            {/* Brand */}
            <Link
              href={ROUTES.home}
              className={styles.brand}
              aria-label={`${RFC_BRAND.name} — Home`}
            >
              <span className={styles.brandText}>REVIVE FIGHT CLUB</span>
            </Link>

            {/* Desktop Nav Links */}
            <ul className={styles.navLinks} role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className={styles.navItem}>
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right Actions */}
            <div className={styles.actions}>
              {/* Inline Search — desktop only */}
              <div className={styles.searchBar} role="search">
                <input
                  type="search"
                  placeholder="Search..."
                  className={styles.searchInput}
                  aria-label="Search products"
                  // Phase 3: wire to search route
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = (e.target as HTMLInputElement).value.trim();
                      if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
                    }
                  }}
                />
                <SearchIcon />
              </div>

              {/* Cart */}
              <Link
                href={ROUTES.cart}
                className={cn(styles.iconBtn, styles.cartBtn)}
                aria-label="Shopping cart"
              >
                <CartIcon />
                <span className={styles.cartCount} aria-label="0 items in cart">0</span>
              </Link>

              {/* Account */}
              <Link
                href={ROUTES.auth.login}
                className={styles.iconBtn}
                aria-label="Account"
              >
                <AccountIcon />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className={cn(styles.iconBtn, styles.menuToggle)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ top: `${ANNOUNCEMENT_BAR_HEIGHT}px` }}
        >
          <nav
            className={styles.mobileMenu}
            onClick={(e) => e.stopPropagation()}
          >
            <ul role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={styles.mobileNavLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={ROUTES.auth.login}
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Account
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.cart}
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Cart
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

/* ── Icon Components ──────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
