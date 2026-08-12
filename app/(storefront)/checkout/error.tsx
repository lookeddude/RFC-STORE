"use client";
/**
 * RFC Store — Checkout Error Boundary
 */
import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CheckoutError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Checkout] Page error:", error.message);
  }, [error]);

  return (
    <Container>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "50vh", padding: "80px 24px", textAlign: "center"
      }}>
        <h1 style={{
          fontFamily: "var(--font-headline)", fontSize: "28px", fontWeight: 700,
          textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 12
        }}>
          Checkout Unavailable
        </h1>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: "15px",
          color: "rgba(11,28,48,0.55)", maxWidth: 400, marginBottom: 32, lineHeight: 1.6
        }}>
          Something went wrong loading checkout. Your cart is safe — please try again.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 44, paddingInline: 28,
              fontFamily: "var(--font-label)", fontSize: 13, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              backgroundColor: "var(--color-secondary)", color: "#fff",
              border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer"
            }}
          >
            TRY AGAIN
          </button>
          <Link
            href="/cart"
            style={{
              display: "inline-flex", alignItems: "center", height: 44, paddingInline: 28,
              fontFamily: "var(--font-label)", fontSize: 13, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              textDecoration: "none", color: "var(--color-primary)",
              border: "1.5px solid var(--color-primary)", borderRadius: "var(--radius-sm)"
            }}
          >
            BACK TO CART
          </Link>
        </div>
      </div>
    </Container>
  );
}
