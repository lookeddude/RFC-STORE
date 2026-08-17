/**
 * RFC Store — Payment Email Templates
 *
 * Handles:
 *  - Payment Confirmed (Razorpay)
 *  - Payment Failed
 *  - Refund Initiated
 *
 * Uses the RFC Store shared email design system (components.ts).
 */

import {
  esc, fmtInr, fmtDate, emailShell, emailHeader, emailHero,
  emailBodyOpen, emailBodyClose, emailGreeting, emailParagraph,
  emailInfoCard, emailCTAButton, emailSecondaryButton,
  emailSupportSection, emailFooter, emailSpacer, BRAND,
} from './components';

// ── Payment Confirmed ─────────────────────────────────────────────────

export interface PaymentConfirmedEmailData {
  orderNumber: string;
  orderId?: string;
  customerName: string;
  totalAmount: number;
  currency?: string;
  razorpayPaymentId: string;
  orderDate?: Date | string | null;
}

export function getPaymentConfirmedSubject(orderNumber: string): string {
  return `Payment received \u2014 RFC Store order ${orderNumber}`;
}

export function renderPaymentConfirmedHtml(data: PaymentConfirmedEmailData): string {
  const orderUrl = data.orderId
    ? `${BRAND.SITE_URL}/account/orders/${data.orderId}`
    : `${BRAND.SITE_URL}/account/orders`;

  const body = [
    emailGreeting(data.customerName),
    emailParagraph('Your payment has been received and verified. Your order is now confirmed and will be dispatched within 1\u20132 business days.'),
    emailInfoCard([
      { label: 'Order Number',  value: data.orderNumber, bold: true, large: true },
      { label: 'Amount Paid',   value: fmtInr(data.totalAmount), bold: true },
      { label: 'Payment Date',  value: fmtDate(data.orderDate) },
      { label: 'Payment Mode',  value: 'Online Payment (Razorpay)' },
    ]),
    emailParagraph('You will receive a shipping update with tracking details once your order is dispatched. Estimated delivery: <strong>5\u20137 business days</strong>.'),
    emailCTAButton('View Your Order', orderUrl),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  const html = [
    emailHeader('Payment Received'),
    emailHero({
      tone: 'success',
      title: 'Payment Confirmed',
      subtitle: `We\u2019ve received your payment of ${fmtInr(data.totalAmount)} for order ${esc(data.orderNumber)}.`,
    }),
    emailBodyOpen(),
    body,
    emailBodyClose(),
  ].join('');

  return emailShell(html + emailFooter());
}

export function renderPaymentConfirmedText(data: PaymentConfirmedEmailData): string {
  return `RFC Store \u2014 Payment Confirmed

Hi ${data.customerName},

Your payment of ${fmtInr(data.totalAmount)} for order ${data.orderNumber} has been received.

Payment Mode: Online Payment
Date: ${fmtDate(data.orderDate)}

Estimated delivery: 5\u20137 business days.

Questions? ${BRAND.SUPPORT}`.trim();
}

// ── Payment Confirmed Admin ───────────────────────────────────────────

export interface PaymentConfirmedAdminData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  razorpayPaymentId: string;
}

export function getPaymentConfirmedAdminSubject(orderNumber: string): string {
  return `\uD83D\uDCB3 Payment Received \u2014 ${orderNumber}`;
}

export function renderPaymentConfirmedAdminHtml(data: PaymentConfirmedAdminData): string {
  const adminUrl = `${BRAND.SITE_URL}/admin/orders`;
  const body = [
    emailParagraph(`<strong>${esc(data.customerName)}</strong> (${esc(data.customerEmail)}) completed payment for order <strong>${esc(data.orderNumber)}</strong>.`),
    emailInfoCard([
      { label: 'Order',    value: data.orderNumber, bold: true },
      { label: 'Customer', value: data.customerName },
      { label: 'Email',    value: data.customerEmail },
      { label: 'Amount',   value: fmtInr(data.totalAmount), bold: true },
    ]),
    emailCTAButton('View in Admin Panel', adminUrl),
  ].join('');

  const html = [
    emailHeader('Admin Alert'),
    emailHero({ tone: 'info', title: 'Payment Received', subtitle: `Order ${esc(data.orderNumber)} has been paid.` }),
    emailBodyOpen(),
    body,
    emailBodyClose(),
  ].join('');
  return emailShell(html + emailFooter());
}

// ── Payment Failed ────────────────────────────────────────────────────

export interface PaymentFailedEmailData {
  orderNumber: string;
  orderId?: string;
  customerName: string;
}

export function getPaymentFailedSubject(orderNumber: string): string {
  return `Action needed \u2014 RFC Store payment could not be completed (${orderNumber})`;
}

export function renderPaymentFailedHtml(data: PaymentFailedEmailData): string {
  const retryUrl = data.orderId
    ? `${BRAND.SITE_URL}/account/orders/${data.orderId}`
    : `${BRAND.SITE_URL}/account/orders`;

  const body = [
    emailGreeting(data.customerName),
    emailParagraph('Unfortunately, we were unable to complete your payment. Your order has <strong>not</strong> been charged.'),
    emailInfoCard([
      { label: 'Order Number', value: data.orderNumber, bold: true },
      { label: 'Status',       value: 'Payment Failed' },
    ]),
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.DANGER_BG};border:1px solid ${BRAND.DANGER_BD};border-radius:6px;margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${BRAND.DANGER_TX};text-transform:uppercase;letter-spacing:0.06em;">What happened?</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.DANGER_TX};line-height:1.6;">Your payment was declined by your bank or card issuer. This may be due to insufficient funds, a temporary block, or your bank requiring additional authentication.</p>
    </td>
  </tr>
</table>`,
    emailParagraph('Your cart items are still saved. You can retry the payment or contact your bank for details.'),
    emailCTAButton('Retry Payment', `${BRAND.SITE_URL}/cart`),
    emailSecondaryButton('View Order', retryUrl),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  const html = [
    emailHeader('Payment Failed'),
    emailHero({
      tone: 'danger',
      title: 'We couldn\u2019t complete your payment',
      subtitle: `Order ${esc(data.orderNumber)} \u2014 No charge has been made to your account.`,
    }),
    emailBodyOpen(),
    body,
    emailBodyClose(),
  ].join('');

  return emailShell(html + emailFooter());
}

export function renderPaymentFailedText(data: PaymentFailedEmailData): string {
  return `RFC Store \u2014 Payment Could Not Be Completed

Hi ${data.customerName},

We were unable to process your payment for order ${data.orderNumber}.

Your account has NOT been charged.

Please retry the payment at: ${BRAND.SITE_URL}/cart

Questions? ${BRAND.SUPPORT}`.trim();
}

// ── Refund Initiated ──────────────────────────────────────────────────

export interface RefundInitiatedEmailData {
  orderNumber: string;
  customerName?: string | null;
  amount: number;
  razorpayPaymentId?: string;
}

export function getRefundInitiatedSubject(orderNumber: string): string {
  return `Your RFC Store refund is being processed \u2014 ${orderNumber}`;
}

export function renderRefundInitiatedHtml(data: RefundInitiatedEmailData): string {
  const name = data.customerName ?? 'Valued Customer';
  const body = [
    emailGreeting(name),
    emailParagraph('We\u2019re sorry your order couldn\u2019t be fulfilled. We\u2019ve initiated a refund which will be credited back to your original payment method.'),
    emailInfoCard([
      { label: 'Order Number',    value: data.orderNumber, bold: true },
      { label: 'Refund Amount',   value: fmtInr(data.amount), bold: true, large: true },
      { label: 'Refund Status',   value: 'Initiated — Processing' },
      { label: 'Timeline',        value: '5\u20137 business days' },
    ]),
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.WARN_BG};border:1px solid ${BRAND.WARN_BD};border-radius:6px;margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.WARN_TX};line-height:1.6;">Refunds typically take <strong>5\u20137 business days</strong> to appear in your account, depending on your bank or card issuer. If you don\u2019t see the refund after 7 days, please contact us.</p>
    </td>
  </tr>
</table>`,
    emailCTAButton('View Order', `${BRAND.SITE_URL}/account/orders`),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  const html = [
    emailHeader('Refund Initiated'),
    emailHero({
      tone: 'warning',
      title: 'Your refund is being processed',
      subtitle: `Refund of ${fmtInr(data.amount)} for order ${esc(data.orderNumber)} is on its way back to you.`,
    }),
    emailBodyOpen(),
    body,
    emailBodyClose(),
  ].join('');

  return emailShell(html + emailFooter());
}

export function renderRefundInitiatedText(data: RefundInitiatedEmailData): string {
  const name = data.customerName ?? 'Valued Customer';
  return `RFC Store \u2014 Refund Initiated

Hi ${name},

Your refund of ${fmtInr(data.amount)} for order ${data.orderNumber} has been initiated.

Please allow 5\u20137 business days for the refund to appear in your account.

Questions? ${BRAND.SUPPORT}`.trim();
}
