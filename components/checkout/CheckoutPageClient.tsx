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
import React, { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { placeOrderAction } from "@/lib/actions/checkout";
import { CheckoutForm } from "./CheckoutForm";
import { CheckoutSummary } from "./CheckoutSummary";
import type { CheckoutFormData, CheckoutFormErrors, CreateRazorpayOrderResult } from "@/types/order";
import { RAZORPAY_CONFIG, COD_CONFIG } from '@/lib/config/shipping';
import { createRazorpayOrderAction } from '@/lib/actions/razorpay';
import { RazorpayCheckout } from './RazorpayCheckout';
import type { PaymentMethodChoice } from './PaymentMethodPicker';
import { getMyAddressesAction } from '@/lib/actions/addresses';
import { SavedAddressPicker } from './SavedAddressPicker';
import type { AddressRow } from '@/types/account';
import { formatPrice } from '@/lib/utils/format';
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
  const { state: cartState, clearCart, isAuthenticated, syncFromDb } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  // isOrdered: true after successful order creation.
  // Guards the empty-cart check during the brief window between clearCart() + router.push().
  const [isOrdered, setIsOrdered] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<AddressRow[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodChoice>('cod');
  const [razorpayOrder, setRazorpayOrder] = useState<CreateRazorpayOrderResult | null>(null);
  const [razorpayTrigger, setRazorpayTrigger] = useState(0);

  // Idempotency key — generated once per page load
  // Prevents duplicate orders if the user double-clicks or retries
  const idempotencyKeyRef = useRef<string>("");
  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, []);

  // For authenticated users: sync DB cart + load saved addresses
  useEffect(() => {
    if (!isAuthenticated) return;
    // Sync cart from DB (ensures fresh state after login/page load)
    void syncFromDb();
    // Load saved addresses for the address picker
    void getMyAddressesAction().then((result) => {
      if (result.success) setSavedAddresses(result.addresses);
    });
  }, [isAuthenticated, syncFromDb]);

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

  const handleAddressSelect = (addr: AddressRow) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      fullName:   addr.full_name,
      phone:      addr.phone,
      line1:      addr.line1,
      line2:      addr.line2 ?? '',
      city:       addr.city,
      state:      addr.state,
      postalCode: addr.postal_code,
      country:    addr.country,
    }));
    // Clear field errors for the populated fields
    setFieldErrors({});
  };

  const handleRazorpaySuccess = useCallback((orderNumber: string) => {
    clearCart();
    router.push(`/order-confirmation/${orderNumber}`);
  }, [clearCart, router]);

  const handleRazorpayError = useCallback((message: string) => {
    setServerError(message);
    setRazorpayTrigger(0); // reset
  }, []);

  const handleRazorpayDismiss = useCallback(() => {
    setRazorpayTrigger(0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        if (paymentMethod === 'razorpay') {
          const result = await createRazorpayOrderAction(
            cartState.items,
            formData,
            idempotencyKeyRef.current
          );
          
          if (!result.success) {
            setServerError(result.error ?? 'Failed to initialize payment.');
            if (result.fieldErrors) setFieldErrors(result.fieldErrors as CheckoutFormErrors);
            idempotencyKeyRef.current = crypto.randomUUID();
            return;
          }
          
          setRazorpayOrder(result);
          setRazorpayTrigger(t => t + 1);
        } else {
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
          setIsOrdered(true);
          // Clear cart from localStorage
          clearCart();
          // Redirect to order confirmation
          router.push(`/order-confirmation/${res.orderNumber}`);
        }
      } catch {
        setServerError("An unexpected error occurred. Please try again.");
        idempotencyKeyRef.current = crypto.randomUUID();
      }
    });
  };

  // Guard: redirect empty cart back to shop.
  // isOrdered check prevents flash during clearCart() → router.push() window.
  if (!cartState.isLoading && cartState.items.length === 0 && !isOrdered) {
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
          {isAuthenticated && savedAddresses.length > 0 && (
            <SavedAddressPicker
              addresses={savedAddresses}
              selectedId={selectedAddressId}
              onSelect={handleAddressSelect}
            />
          )}
          <CheckoutForm
            formData={formData}
            fieldErrors={fieldErrors}
            serverError={serverError}
            isPending={isPending}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            paymentMethod={paymentMethod}
            razorpayEnabled={RAZORPAY_CONFIG.ENABLED}
            codFee={COD_CONFIG.FEE}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>

        {/* Right: Summary */}
        <div className={styles.summaryCol}>
          <CheckoutSummary paymentMethod={paymentMethod} />
        </div>
      </div>
      
      {razorpayOrder && (
        <RazorpayCheckout
          orderResult={razorpayOrder}
          formData={formData}
          onSuccess={handleRazorpaySuccess}
          onError={handleRazorpayError}
          onDismiss={handleRazorpayDismiss}
          trigger={razorpayTrigger}
        />
      )}

      {/* Mobile sticky CTA — only shown when form is visible */}
      {!cartState.isLoading && cartState.items.length > 0 && !isOrdered && (
        <div className={styles.stickyBar} aria-hidden="true">
          <button
            type="button"
            className={styles.stickyBtn}
            disabled={isPending}
            onClick={handleSubmit as unknown as React.MouseEventHandler}
          >
            {isPending ? 'PLACING ORDER...' : `PLACE ORDER · ${formatPrice(cartState.subtotal)}`}
          </button>
        </div>
      )}
    </div>
  );
}
