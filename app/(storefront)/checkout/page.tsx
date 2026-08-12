/**
 * RFC Store — Checkout Page
 *
 * Route: /checkout
 * Server Component shell — renders CheckoutPageClient.
 * Cart guard is handled inside CheckoutPageClient (client-side,
 * reads from CartContext which only exists in the browser).
 *
 * SEO: noindex — transactional page, not for search engines.
 */
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CheckoutPageClient } from "@/components/checkout";

export const metadata: Metadata = {
  title: "Checkout | REVIVE FIGHT CLUB",
  description: "Complete your RFC Store order. Secure checkout.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Container>
      <CheckoutPageClient />
    </Container>
  );
}
