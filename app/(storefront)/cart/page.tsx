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
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/store/ProductCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Your Cart | REVIVE FIGHT CLUB",
  description: "Review your selected items and proceed to checkout.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const crossSellProducts = await getFeaturedProducts(4);

  return (
    <Container>
      <CartPageClient />
      
      {crossSellProducts.length > 0 && (
        <section className={styles.crossSellSection}>
          <h2 className={styles.crossSellTitle}>YOU MAY ALSO NEED</h2>
          <div className={styles.crossSellGrid}>
            {crossSellProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
