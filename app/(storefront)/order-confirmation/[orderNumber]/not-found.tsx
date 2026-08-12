/**
 * RFC Store — Order Confirmation Not Found
 * Shown when an order number doesn't exist or access is denied.
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Not Found | REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

export default function OrderNotFound() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", padding: "80px 24px", textAlign: "center"
    }}>
      <h1 style={{
        fontFamily: "var(--font-headline)", fontSize: "clamp(24px,4vw,36px)",
        fontWeight: 700, textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 12
      }}>
        Order Not Found
      </h1>
      <p style={{
        fontFamily: "var(--font-body)", fontSize: "15px",
        color: "rgba(11,28,48,0.55)", maxWidth: 400, marginBottom: 32, lineHeight: 1.6
      }}>
        We couldn&apos;t find that order. Please check your order number or contact support.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/shop" style={{
          display: "inline-flex", alignItems: "center", height: 44, paddingInline: 28,
          fontFamily: "var(--font-label)", fontSize: 13, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
          backgroundColor: "var(--color-secondary)", color: "#fff", borderRadius: "var(--radius-sm)"
        }}>
          BROWSE SHOP
        </Link>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", height: 44, paddingInline: 28,
          fontFamily: "var(--font-label)", fontSize: 13, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
          color: "var(--color-primary)", border: "1.5px solid var(--color-primary)",
          borderRadius: "var(--radius-sm)"
        }}>
          HOME
        </Link>
      </div>
    </div>
  );
}
