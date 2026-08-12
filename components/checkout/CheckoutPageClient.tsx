"use client";
/**
 * RFC Store — Checkout Page Orchestrator
 *
 * Single-page checkout with two sections:
 *   Left:  [1] Customer Info  [2] Shipping Address
 *   Right: Order Summary (sticky)
 *
 * States:
 *   idle → filling form
 *   submitting → useTransition pending
 *   error → server error shown
 *   success → redirect to /order-confirmation/[orderNumber]
 *
 * Security:
 *   - idempotencyKey generated once on mount via crypto.randomUUID()
 *   - Prevents duplicate orders on double-submit / page stale state
 *   - Server Action validates everything independently of client
 */
import React, { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { placeOrderAction } from "@/lib/actions/checkout";
import { CheckoutForm } from "./CheckoutForm";
import { CheckoutSummary } from "./CheckoutSummary";
import type { CheckoutFormData, CheckoutFormErrors, PlaceOrderResult } from "@/types/order";
import styles from "./CheckoutPageClient.module.css";

const INITIAL_FORM: CheckoutFormData = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  notes: "",
};

export function CheckoutPageClient() {
  const { state: cartState, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<PlaceOrderResult | null>(null);

  // Idempotency key — generated once per page load
  // Prevents duplicate orders if the user double-clicks or retries
  const idempotencyKeyRef = useRef<string>("");
  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, []);

  const handleFieldChange = (
    field: keyof CheckoutFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const res = await placeOrderAction(
          cartState.items,
          formData,
          idempotencyKeyRef.current
        );

        if (!res.success) {
          if (res.fieldErrors && Object.keys(res.fieldErrors).length > 0) {
            setFieldErrors(res.fieldErrors);
          }
          setServerError(res.error ?? "Something went wrong. Please try again.");
          // Regenerate idempotency key for next attempt
          idempotencyKeyRef.current = crypto.randomUUID();
          return;
        }

        // ── Success path ─────────────────────────────────────
        setResult(res);
        // Clear cart from localStorage
        clearCart();
        // Redirect to order confirmation
        router.push(`/order-confirmation/${res.orderNumber}`);
      } catch {
        setServerError("An unexpected error occurred. Please try again.");
        idempotencyKeyRef.current = crypto.randomUUID();
      }
    });
  };

  // Guard: redirect empty cart back
  if (!cartState.isLoading && cartState.items.length === 0 && !result) {
    return (
      <div className={styles.emptyGuard}>
        <h1 className={styles.emptyHeading}>Nothing to Check Out</h1>
        <p className={styles.emptyText}>Your cart is empty.</p>
        <Link href="/shop" className={styles.shopBtn}>BROWSE SHOP</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Page heading */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Checkout</h1>
        <Link href="/cart" className={styles.backLink}>← Back to Cart</Link>
      </div>

      <div className={styles.layout}>
        {/* Left: Form */}
        <div className={styles.formCol}>
          <CheckoutForm
            formData={formData}
            fieldErrors={fieldErrors}
            serverError={serverError}
            isPending={isPending}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right: Summary */}
        <div className={styles.summaryCol}>
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}
