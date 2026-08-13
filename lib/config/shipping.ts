/**
 * RFC Store — Shipping & Payment Configuration
 *
 * Single source of truth for:
 *   - Free shipping threshold
 *   - Standard shipping rate
 *   - COD (Cash on Delivery) fee
 *   - Tax rate (pending GST registration)
 *   - Estimated delivery times
 */

export const SHIPPING_CONFIG = {
  /** Subtotal above which shipping is free (in INR) */
  FREE_SHIPPING_THRESHOLD: 999,
  /** Standard flat shipping rate below threshold (in INR) */
  STANDARD_RATE: 99,
  /** Currency */
  CURRENCY: "INR",
  /** Estimated delivery days (used on confirmation page) */
  ESTIMATED_DAYS_MIN: 5,
  ESTIMATED_DAYS_MAX: 7,
} as const;

/**
 * COD (Cash on Delivery) Configuration
 *
 * COD_FEE is added to the order total for COD orders.
 * Set to 0 to offer free COD.
 * Displayed clearly to customer on checkout.
 */
export const COD_CONFIG = {
  /** COD handling fee (in INR). Added to order total for COD orders. */
  FEE: 99,
  /** Display label shown to customer */
  FEE_LABEL: "COD Handling Fee",
  /** Whether COD is currently available */
  ENABLED: true,
} as const;

/**
 * Tax Configuration
 *
 * TODO: Replace with proper GST calculation based on product HSN codes
 * once GST registration is confirmed.
 * DO NOT change RATE without business/legal confirmation.
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
 * Calculates COD fee for an order.
 * Returns 0 for non-COD payment methods.
 */
export function calculateCodFee(paymentMethod: string): number {
  if (!COD_CONFIG.ENABLED) return 0;
  return paymentMethod === "cod" ? COD_CONFIG.FEE : 0;
}

/**
 * Calculates tax amount for a given subtotal.
 */
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_CONFIG.RATE * 100) / 100;
}

/**
 * Calculates the final order total including COD fee.
 */
export function calculateTotal(
  subtotal: number,
  shippingAmount: number,
  taxAmount: number,
  discountAmount: number,
  codFee: number = 0
): number {
  return Math.max(0, subtotal + shippingAmount + taxAmount + codFee - discountAmount);
}
