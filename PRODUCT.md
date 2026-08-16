# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Combat sports athletes — boxers, MMA fighters, BJJ practitioners — shopping for
training gear and equipment. They are serious about their sport, know what
quality gear feels like, and expect a brand that matches their intensity.
Secondary: aspiring athletes and fight-gym communities in India.

## Product Purpose

RFC Store is the direct-to-consumer e-commerce storefront for Revive Fight Club
(RFC), an in-house combat sports brand. Every product is RFC-designed and
produced — the store does not resell other brands. Success means a fighter
discovers RFC gear, trusts the brand, and converts to a loyal customer.

## Positioning

Exclusive in-house brand. RFC designs and owns every product in the catalogue —
no third-party reselling. This gives RFC full control over quality, identity,
and the premium positioning it targets. A competitor cannot copy this claim
without building the same design and manufacturing pipeline.

## Operating Context

- Primary market: India, priced and transacted in INR (₹).
- Shoppers browse on mobile first; desktop is secondary.
- The brand is tied to a real fight-club identity ("Revive Fight Club / Built
  for the Fight"), so the storefront must feel like an extension of that world —
  not a generic Shopify theme.
- Products span the full combat-sports spectrum: boxing gloves, hand wraps,
  headgear, MMA gloves, MMA shorts, BJJ gi, rash guards, training apparel
  (hoodies, tees, shorts), bags, accessories, and footwear.

## Capabilities and Constraints

- Stack: Next.js (App Router), TypeScript, Supabase (Postgres + Auth + Storage),
  Vercel deployment, CSS Modules for styling (no Tailwind).
- Admin panel at `/admin` for managing products, hero slides, orders, and users.
- Hero slideshow is fully CMS-driven — slides are created and published from the
  admin panel (`/admin/media/hero-slideshow`).
- Payments and checkout are implemented; order confirmation and email
  notifications are in scope.
- Image assets are served from Supabase Storage.
- Undecided: loyalty/rewards programme, international shipping.

## Brand Commitments

- **Name:** RFC Store / Revive Fight Club
- **Tagline:** BUILT FOR THE FIGHT
- **Palette:** Deep Charcoal #111827 (primary background), Warm Off-White #F5F6F8
  (surface/background), RFC Red #E63946 (accent), with supporting greys.
- **Typography:** Archivo Narrow 900 for headlines (uppercase, tight tracking),
  Inter for body and labels.
- **Voice:** Aspirational and premium. Luxury athletic — not intimidating grit,
  but quiet authority. The fighter who trains in silence and wins in public.
- **Identity constraints:** The red RFC badge/logo must appear in the navbar at
  all breakpoints. Brand name and tagline stack are desktop-only in the navbar.

## Evidence on Hand

- Full Next.js codebase with working storefront, admin panel, cart, checkout,
  and order management.
- Existing hero slideshow with fighter photography (boxing/MMA imagery).
- Product catalogue with categories: boxing, MMA, BJJ, apparel, accessories,
  footwear.
- Returns & Refund Policy page implemented.
- No testimonials, press, or external case studies on hand — do not fabricate.

## Product Principles

1. **Fighter-first:** Every design decision is evaluated from the perspective of
   a serious athlete who respects craft and quality. No fluff.
2. **Brand before template:** The store must feel unmistakably RFC — not a
   generic e-commerce skin. Identity is a competitive asset.
3. **Mobile is the primary canvas:** The majority of Indian combat-sports
   shoppers browse on mobile. Every surface ships mobile-first.
4. **Premium by restraint:** Luxury is communicated through precision —
   tight typography, purposeful whitespace, controlled colour use — not
   decoration.
5. **Admin-driven flexibility:** Content (slides, products, categories) is
   managed through the admin panel, not hardcoded. Design must accommodate
   variable content gracefully.

## Accessibility & Inclusion

WCAG AA minimum. Focus states, keyboard navigation, and ARIA labels are
required. Screen-reader labels are in place for interactive filter and
navigation elements.
