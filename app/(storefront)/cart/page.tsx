/**
 * RFC Store — Cart Page
 *
 * Route: /cart
 * Server Component shell — renders CartPageClient
 * which reads from CartContext (client-side).
 *
 * SEO: Cart pages are not indexed.
 * Loading: loading.tsx handles Suspense fallback.
 */
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CartPageClient } from "@/components/cart";

export const metadata: Metadata = {
  title: "Your Cart | REVIVE FIGHT CLUB",
  description: "Review your selected items and proceed to checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <Container>
      <CartPageClient />
    </Container>
  );
}
