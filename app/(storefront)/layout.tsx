/**
 * RFC Store — Storefront Layout
 * Wraps all public storefront pages with Navbar + Footer.
 * Adds top padding to account for the fixed navbar.
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
      <Navbar />
      <main
        id="main-content"
        style={{ paddingTop: "var(--navbar-height)", minHeight: "100dvh" }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
