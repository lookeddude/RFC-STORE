/**
 * RFC Store — Root Layout
 *
 * Applied to every page in the application.
 * Sets up fonts, global CSS, and base SEO metadata.
 */
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
    <html lang="en">
      <head>
        {/*
         * Google Fonts are loaded via globals.css @import.
         * DNS prefetch improves load time for fonts.googleapis.com.
         */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
