/**
 * RFC Store — Homepage
 *
 * Section order (post-critique reorder):
 *   1. HeroSlideshow     — full-viewport fighter image + CMS slides
 *   2. OfferStrip        — animated marquee benefits
 *   3. CategoryRail      — swipeable circles mobile / card row desktop
 *   4. BestSellers       — flagship, premium-positioned products FIRST
 *   5. TrustBar          — brand authority before the sale ask
 *   6. MiniPromoBanner   — dark visual break / brand moment
 *   7. NewArrivals       — fresh products
 *   8. EditorialBanner   — brand story + fighter image
 *   9. BestDeals         — discounts at the bottom, not the top
 *
 * Rationale: Luxury athletic brands lead with their best, not their cheapest.
 * Trust (TrustBar) now precedes further product asks. Editorial brand story
 * appears before deals to build desire and authority first.
 *
 * Server Component — no "use client" required.
 */
import type { Metadata } from "next";
import {
  HeroSlideshow,
  OfferStrip,
  CategoryRail,
  BestSellers,
  TrustBar,
  MiniPromoBanner,
  NewArrivals,
  EditorialBanner,
  BestDeals,
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
       * Negative margin = navbar height (64px mobile, 72px desktop).
       */}
      <div style={{ marginTop: "calc(-1 * var(--navbar-height, 64px))" }}>
        <HeroSlideshow />
      </div>

      {/* Offer Strip — 4px gap from hero */}
      <div style={{ marginTop: "4px" }}>
        <OfferStrip />
      </div>

      {/* Category Rail — swipeable circles on mobile */}
      <CategoryRail />

      {/* Best Sellers — flagship products FIRST (premium positioning) */}
      <BestSellers />

      {/* Trust Bar — authority before further product asks */}
      <TrustBar />

      {/* Mini Promo Banner — dark visual break */}
      <MiniPromoBanner
        headline="TRAIN HARD. GEAR HARDER."
        subtext="Professional combat sports gear engineered for those who refuse to quit."
        ctaLabel="SHOP ALL GEAR"
        ctaHref="/shop"
      />

      {/* New Arrivals — fresh drops */}
      <NewArrivals />

      {/* Brand Editorial — story + fighter image (builds desire before deals) */}
      <EditorialBanner />

      {/* Best Deals — discounts last; brand value established first */}
      <BestDeals />
    </>
  );
}
