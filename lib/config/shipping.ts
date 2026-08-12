/**
 * RFC Store — Shipping Configuration
 *
 * Isolated shipping rate config.
 * Replace this entire file with a proper shipping engine in Phase 7.
 *
 * Current model: flat-rate based on order subtotal.
 *   FREE shipping above FREE_SHIPPING_THRESHOLD
 *   STANDARD_RATE below threshold
 *
 * This matches the CartSummary promise made in Phase 5.
 */

export const SHIPPING_CONFIG = {
  /** Subtotal above which shipping is free (in INR) */
  FREE_SHIPPING_THRESHOLD: 5000,
  /** Standard flat shipping rate (in INR) */
  STANDARD_RATE: 99,
  /** Currency */
  CURRENCY: "INR",
  /** Estimated delivery days (used on confirmation page) */
  ESTIMATED_DAYS_MIN: 5,
  ESTIMATED_DAYS_MAX: 7,
} as const;

/**
 * Tax Configuration
 *
 * TODO Phase 7: Replace with proper GST calculation based on product HSN codes.
 * Current: 0% tax pending business confirmation of:
 *   - GST registration status
 *   - Product HSN code (determines slab: 5%/12%/18%/28%)
 *   - B2C vs B2B distinction
 *
 * DO NOT change this value without business/legal confirmation.
 */
export const TAX_CONFIG = {
  /** Tax rate as decimal (0 = 0%, 0.18 = 18% GST) */
  RATE: 0,
  /** Display label */
  LABEL: "GST",
  /** Current status */
  NOTE: "Tax calculation pending GST registration confirmation",
} as const;

/**
 * Calculates shipping amount for a given subtotal.
 * Server-side only — never trust the client's shipping claim.
 */
export function calculateShipping(subtotal: number): number {
  return subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
    ? 0
    : SHIPPING_CONFIG.STANDARD_RATE;
}

/**
 * Calculates tax amount for a given subtotal.
 */
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_CONFIG.RATE * 100) / 100;
}

/**
 * Calculates the final order total.
 */
export function calculateTotal(
  subtotal: number,
  shippingAmount: number,
  taxAmount: number,
  discountAmount: number
): number {
  return Math.max(0, subtotal + shippingAmount + taxAmount - discountAmount);
}
