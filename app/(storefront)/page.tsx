/**
 * RFC Store — Homepage
 *
 * Commerce-first homepage inspired by serious sports-retail UX.
 *
 * Section order:
 *   1. HeroSection       — 75vh mobile / 100vh desktop fighter image
 *   2. OfferStrip        — animated marquee benefits
 *   3. CategoryRail      — swipeable circles mobile / card row desktop
 *   4. BestDeals         — products with compare_at_price (discounted)
 *   5. MiniPromoBanner   — compact dark promo strip
 *   6. BestSellers       — is_bestseller products
 *   7. NewArrivals       — is_new_arrival products (newest fallback)
 *   8. TrustBar          — 4 value propositions
 *   9. EditorialBanner   — brand story + fighter image
 *
 * All product data fetched in parallel with Promise.all.
 * Each section gracefully hides if its data is empty.
 *
 * Server Component — no "use client" required.
 */
import type { Metadata } from "next";
import {
  HeroSlideshow,
  OfferStrip,
  CategoryRail,
  BestDeals,
  MiniPromoBanner,
  BestSellers,
  NewArrivals,
  TrustBar,
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

      {/* Best Deals — discounted products */}
      <BestDeals />

      {/* Mini Promo Banner — compact dark strip */}
      <MiniPromoBanner
        headline="TRAIN HARD. GEAR HARDER."
        subtext="Professional combat sports gear engineered for those who refuse to quit."
        ctaLabel="SHOP ALL GEAR"
        ctaHref="/shop"
      />

      {/* Best Sellers — flagship products */}
      <BestSellers />

      {/* New Arrivals — freshest products */}
      <NewArrivals />

      {/* Trust Bar — value propositions */}
      <TrustBar />

      {/* Brand Editorial + campaign image */}
      <EditorialBanner />
    </>
  );
}
