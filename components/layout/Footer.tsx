/**
 * RFC Store — Footer Component
 *
 * Stitch design spec:
 *   - Dark Navy (#0A0E14) background
 *   - 12-column grid: Brand (5col) + Support links (3col) + Newsletter (4col)
 *   - "REVIVE FIGHT CLUB" in large headline font
 *   - Brand tagline text
 *   - Support links column
 *   - Newsletter subscription form (UI only — Phase 2)
 *   - Copyright in brand column
 *
 * Server Component — NewsletterForm is a separate Client Component.
 */
import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RFC_BRAND } from "@/lib/constants/site";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./Footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <Container>
        <div className={styles.grid}>
          {/* ── Brand Column (col-span-5) ───────────────── */}
          <div className={styles.brandCol}>
            <div className={styles.brandName}>
              REVIVE FIGHT CLUB
            </div>
            <p className={styles.brandDesc}>
              Equipping athletes with precision-engineered gear for the
              ultimate competitive edge. Train relentlessly.
            </p>
            <p className={styles.copyright}>
              © {currentYear}{" "}
              {RFC_BRAND.name.toUpperCase()}. ENGINEERED FOR THE ARENA.
            </p>
          </div>

          {/* ── Support Column (col-span-3) ─────────────── */}
          <div className={styles.linksCol}>
            <h3 className={styles.colHeading}>SUPPORT</h3>
            <ul className={styles.linkList} role="list">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Newsletter Column (col-span-4) ──────────── */}
          <div className={styles.newsletterCol}>
            <h3 className={styles.colHeading}>JOIN THE FIGHT</h3>
            <p className={styles.newsletterDesc}>
              Subscribe for exclusive drops and training insights.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </Container>
    </footer>
  );
}

/* ── Static Data ─────────────────────────────────────────── */

const SUPPORT_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Returns", href: "/returns" },
  { label: "Shipping", href: "/shipping-policy" },
  { label: "Contact Us", href: "/contact" },
] as const;
