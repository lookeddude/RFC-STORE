/**
 * RFC Store — Wishlist Page
 *
 * Route: /account/wishlist
 * Server Component shell — renders WishlistPageClient.
 * Auth guard is handled by proxy.ts (redirects to /login if unauthenticated).
 *
 * SEO: noindex — personal account page.
 */
import type { Metadata } from "next";
import { WishlistPageClient } from "@/components/wishlist";

export const metadata: Metadata = {
  title: "My Wishlist | REVIVE FIGHT CLUB",
  description: "Your saved items. Add them to cart when ready.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
