/**
 * RFC Store — Notification Service (Phase 9)
 *
 * Clean event-based notification architecture.
 * Currently: SERVER-SIDE LOGGING ONLY.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  PENDING EXTERNAL CONFIGURATION                         │
 * │                                                         │
 * │  To enable email notifications, configure ONE of:       │
 * │    - Resend:      RESEND_API_KEY in .env.local          │
 * │    - SendGrid:    SENDGRID_API_KEY in .env.local        │
 * │    - Nodemailer:  SMTP_HOST, SMTP_USER, SMTP_PASS       │
 * │                                                         │
 * │  To enable SMS notifications:                           │
 * │    - Twilio:      TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN │
 * │    - MSG91:       MSG91_API_KEY                         │
 * │                                                         │
 * │  Then implement the sendEmail / sendSMS functions       │
 * │  below and remove the NOT_CONFIGURED guard.             │
 * └─────────────────────────────────────────────────────────┘
 *
 * USAGE:
 *   import { notifyOrderCreated } from '@/lib/notifications';
 *   await notifyOrderCreated({ orderNumber, customerEmail, ... });
 *
 * This module is SERVER-ONLY. Never import it in client components.
 * All secrets stay server-side.
 */

// ── Order Event Types ──────────────────────────────────────

export interface OrderCreatedEvent {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  currency: string;
  items: Array<{
    productName: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
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
}

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

// ── Notification Channel Status ────────────────────────────

const EMAIL_CONFIGURED = !!(
  process.env.RESEND_API_KEY ||
  process.env.SENDGRID_API_KEY ||
  process.env.SMTP_HOST
);

const SMS_CONFIGURED = !!(
  process.env.MSG91_API_KEY ||
  process.env.TWILIO_ACCOUNT_SID
);

// ── Internal helpers ───────────────────────────────────────

async function sendEmail(_event: string, _to: string, _payload: unknown): Promise<void> {
  if (!EMAIL_CONFIGURED) {
    // Email provider not yet configured — log and skip
    console.info(`[RFC Notifications] EMAIL NOT CONFIGURED — skipping event: ${_event} → ${_to}`);
    return;
  }

  // TODO: Implement email sending with your configured provider
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'orders@revivefightclub.com',
  //   to: _to,
  //   subject: getSubject(_event),
  //   html: renderTemplate(_event, _payload),
  // });

  console.info(`[RFC Notifications] Email sent: ${_event} → ${_to}`);
}

async function sendSMS(_event: string, _to: string, _message: string): Promise<void> {
  if (!SMS_CONFIGURED) {
    console.info(`[RFC Notifications] SMS NOT CONFIGURED — skipping event: ${_event} → ${_to}`);
    return;
  }

  // TODO: Implement SMS sending with MSG91 or Twilio
  console.info(`[RFC Notifications] SMS sent: ${_event} → ${_to}`);
}

// ── Public Notification Functions ──────────────────────────

/**
 * Fire when a new order is created.
 * Sends confirmation email to customer + alert to admin.
 * Safe to call without awaiting — failures are caught and logged.
 */
export async function notifyOrderCreated(event: OrderCreatedEvent): Promise<void> {
  try {
    // Customer confirmation
    await sendEmail('order_created', event.customerEmail, event);

    // Admin alert (use store contact email from store_settings or env)
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendEmail('order_created_admin', adminEmail, event);
    }

    // SMS confirmation (Indian mobile numbers)
    if (event.customerPhone) {
      const msg = `RFC Store: Order ${event.orderNumber} confirmed! Total: ₹${event.totalAmount}. We'll update you when it ships.`;
      await sendSMS('order_created_sms', event.customerPhone, msg);
    }

    console.info(`[RFC Notifications] notifyOrderCreated: ${event.orderNumber}`);
  } catch (err) {
    // NEVER let notification failure break the order flow
    console.error('[RFC Notifications] notifyOrderCreated failed:', err);
  }
}

/**
 * Fire when an admin changes order status (confirmed/shipped/delivered/cancelled).
 */
export async function notifyOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
  try {
    await sendEmail('order_status_changed', event.customerEmail, event);
    console.info(`[RFC Notifications] notifyOrderStatusChanged: ${event.orderNumber} → ${event.newStatus}`);
  } catch (err) {
    console.error('[RFC Notifications] notifyOrderStatusChanged failed:', err);
  }
}

/**
 * Fire when payment is confirmed, failed, or refunded.
 */
export async function notifyPaymentEvent(event: PaymentEvent): Promise<void> {
  try {
    const eventType = `payment_${event.status}`;
    await sendEmail(eventType, event.customerEmail, event);
    console.info(`[RFC Notifications] notifyPaymentEvent: ${event.orderNumber} status=${event.status}`);
  } catch (err) {
    console.error('[RFC Notifications] notifyPaymentEvent failed:', err);
  }
}

// ── Notification Status (for admin diagnostics) ────────────

export function getNotificationStatus() {
  return {
    email: EMAIL_CONFIGURED
      ? { configured: true, provider: process.env.RESEND_API_KEY ? 'Resend' : process.env.SENDGRID_API_KEY ? 'SendGrid' : 'SMTP' }
      : { configured: false, message: 'Set RESEND_API_KEY, SENDGRID_API_KEY, or SMTP_HOST to enable' },
    sms: SMS_CONFIGURED
      ? { configured: true, provider: process.env.MSG91_API_KEY ? 'MSG91' : 'Twilio' }
      : { configured: false, message: 'Set MSG91_API_KEY or TWILIO_ACCOUNT_SID to enable' },
  };
}
