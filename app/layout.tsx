/**
 * RFC Store — Root Layout
 *
 * Applied to every page in the application.
 * Sets up fonts, global CSS, base SEO metadata, and accessibility foundation.
 *
 * CartProvider    — cart state (guest: localStorage, auth: Supabase DB)
 * WishlistProvider — wishlist state (authenticated users only)
 */
import React from "react";
import type { Metadata, Viewport } from "next";
import { defaultMetadata } from "@/config/site";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Archivo_Narrow, Inter } from "next/font/google";
import "@/app/globals.css";

const archivo = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang="en" className={`${archivo.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
      </head>
      <body>

        {/* Skip-to-content — keyboard accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
