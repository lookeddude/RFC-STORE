"use client";

/**
 * RFC Store — Navigation Bar
 *
 * Stitch design reference: RFC Master Design System
 * - Dark Navy (#0A0E14) background
 * - RFC branding left-aligned
 * - Navigation links centred
 * - Cart + Account icons right-aligned
 * - Glassmorphism on scroll (subtle backdrop-blur)
 * - Mobile: hamburger menu
 */
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NAV_LINKS, ROUTES, RFC_BRAND } from "@/lib/constants/site";
import { Container } from "@/components/ui/Container";
import styles from "./Navbar.module.css";
import { cn } from "@/lib/utils/cn";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
          isScrolled && styles["navbar--scrolled"]
        )}
        role="banner"
      >
        <Container>
          <nav className={styles.nav} aria-label="Main navigation">
            {/* Brand */}
            <Link href={ROUTES.home} className={styles.brand} aria-label={`${RFC_BRAND.name} — Home`}>
              <span className={styles.brandMark}>RFC</span>
              <span className={styles.brandName}>{RFC_BRAND.name}</span>
            </Link>

            {/* Desktop Nav Links */}
            <ul className={styles.navLinks} role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right Actions */}
            <div className={styles.actions}>
              {/* Search */}
              <Link
                href={ROUTES.search}
                className={styles.iconBtn}
                aria-label="Search"
              >
                <SearchIcon />
              </Link>

              {/* Account */}
              <Link
                href={ROUTES.auth.login}
                className={styles.iconBtn}
                aria-label="Account"
              >
                <AccountIcon />
              </Link>

              {/* Cart */}
              <Link
                href={ROUTES.cart}
                className={cn(styles.iconBtn, styles.cartBtn)}
                aria-label="Shopping cart"
              >
                <CartIcon />
                <span className={styles.cartCount} aria-hidden="true">0</span>
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

/* ── Icon Components ──────────────────────────────────── */

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
