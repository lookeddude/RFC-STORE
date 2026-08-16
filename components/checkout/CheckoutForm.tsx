"use client";
/**
 * RFC Store — Checkout Form
 *
 * Two fieldset sections:
 *   1. Customer Information (name, email, phone)
 *   2. Shipping Address (line1, line2, city, state, pincode, country)
 *
 * Accessible:
 *   - Semantic <form> with <fieldset>/<legend>
 *   - aria-describedby on error messages
 *   - aria-invalid on errored inputs
 *   - aria-required on required fields
 *   - Visible focus states via CSS
 *   - Error not communicated via color alone (icon + text)
 *
 * Responsive:
 *   - Two-column grid on ≥640px (collapses to 1-col on mobile)
 *   - Full-width on mobile
 *   - Touch-friendly inputs (min 44px height)
 */
import React from "react";
import type { CheckoutFormData, CheckoutFormErrors } from "@/types/order";
import styles from "./CheckoutForm.module.css";
import { PaymentMethodPicker, type PaymentMethodChoice } from './PaymentMethodPicker';

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi",
  "Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

interface CheckoutFormProps {
  formData: CheckoutFormData;
  fieldErrors: CheckoutFormErrors;
  serverError: string | null;
  isPending: boolean;
  paymentMethod: PaymentMethodChoice;
  razorpayEnabled: boolean;
  codFee: number;
  onChange: (field: keyof CheckoutFormData, value: string) => void;
  onPaymentMethodChange: (method: PaymentMethodChoice) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CheckoutForm({
  formData,
  fieldErrors,
  serverError,
  isPending,
  paymentMethod,
  razorpayEnabled,
  codFee,
  onChange,
  onPaymentMethodChange,
  onSubmit,
}: CheckoutFormProps) {
  return (
    <form
      className={styles.form}
      onSubmit={onSubmit}
      noValidate
      aria-label="Checkout form"
    >
      {/* ── Section 1: Customer Info ────────────────────── */}
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>
          <span className={styles.sectionNum}>1</span>
          Customer Information
        </legend>

        <div className={styles.grid}>
          <FieldGroup
            id="fullName"
            label="Full Name"
            required
            error={fieldErrors.fullName}
          >
            <input
              id="fullName"
              type="text"
              className={styles.input}
              value={formData.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              autoComplete="name"
              placeholder="Your full name"
              aria-required="true"
              aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
              aria-invalid={!!fieldErrors.fullName}
              disabled={isPending}
            />
          </FieldGroup>

          <FieldGroup
            id="email"
            label="Email Address"
            required
            error={fieldErrors.email}
          >
            <input
              id="email"
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              aria-required="true"
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              aria-invalid={!!fieldErrors.email}
              disabled={isPending}
            />
          </FieldGroup>

          <FieldGroup
            id="phone"
            label="Phone Number"
            required
            error={fieldErrors.phone}
            hint="10-digit Indian mobile number"
          >
            <input
              id="phone"
              type="tel"
              className={styles.input}
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              autoComplete="tel"
              placeholder="9876543210"
              aria-required="true"
              aria-describedby={fieldErrors.phone ? "phone-error" : "phone-hint"}
              aria-invalid={!!fieldErrors.phone}
              disabled={isPending}
            />
          </FieldGroup>
        </div>
      </fieldset>

      {/* ── Section 2: Shipping Address ─────────────────── */}
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>
          <span className={styles.sectionNum}>2</span>
          Shipping Address
        </legend>

        <div className={styles.grid}>
          <div className={styles.fullWidth}>
            <FieldGroup
              id="line1"
              label="Address Line 1"
              required
              error={fieldErrors.line1}
            >
              <input
                id="line1"
                type="text"
                className={styles.input}
                value={formData.line1}
                onChange={(e) => onChange("line1", e.target.value)}
                autoComplete="address-line1"
                placeholder="House / Flat / Street"
                aria-required="true"
                aria-describedby={fieldErrors.line1 ? "line1-error" : undefined}
                aria-invalid={!!fieldErrors.line1}
                disabled={isPending}
              />
            </FieldGroup>
          </div>

          <div className={styles.fullWidth}>
            <FieldGroup
              id="line2"
              label="Address Line 2"
              error={fieldErrors.line2}
              hint="Apartment, building, area (optional)"
            >
              <input
                id="line2"
                type="text"
                className={styles.input}
                value={formData.line2}
                onChange={(e) => onChange("line2", e.target.value)}
                autoComplete="address-line2"
                placeholder="Area / Landmark (optional)"
                aria-describedby="line2-hint"
                disabled={isPending}
              />
            </FieldGroup>
          </div>

          <FieldGroup
            id="city"
            label="City"
            required
            error={fieldErrors.city}
          >
            <input
              id="city"
              type="text"
              className={styles.input}
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              autoComplete="address-level2"
              placeholder="Mumbai"
              aria-required="true"
              aria-invalid={!!fieldErrors.city}
              disabled={isPending}
            />
          </FieldGroup>

          <FieldGroup
            id="state"
            label="State"
            required
            error={fieldErrors.state}
          >
            <select
              id="state"
              className={styles.select}
              value={formData.state}
              onChange={(e) => onChange("state", e.target.value)}
              aria-required="true"
              aria-invalid={!!fieldErrors.state}
              disabled={isPending}
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup
            id="postalCode"
            label="PIN Code"
            required
            error={fieldErrors.postalCode}
          >
            <input
              id="postalCode"
              type="text"
              className={styles.input}
              value={formData.postalCode}
              onChange={(e) => onChange("postalCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="postal-code"
              inputMode="numeric"
              placeholder="400001"
              maxLength={6}
              aria-required="true"
              aria-invalid={!!fieldErrors.postalCode}
              disabled={isPending}
            />
          </FieldGroup>

          <FieldGroup id="country" label="Country" required error={fieldErrors.country}>
            <select
              id="country"
              className={styles.select}
              value={formData.country}
              onChange={(e) => onChange("country", e.target.value)}
              disabled={isPending}
            >
              <option value="IN">India</option>
            </select>
          </FieldGroup>

          <div className={styles.fullWidth}>
            <FieldGroup id="notes" label="Order Notes" error={fieldErrors.notes} hint="Optional — special instructions for your order">
              <textarea
                id="notes"
                className={styles.textarea}
                value={formData.notes}
                onChange={(e) => onChange("notes", e.target.value)}
                placeholder="Any special instructions?"
                rows={3}
                aria-describedby="notes-hint"
                disabled={isPending}
              />
            </FieldGroup>
          </div>
        </div>
      </fieldset>

      {/* ── Server Error ─────────────────────────────────── */}
      {serverError && (
        <div className={styles.serverError} role="alert" aria-live="assertive">
          <ErrorIcon />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Payment Method Selector ───────────────────────── */}
      <div className={styles.paymentSection}>
        <PaymentMethodPicker
          value={paymentMethod}
          onChange={onPaymentMethodChange}
          codFee={codFee}
          razorpayEnabled={razorpayEnabled}
        />

        {/* COD details — shown when COD is selected or Razorpay not available */}
        {(!razorpayEnabled || paymentMethod === 'cod') && (
          <div className={styles.codBlock}>
            <div className={styles.codHeader}>
              <span className={styles.codIcon}>💵</span>
              <div>
                <p className={styles.codTitle}>Cash on Delivery</p>
                <p className={styles.codSubtitle}>Pay when your order arrives. No advance required.</p>
              </div>
              <span className={styles.codBadge}>✓ Available</span>
            </div>
            <div className={styles.codDetails}>
              <div className={styles.codRow}>
                <span className={styles.codLabel}>COD Handling Fee</span>
                <span className={styles.codValue}>₹{codFee}</span>
              </div>
              <div className={styles.codRow}>
                <span className={styles.codLabel}>Free Shipping on orders above</span>
                <span className={styles.codValue}>₹999</span>
              </div>
              <div className={styles.codRow}>
                <span className={styles.codLabel}>Standard Shipping</span>
                <span className={styles.codValue}>₹99</span>
              </div>
            </div>
            <p className={styles.codNote}>
              Keep exact change ready at the time of delivery. Our delivery partner will collect payment.
            </p>
          </div>
        )}
      </div>

      {/* ── Submit ───────────────────────────────────────── */}
      <button
        type="submit"
        className={styles.placeOrderBtn}
        disabled={isPending}
        aria-busy={isPending}
        aria-label={isPending ? 'Processing…' : (paymentMethod === 'razorpay' ? 'Proceed to payment' : 'Place order')}
      >
        {isPending ? (
          <>
            <Spinner />
            {paymentMethod === 'razorpay' ? 'INITIALIZING PAYMENT…' : 'PLACING ORDER…'}
          </>
        ) : (
          paymentMethod === 'razorpay' ? 'PROCEED TO PAYMENT' : 'PLACE ORDER'
        )}
      </button>

      <p className={styles.secureNote}>
        🔒 Your information is secured with 256-bit SSL encryption.
      </p>
    </form>
  );
}

// ── Field Group ────────────────────────────────────────────

interface FieldGroupProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FieldGroup({ id, label, required, error, hint, children }: FieldGroupProps) {
  return (
    <div className={`${styles.fieldGroup} ${error ? styles.fieldGroupError : ""}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <span id={`${id}-hint`} className={styles.hint}>{hint}</span>
      )}
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          <ErrorIcon />
          {error}
        </span>
      )}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={styles.spinner} aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
