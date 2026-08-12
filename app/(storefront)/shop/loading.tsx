/**
 * RFC Store — Shop Loading State
 *
 * Shown automatically by Next.js while the shop Server Component
 * is fetching from Supabase. Uses the skeleton grid to prevent
 * layout shift.
 */
import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/shop/ProductGridSkeleton";
import styles from "./shop.module.css";

export default function ShopLoading() {
  return (
    <Container>
      <div className={styles.page}>
        {/* Skeleton header */}
        <div
          style={{
            marginBottom: 48,
            borderBottom: "1px solid #c6c6cb",
            paddingBottom: 32,
          }}
        >
          <div
            style={{
              height: 12,
              width: 200,
              background:
                "linear-gradient(90deg, #eff4ff 25%, #e5eeff 50%, #eff4ff 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              borderRadius: 4,
              marginBottom: 24,
            }}
          />
          <div
            style={{
              height: 40,
              width: 160,
              background:
                "linear-gradient(90deg, #eff4ff 25%, #e5eeff 50%, #eff4ff 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              borderRadius: 4,
            }}
          />
        </div>
        {/* Skeleton product grid */}
        <ProductGridSkeleton count={12} />
      </div>
    </Container>
  );
}
