/**
 * RFC Store — Footer Component
 * Dark Navy background, RFC branding, links, legal
 */
import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RFC_BRAND, ROUTES } from "@/lib/constants/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-on-primary)",
        paddingBlock: "var(--space-12)",
      }}
      role="contentinfo"
    >
      <Container>
        {/* Main footer grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-10)",
            marginBottom: "var(--space-10)",
          }}
        >
          {/* Brand column */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "var(--space-3)",
              }}
            >
              <span style={{ color: "var(--color-secondary)" }}>RFC</span>
              <span
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.12em",
                  opacity: 0.7,
                  marginLeft: "var(--space-2)",
                }}
              >
                STORE
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "rgba(255,255,255,0.55)",
                maxWidth: "240px",
                marginBottom: "var(--space-4)",
              }}
            >
              {RFC_BRAND.description}
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <a
                href={RFC_BRAND.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={socialLinkStyle}
                aria-label="RFC on Instagram"
              >
                IG
              </a>
              <a
                href={RFC_BRAND.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                style={socialLinkStyle}
                aria-label="RFC on Facebook"
              >
                FB
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h3 style={footerHeadingStyle}>Shop</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "All Gear", href: ROUTES.shop },
                { label: "Categories", href: ROUTES.categories },
                { label: "New Arrivals", href: `${ROUTES.shop}?sort=newest` },
                { label: "Featured", href: `${ROUTES.shop}?filter=featured` },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: "var(--space-2)" }}>
                  <Link href={link.href} style={footerLinkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account column */}
          <div>
            <h3 style={footerHeadingStyle}>Account</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Sign In", href: ROUTES.auth.login },
                { label: "My Orders", href: ROUTES.account.orders },
                { label: "Wishlist", href: ROUTES.account.wishlist },
                { label: "Addresses", href: ROUTES.account.addresses },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: "var(--space-2)" }}>
                  <Link href={link.href} style={footerLinkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 style={footerHeadingStyle}>Support</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Contact Us", href: "#contact" },
                { label: "Size Guide", href: "#size-guide" },
                { label: "Returns Policy", href: "#returns" },
                { label: "Track Order", href: ROUTES.account.orders },
              ].map((link) => (
                <li key={link.label} style={{ marginBottom: "var(--space-2)" }}>
                  <Link href={link.href} style={footerLinkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "var(--space-6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-label)",
              fontSize: "12px",
              letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
            }}
          >
            © {currentYear} {RFC_BRAND.name}. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  ...footerLinkStyle,
                  fontSize: "12px",
                  letterSpacing: "0.04em",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

const footerHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-headline)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
  marginBottom: "var(--space-4)",
};

const footerLinkStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  color: "rgba(255,255,255,0.6)",
  textDecoration: "none",
  transition: "color 150ms ease",
  display: "block",
};

const socialLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid rgba(255,255,255,0.15)",
  fontFamily: "var(--font-label)",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  color: "rgba(255,255,255,0.6)",
  textDecoration: "none",
  transition: "color 150ms, border-color 150ms, background-color 150ms",
};
