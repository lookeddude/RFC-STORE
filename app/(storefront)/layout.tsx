/**
 * RFC Store — Storefront Layout
 *
 * Wraps all public storefront pages with:
 *   1. Navbar (fixed, 64px mobile / 72px desktop)
 *   2. Main content (padded top = navbar height)
 *   3. Footer
 *
 * The Hero section overrides padding-top to zero since it
 * is a full-viewport section that sits flush against the navbar.
 */
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <>
      {/* Fixed: Navbar */}
      <Navbar />
      {/* Page content — offset for navbar height (64px mobile, 72px desktop) */}
      <main
        id="main-content"
        style={{
          paddingTop: "var(--navbar-height, 64px)",
          minHeight: "100dvh",
        }}
      >
        <style>{`
          :root { --navbar-height: 64px; }
          @media (min-width: 768px) { :root { --navbar-height: 72px; } }
        `}</style>
        {children}
      </main>
      <Footer />
    </>
  );
}
