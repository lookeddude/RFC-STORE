/**
 * RFC Store — Storefront Layout
 *
 * Wraps all public storefront pages with:
 *   1. Navbar (fixed, 80px height)
 *   2. Main content (padded top = 80px)
 *   3. Footer
 *
 * The Hero section overrides padding-top to zero since it
 * is a full-viewport section that sits flush against the navbar.
 *
 * AnnouncementBar removed from fixed header — now rendered as
 * the OfferStrip section directly below the hero on the homepage.
 */
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

/** Total fixed header height: Navbar only (80px) */
const HEADER_OFFSET = 80;

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <>
      {/* Fixed: Navbar */}
      <Navbar />
      {/* Page content — offset for navbar */}
      <main
        id="main-content"
        style={{ paddingTop: `${HEADER_OFFSET}px`, minHeight: "100dvh" }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}

