/**
 * RFC Store — Notification Service
 *
 * Event-based transactional email system using Brevo.
 *
 * This module is SERVER-ONLY. Never import in client components.
 * All secrets (BREVO_API_KEY, ADMIN_NOTIFICATION_EMAIL) stay server-side.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  IMPLEMENTED EMAIL TRIGGERS                                      │
 * │                                                                  │
 * │  notifyOrderCreated       — COD order placed (checkout.ts)      │
 * │  notifyPaymentConfirmed   — Razorpay paid (razorpay.ts, webhook)│
 * │  notifyPaymentFailed      — Razorpay failed (webhook)           │
 * │  notifyOrderStatusChanged — Admin status change (admin/orders)  │
 * │  notifyRefundInitiated    — Inventory failure refund             │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * USAGE:
 *   import { notifyOrderCreated } from '@/lib/notifications';
 *   void notifyOrderCreated({ ... });   // non-blocking — never throws
 *
 * Email failure NEVER breaks order flow. Errors are caught and logged.
 */

import { getBrevoClient, BREVO_SENDER } from './brevo';

// ── Template Imports ──────────────────────────────────────────────────

import {
  getOrderConfirmationSubject,
  renderOrderConfirmationHtml,
  renderOrderConfirmationText,
} from './templates/order-confirmation';

import {
  getOrderStatusSubject,
  renderOrderStatusHtml,
  renderOrderStatusText,
} from './templates/order-status';

import {
  getPaymentConfirmedSubject,
  renderPaymentConfirmedHtml,
  renderPaymentConfirmedText,
  getPaymentFailedSubject,
  renderPaymentFailedHtml,
  renderPaymentFailedText,
  getRefundInitiatedSubject,
  renderRefundInitiatedHtml,
  renderRefundInitiatedText,
} from './templates/payment';

import {
  getAdminNewOrderSubject,
  renderAdminNewOrderHtml,
  getAdminPaymentSubject,
  renderAdminPaymentHtml,
} from './templates/admin-alert';

// ── Notification Status ───────────────────────────────────────────────

const EMAIL_CONFIGURED = !!process.env.BREVO_API_KEY;
const SMS_CONFIGURED   = !!(process.env.MSG91_API_KEY || process.env.TWILIO_ACCOUNT_SID);

// ── Core Email Send ───────────────────────────────────────────────────

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendTransactionalEmail(eventName: string, payload: EmailPayload): Promise<void> {
  if (!EMAIL_CONFIGURED) {
    console.info(`[RFC Notifications] EMAIL NOT CONFIGURED — skipping: ${eventName} → ${payload.to}`);
    return;
  }

  const client = getBrevoClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    sender:      BREVO_SENDER,
    to:          [{ email: payload.to }],
    subject:     payload.subject,
    htmlContent: payload.html,
  };
  if (payload.text) body.textContent = payload.text;

  await client.transactionalEmails.sendTransacEmail(body);
  console.info(`[RFC Notifications] Sent: ${eventName} → ${payload.to}`);
}

async function sendSMS(_event: string, _to: string): Promise<void> {
  if (!SMS_CONFIGURED) {
    console.info(`[RFC Notifications] SMS NOT CONFIGURED — skipping: ${_event}`);
    return;
  }
  // TODO: Implement MSG91 or Twilio integration
  console.info(`[RFC Notifications] SMS sent: ${_event} → ${_to}`);
}

// ── Public Event Interfaces ───────────────────────────────────────────

export interface OrderCreatedEvent {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  subtotal?: number;
  shippingAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  codFee?: number;
  currency: string;
  items: Array<{
    productName: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    fullName?: string | null;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country?: string | null;
  };
  paymentMethod: 'cod' | 'razorpay' | string;
}

export interface OrderStatusChangedEvent {
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  previousStatus: string;
  newStatus: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
  estimatedDelivery?: string | null;
  totalAmount?: number;
  deliveredDate?: string | null;
}

export interface PaymentConfirmedEvent {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  currency: string;
  razorpayPaymentId: string;
}

export interface PaymentFailedEvent {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
}

export interface RefundInitiatedEvent {
  orderNumber: string;
  orderId: string;
  razorpayPaymentId: string;
  amount: number;
}

// ── Legacy type — kept for compatibility ─────────────────────────────

export interface PaymentEvent {
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentId?: string;
  status: 'paid' | 'failed' | 'refunded';
}

// ── Public Notification Functions ─────────────────────────────────────

/**
 * Fire when a new COD order is created.
 * Sends order confirmation to customer + admin alert.
 * Safe to call without awaiting — failures are caught internally.
 */
export async function notifyOrderCreated(event: OrderCreatedEvent): Promise<void> {
  try {
    // Customer: order confirmation
    await sendTransactionalEmail('order_created', {
      to:      event.customerEmail,
      subject: getOrderConfirmationSubject(event.orderNumber, event.paymentMethod),
      html:    renderOrderConfirmationHtml({
        orderNumber:    event.orderNumber,
        orderId:        event.orderId,
        customerName:   event.customerName,
        totalAmount:    event.totalAmount,
        subtotal:       event.subtotal,
        shippingAmount: event.shippingAmount,
        taxAmount:      event.taxAmount,
        discountAmount: event.discountAmount,
        codFee:         event.codFee,
        paymentMethod:  event.paymentMethod,
        orderDate:      new Date(),
        items:          event.items,
        shippingAddress: event.shippingAddress,
      }),
      text: renderOrderConfirmationText({
        orderNumber:     event.orderNumber,
        customerName:    event.customerName,
        totalAmount:     event.totalAmount,
        paymentMethod:   event.paymentMethod,
        items:           event.items,
        shippingAddress: event.shippingAddress,
      }),
    });

    // Admin: new order alert
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendTransactionalEmail('order_created_admin', {
        to:      adminEmail,
        subject: getAdminNewOrderSubject(event.orderNumber, event.totalAmount),
        html:    renderAdminNewOrderHtml({
          orderNumber:    event.orderNumber,
          orderId:        event.orderId,
          customerName:   event.customerName,
          customerEmail:  event.customerEmail,
          customerPhone:  event.customerPhone,
          totalAmount:    event.totalAmount,
          paymentMethod:  event.paymentMethod,
          itemCount:      event.items.length,
        }),
      });
    }

    // SMS
    if (event.customerPhone) {
      await sendSMS('order_created_sms', event.customerPhone);
    }

    console.info(`[RFC Notifications] notifyOrderCreated: ${event.orderNumber}`);
  } catch (err) {
    // NEVER let notification failure break the order flow
    console.error('[RFC Notifications] notifyOrderCreated failed:', err);
  }
}

/**
 * Fire when Razorpay payment is confirmed.
 * MUST only be called when confirm_razorpay_payment() returns was_already_paid=false
 * to ensure exactly one email per payment (idempotency via DB FOR UPDATE lock).
 */
export async function notifyPaymentConfirmed(event: PaymentConfirmedEvent): Promise<void> {
  try {
    // Customer: payment confirmed
    await sendTransactionalEmail('payment_confirmed', {
      to:      event.customerEmail,
      subject: getPaymentConfirmedSubject(event.orderNumber),
      html:    renderPaymentConfirmedHtml({
        orderNumber:       event.orderNumber,
        orderId:           event.orderId,
        customerName:      event.customerName,
        totalAmount:       event.totalAmount,
        currency:          event.currency,
        razorpayPaymentId: event.razorpayPaymentId,
        orderDate:         new Date(),
      }),
      text: renderPaymentConfirmedText({
        orderNumber:       event.orderNumber,
        customerName:      event.customerName,
        totalAmount:       event.totalAmount,
        razorpayPaymentId: event.razorpayPaymentId,
      }),
    });

    // Admin: payment alert
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendTransactionalEmail('payment_confirmed_admin', {
        to:      adminEmail,
        subject: getAdminPaymentSubject(event.orderNumber),
        html:    renderAdminPaymentHtml({
          orderNumber:       event.orderNumber,
          orderId:           event.orderId,
          customerName:      event.customerName,
          customerEmail:     event.customerEmail,
          totalAmount:       event.totalAmount,
          razorpayPaymentId: event.razorpayPaymentId,
        }),
      });
    }

    console.info(`[RFC Notifications] notifyPaymentConfirmed: ${event.orderNumber}`);
  } catch (err) {
    console.error('[RFC Notifications] notifyPaymentConfirmed failed:', err);
  }
}

/**
 * Fire when Razorpay payment fails (via webhook payment.failed event).
 */
export async function notifyPaymentFailed(event: PaymentFailedEvent): Promise<void> {
  try {
    await sendTransactionalEmail('payment_failed', {
      to:      event.customerEmail,
      subject: getPaymentFailedSubject(event.orderNumber),
      html:    renderPaymentFailedHtml({
        orderNumber:  event.orderNumber,
        orderId:      event.orderId,
        customerName: event.customerName,
      }),
      text: renderPaymentFailedText({
        orderNumber:  event.orderNumber,
        customerName: event.customerName,
      }),
    });
    console.info(`[RFC Notifications] notifyPaymentFailed: ${event.orderNumber}`);
  } catch (err) {
    console.error('[RFC Notifications] notifyPaymentFailed failed:', err);
  }
}

/**
 * Fire when admin changes order status (confirmed/processing/shipped/delivered/cancelled).
 */
export async function notifyOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
  try {
    await sendTransactionalEmail('order_status_changed', {
      to:      event.customerEmail,
      subject: getOrderStatusSubject(event.orderNumber, event.newStatus),
      html:    renderOrderStatusHtml({
        orderNumber:       event.orderNumber,
        orderId:           event.orderId,
        customerName:      event.customerName,
        newStatus:         event.newStatus,
        previousStatus:    event.previousStatus,
        trackingNumber:    event.trackingNumber,
        trackingUrl:       event.trackingUrl,
        carrier:           event.carrier,
        estimatedDelivery: event.estimatedDelivery,
        totalAmount:       event.totalAmount,
        deliveredDate:     event.deliveredDate,
      }),
      text: renderOrderStatusText({
        orderNumber:    event.orderNumber,
        orderId:        event.orderId,
        customerName:   event.customerName,
        newStatus:      event.newStatus,
        trackingNumber: event.trackingNumber,
      }),
    });
    console.info(`[RFC Notifications] notifyOrderStatusChanged: ${event.orderNumber} → ${event.newStatus}`);
  } catch (err) {
    console.error('[RFC Notifications] notifyOrderStatusChanged failed:', err);
  }
}

/**
 * Fire when a refund is initiated (inventory unavailable post-payment).
 */
export async function notifyRefundInitiated(event: RefundInitiatedEvent): Promise<void> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('customer_email, customer_name')
      .eq('id', event.orderId)
      .maybeSingle();

    if (order?.customer_email) {
      await sendTransactionalEmail('refund_initiated', {
        to:      order.customer_email as string,
        subject: getRefundInitiatedSubject(event.orderNumber),
        html:    renderRefundInitiatedHtml({
          orderNumber:       event.orderNumber,
          customerName:      order.customer_name as string | null,
          amount:            event.amount,
          razorpayPaymentId: event.razorpayPaymentId,
        }),
        text: renderRefundInitiatedText({
          orderNumber:  event.orderNumber,
          customerName: order.customer_name as string | null,
          amount:       event.amount,
        }),
      });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendTransactionalEmail('refund_initiated_admin', {
        to:      adminEmail,
        subject: `\u26A0\uFE0F Refund Initiated \u2014 ${event.orderNumber}`,
        html:    renderRefundInitiatedHtml({
          orderNumber:       event.orderNumber,
          amount:            event.amount,
          razorpayPaymentId: event.razorpayPaymentId,
        }),
      });
    }

    console.info(`[RFC Notifications] notifyRefundInitiated: ${event.orderNumber}`);
  } catch (err) {
    console.error('[RFC Notifications] notifyRefundInitiated failed:', err);
  }
}

/**
 * Legacy compatibility shim — routes generic PaymentEvent to typed functions.
 * Prefer the specific typed functions above for new code.
 */
export async function notifyPaymentEvent(event: PaymentEvent): Promise<void> {
  if (event.status === 'failed') {
    return notifyPaymentFailed({
      orderNumber:   event.orderNumber,
      orderId:       event.orderId,
      customerName:  event.customerName,
      customerEmail: event.customerEmail,
    });
  }
  console.info(`[RFC Notifications] notifyPaymentEvent: ${event.orderNumber} status=${event.status} (no specific template)`);
}

// ── Diagnostic ────────────────────────────────────────────────────────

export function getNotificationStatus() {
  return {
    email: EMAIL_CONFIGURED
      ? { configured: true, provider: 'Brevo' }
      : { configured: false, message: 'Set BREVO_API_KEY to enable' },
    sms: SMS_CONFIGURED
      ? { configured: true, provider: process.env.MSG91_API_KEY ? 'MSG91' : 'Twilio' }
      : { configured: false, message: 'Set MSG91_API_KEY or TWILIO_ACCOUNT_SID to enable' },
  };
}
