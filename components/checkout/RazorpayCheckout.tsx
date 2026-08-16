'use client';

/**
 * RFC Store — Razorpay Checkout Client Component
 *
 * Loads Razorpay checkout.js from CDN (never bundled — Razorpay updates it frequently).
 * Opens the Razorpay payment modal with server-provided order details.
 *
 * SECURITY:
 *   - amount and razorpayOrderId MUST come from the server (never trust client totals)
 *   - guestToken stored in memory only (never localStorage/sessionStorage/URL)
 *   - On success: calls verifyRazorpayPaymentAction (server-side verification)
 */

import { useEffect, useCallback } from 'react';
import type { CheckoutFormData, CreateRazorpayOrderResult, VerifyRazorpayResult } from '@/types/order';
import { verifyRazorpayPaymentAction } from '@/lib/actions/razorpay';

// Extend window to include Razorpay
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: () => void) => void };
  }
}

interface RazorpayCheckoutProps {
  /** Server-provided order result from createRazorpayOrderAction */
  orderResult: CreateRazorpayOrderResult;
  /** Customer form data for prefill */
  formData: Pick<CheckoutFormData, 'fullName' | 'email' | 'phone'>;
  /** Called when payment verification succeeds */
  onSuccess: (orderNumber: string) => void;
  /** Called when payment fails or is cancelled */
  onError: (message: string) => void;
  /** Called when modal is dismissed without payment */
  onDismiss?: () => void;
  /** Trigger to open the modal — increment to re-open */
  trigger: number;
}

let scriptLoaded = false;
let scriptLoading = false;

/** Load Razorpay checkout.js from CDN (idempotent) */
function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (scriptLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  scriptLoading = true;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      scriptLoading = false;
      reject(new Error('Failed to load Razorpay checkout script'));
    };
    document.head.appendChild(script);
  });
}

export function RazorpayCheckout({
  orderResult,
  formData,
  onSuccess,
  onError,
  onDismiss,
  trigger,
}: RazorpayCheckoutProps) {
  const openModal = useCallback(async () => {
    if (!orderResult.success || !orderResult.razorpayOrderId) {
      onError('Payment initialization failed.');
      return;
    }

    try {
      await loadRazorpayScript();
    } catch {
      onError('Failed to load payment gateway. Please check your connection.');
      return;
    }

    if (!window.Razorpay) {
      onError('Payment gateway unavailable. Please try again.');
      return;
    }

    // All amounts from server — never from client state
    const razorpay = new window.Razorpay({
      key: orderResult.keyId,
      amount: orderResult.amount,           // paise — from server
      currency: orderResult.currency ?? 'INR',
      order_id: orderResult.razorpayOrderId, // from server
      name: 'Revive Fight Club',
      description: `Order ${orderResult.orderNumber}`,
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: '#E63946' },
      modal: {
        ondismiss: () => {
          onDismiss?.();
        },
      },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        // Payment succeeded in modal — now verify server-side
        // Note: guestToken is in memory only — pass it to the server action
        let result: VerifyRazorpayResult;
        try {
          result = await verifyRazorpayPaymentAction(
            orderResult.orderId!,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            orderResult.guestToken // undefined for authenticated users
          );
        } catch {
          onError('Failed to verify payment. Please contact support with your order number.');
          return;
        }

        if (result.success && result.orderNumber) {
          onSuccess(result.orderNumber);
        } else {
          onError(result.error ?? 'Payment verification failed. Please contact support.');
        }
      },
    });

    razorpay.open();
  }, [orderResult, formData, onSuccess, onError, onDismiss]);

  useEffect(() => {
    if (trigger > 0 && orderResult.success) {
      void openModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return null; // This component renders no UI — it manages the modal lifecycle
}
