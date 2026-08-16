/**
 * RFC Store — Razorpay Service Layer
 *
 * SERVER-ONLY. Never import in client components.
 * Wraps Razorpay Node.js SDK for order creation and refunds.
 *
 * Security:
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID — safe to expose (used by Razorpay Checkout JS)
 *   RAZORPAY_KEY_SECRET         — server only, NEVER in browser
 */

import Razorpay from 'razorpay';

let _instance: Razorpay | null = null;

/** Get singleton Razorpay instance. Throws if credentials are missing. */
function getRazorpayInstance(): Razorpay {
  if (!_instance) {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('[Razorpay] NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured');
    }

    _instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _instance;
}

export interface RazorpayOrderOptions {
  /** Amount in paise (INR × 100) */
  amount: number;
  currency: string;
  /** RFC order number — used as receipt for reconciliation */
  receipt: string;
  /** Optional metadata */
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;          // rzp_order_xxx
  amount: number;      // paise
  currency: string;
  receipt: string;
  status: string;
}

/** Create a Razorpay order. Amount must be in paise. */
export async function createRazorpayOrder(
  options: RazorpayOrderOptions
): Promise<RazorpayOrderResult> {
  const rzp = getRazorpayInstance();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = await (rzp.orders.create as any)({
    amount: options.amount,
    currency: options.currency,
    receipt: options.receipt,
    notes: options.notes ?? {},
  });
  return order as RazorpayOrderResult;
}

export interface RazorpayPaymentDetails {
  id: string;              // pay_xxx
  order_id: string;        // rzp_order_xxx
  amount: number;          // paise
  currency: string;
  status: string;          // 'captured' | 'authorized' | 'failed'
  captured: boolean;
}

/** Fetch a payment from Razorpay API for server-side verification. */
export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayPaymentDetails> {
  const rzp = getRazorpayInstance();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payment = await (rzp.payments.fetch as any)(paymentId);
  return payment as RazorpayPaymentDetails;
}

export interface RazorpayRefundOptions {
  /** Amount in paise. If omitted, full refund. */
  amount?: number;
  /** RFC order number — used as receipt for idempotency */
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayRefundResult {
  id: string;      // rfnd_xxx
  payment_id: string;
  amount: number;
  status: string;
}

/** Initiate a Razorpay refund. Uses receipt for idempotency. */
export async function createRazorpayRefund(
  paymentId: string,
  options: RazorpayRefundOptions = {}
): Promise<RazorpayRefundResult> {
  const rzp = getRazorpayInstance();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refund = await (rzp.payments.refund as any)(paymentId, {
    amount: options.amount,
    notes: {
      receipt: options.receipt ?? '',
      ...options.notes,
    },
  });
  return refund as RazorpayRefundResult;
}
