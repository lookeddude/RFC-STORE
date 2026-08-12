"use client";
/**
 * RFC Store — Product Detail Error Boundary
 * Handles Supabase failures, invalid data, unexpected errors.
 * Does NOT expose DB internals. Provides retry + back-to-shop.
 */
import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import styles from "./pdp.error.module.css";

interface ProductErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ProductErrorProps) {
  useEffect(() => {
    console.error("[PDP] Product page error:", error.message);
  }, [error]);

  return (
    <Container>
      <div className={styles.wrapper}>
        <div className={styles.icon} aria-hidden="true">
          <AlertIcon />
        </div>
        <h1 className={styles.heading}>Unable to Load Product</h1>
        <p className={styles.text}>
          Something went wrong while loading this product.
          Please try again or browse our full collection.
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.retryBtn}>
            TRY AGAIN
          </button>
          <Link href="/shop" className={styles.shopLink}>
            BROWSE SHOP
          </Link>
        </div>
      </div>
    </Container>
  );
}

function AlertIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(188,0,10,0.6)" }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
