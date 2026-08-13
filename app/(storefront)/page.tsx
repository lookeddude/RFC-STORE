/**
 * RFC Store — Homepage
 *
 * Production implementation of the RFC Storefront Homepage.
 * Faithfully translates the approved Stitch design (Project 6383426045060807708).
 *
 * Section order (matches Stitch):
 *   1. HeroSection       — Full-screen dark arena, "BUILT FOR THE FIGHT."
 *   2. DisciplineGrid    — Shop by Discipline bento grid
 *   3. FeaturedGear      — 4 featured product cards
 *   4. EditorialBanner   — "ENGINEERED FOR IMPACT." dark campaign section
 *
 * All content is driven from lib/content/homepage.content.ts.
 * SEO metadata from config/site.ts.
 *
 * Server Component — no "use client" required.
 */
import type { Metadata } from "next";
import {
  HeroSection,
  OfferStrip,
  DisciplineGrid,
  FeaturedGear,
  EditorialBanner,
} from "@/components/homepage";

export const metadata: Metadata = {
  title: "REVIVE FIGHT CLUB | BUILT FOR THE FIGHT",
  description:
    "Professional grade combat sports equipment and athletic gear for fighters who demand excellence. Shop boxing gloves, MMA gear, Muay Thai equipment and more.",
  openGraph: {
    title: "REVIVE FIGHT CLUB | BUILT FOR THE FIGHT",
    description:
      "Professional grade equipment engineered for the arena. Crafted with precision for those who demand excellence.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      {/*
       * Hero is full-viewport — it sits flush against navbar.
       * The -80px margin cancels the storefront layout's padding-top
       * so the hero fills edge-to-edge behind the navbar.
       */}
      <div style={{ marginTop: "-80px" }}>
        <HeroSection />
      </div>

      {/* Offer Strip — separated from hero with a small gap */}
      <div style={{ marginTop: "10px" }}>
        <OfferStrip />
      </div>

      {/* Shop by Discipline — Bento Grid */}
      <DisciplineGrid />

      {/* Featured Gear — Product Card Grid */}
      <FeaturedGear />

      {/* Dark Editorial Campaign Section */}
      <EditorialBanner />
    </>
  );
}
