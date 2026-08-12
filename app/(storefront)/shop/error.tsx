"use client";
/**
 * RFC Store — Shop Error Boundary
 *
 * Shown when getProducts() or getCategories() throws.
 * Provides user-friendly messaging and retry button.
 * Technical error details are logged but NOT exposed to users.
 */
import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import styles from "./shop.error.module.css";

interface ShopErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopError({ error, reset }: ShopErrorProps) {
  useEffect(() => {
    // Log error for development/monitoring — never expose to user
    console.error("[Shop] Failed to load products:", error.message);
  }, [error]);

  return (
    <Container>
      <div className={styles.wrapper}>
        <div className={styles.icon} aria-hidden="true">
          <ErrorIcon />
        </div>
        <h1 className={styles.heading}>Something went wrong</h1>
        <p className={styles.text}>
          We&apos;re having trouble loading the shop right now.
          Please try again — if the issue persists, contact us.
        </p>
        <div className={styles.actions}>
          <button onClick={reset} className={styles.retryBtn} type="button">
            TRY AGAIN
          </button>
          <Link href="/" className={styles.homeLink}>
            Back to Home
          </Link>
        </div>
      </div>
    </Container>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "rgba(188,0,10,0.6)" }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
