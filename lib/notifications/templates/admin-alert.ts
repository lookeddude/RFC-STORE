/**
 * RFC Store — Admin Internal Alert Emails
 *
 * Clean internal notifications for new orders and payments.
 * Sent to ADMIN_NOTIFICATION_EMAIL.
 * Not customer-facing — more data-dense, admin-actionable.
 *
 * Uses the RFC Store shared email design system (components.ts).
 */

import {
  esc, fmtInr, emailShell, emailHeader, emailHero,
  emailBodyOpen, emailBodyClose, emailParagraph,
  emailInfoCard, emailCTAButton,
  emailFooter, BRAND,
} from './components';

// ── New Order Alert ───────────────────────────────────────────────────

export interface AdminNewOrderData {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  paymentMethod: string;
  itemCount?: number;
}

export function getAdminNewOrderSubject(orderNumber: string, totalAmount: number): string {
  return `\uD83D\uDED2 New Order \u2014 ${orderNumber} (${fmtInr(totalAmount)})`;
}

export function renderAdminNewOrderHtml(data: AdminNewOrderData): string {
  const adminOrderUrl = `${BRAND.SITE_URL}/admin/orders/${data.orderId}`;
  const isCod = data.paymentMethod === 'cod';

  const body = [
    emailParagraph(`A new <strong>${isCod ? 'Cash on Delivery' : 'Online (Prepaid)'}</strong> order has been placed.`),
    emailInfoCard([
      { label: 'Order Number',  value: data.orderNumber, bold: true, large: true },
      { label: 'Customer',      value: data.customerName },
      { label: 'Email',         value: data.customerEmail },
      ...(data.customerPhone ? [{ label: 'Phone', value: data.customerPhone }] : []),
      { label: 'Payment',       value: isCod ? 'Cash on Delivery' : 'Prepaid (Online)' },
      { label: 'Order Total',   value: fmtInr(data.totalAmount), bold: true },
      ...(data.itemCount != null ? [{ label: 'Items', value: String(data.itemCount) }] : []),
    ]),
    emailCTAButton('Open in Admin Panel', adminOrderUrl),
  ].join('');

  return emailShell([
    emailHeader('Admin \u2014 New Order'),
    emailHero({
      tone: isCod ? 'neutral' : 'success',
      title: `New ${isCod ? 'COD' : 'Paid'} Order`,
      subtitle: `${esc(data.orderNumber)} \u2014 ${fmtInr(data.totalAmount)} from ${esc(data.customerName)}`,
    }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}

// ── Payment Confirmed Admin Alert ────────────────────────────────────

export interface AdminPaymentData {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  razorpayPaymentId?: string;
}

export function getAdminPaymentSubject(orderNumber: string): string {
  return `\uD83D\uDCB3 Payment Confirmed \u2014 ${orderNumber}`;
}

export function renderAdminPaymentHtml(data: AdminPaymentData): string {
  const adminOrderUrl = `${BRAND.SITE_URL}/admin/orders/${data.orderId}`;

  const body = [
    emailParagraph('A Razorpay payment has been verified and the order is now paid.'),
    emailInfoCard([
      { label: 'Order Number',  value: data.orderNumber, bold: true, large: true },
      { label: 'Customer',      value: data.customerName },
      { label: 'Email',         value: data.customerEmail },
      { label: 'Amount Paid',   value: fmtInr(data.totalAmount), bold: true },
      ...(data.razorpayPaymentId ? [{ label: 'Payment ID', value: data.razorpayPaymentId }] : []),
    ]),
    emailCTAButton('Confirm Order in Admin Panel', adminOrderUrl),
  ].join('');

  return emailShell([
    emailHeader('Admin \u2014 Payment Received'),
    emailHero({
      tone: 'success',
      title: 'Payment Confirmed',
      subtitle: `Order ${esc(data.orderNumber)} is paid \u2014 ready to process.`,
    }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}
