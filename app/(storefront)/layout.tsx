/**
 * RFC Store — Storefront Layout
 *
 * Wraps all public storefront pages with:
 *   1. AnnouncementBar (fixed very top, 36px height)
 *   2. Navbar (fixed below announcement bar, 80px height)
 *   3. Main content (padded top = 36 + 80 = 116px)
 *   4. Footer
 *
 * The Hero section overrides padding-top to zero since it
 * is a full-viewport section that sits flush against the navbar.
 */
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/homepage/AnnouncementBar";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

/** Total fixed header height: AnnouncementBar (36px) + Navbar (80px) */
const HEADER_OFFSET = 116;

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <>
      {/* Fixed: Announcement bar at very top */}
      <AnnouncementBar />
      {/* Fixed: Navbar below announcement bar */}
      <Navbar />
      {/* Page content — offset for both fixed bars */}
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
