/**
 * RFC Store — Razorpay Signature Verification
 *
 * SERVER-ONLY. Uses Node.js built-in crypto module.
 * Never depends on Razorpay SDK for verification (reduces attack surface).
 *
 * Two verification types:
 *   1. Payment signature — verifies Razorpay Checkout callback
 *   2. Webhook signature — verifies Razorpay webhook body
 */

import crypto from 'crypto';

/**
 * Verify the Razorpay payment signature from Checkout callback.
 *
 * Razorpay signs: HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)
 *
 * @param razorpayOrderId   - From Razorpay callback
 * @param razorpayPaymentId - From Razorpay callback
 * @param signature         - From Razorpay callback
 * @returns true if signature is valid
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[Razorpay] RAZORPAY_KEY_SECRET not configured');
    return false;
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    // Buffer length mismatch — invalid signature format
    return false;
  }
}

/**
 * Verify the Razorpay webhook signature.
 *
 * Razorpay signs: HMAC-SHA256(rawBody, WEBHOOK_SECRET)
 * Header: X-Razorpay-Signature
 *
 * @param rawBody   - Raw request body as string (must NOT be parsed before verification)
 * @param signature - Value of X-Razorpay-Signature header
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Razorpay] RAZORPAY_WEBHOOK_SECRET not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}
