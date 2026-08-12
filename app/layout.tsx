/**
 * RFC Store — Root Layout
 *
 * Applied to every page in the application.
 * Sets up fonts, global CSS, base SEO metadata, and accessibility foundation.
 */
import React from "react";
import type { Metadata, Viewport } from "next";
import { defaultMetadata } from "@/config/site";
import "@/app/globals.css";

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  themeColor: "#0a0e14",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * Google Fonts are loaded via globals.css @import.
         * Preconnect + dns-prefetch to eliminate render-blocking latency.
         */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/*
         * Skip-to-content link — keyboard accessibility best practice.
         * CSS-only show-on-focus pattern (no JS event handlers needed).
         * Styled via globals.css .skip-to-content rule.
         */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
