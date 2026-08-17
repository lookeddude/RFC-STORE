/**
 * RFC Store — Order Confirmation Email Templates
 *
 * Handles:
 *  - COD order placed
 *  - Razorpay-paid order (called from notifyPaymentConfirmed or notifyOrderCreated)
 *
 * Uses the RFC Store shared email design system (components.ts).
 */

import {
  esc, fmtInr, fmtDate, emailShell, emailHeader, emailHero,
  emailBodyOpen, emailBodyClose, emailGreeting, emailParagraph,
  emailInfoCard, emailOrderItems, emailPriceSummary, emailCodNotice,
  emailAddressBlock, emailStatusTimeline, emailCTAButton,
  emailSupportSection, emailFooter, emailSpacer, BRAND,
  type OrderItemRow, type AddressData,
} from './components';

// ── Types ────────────────────────────────────────────────────────────

export interface OrderConfirmationData {
  orderNumber: string;
  orderId?: string;
  customerName: string;
  totalAmount: number;
  subtotal?: number;
  shippingAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  codFee?: number;
  paymentMethod: 'cod' | 'razorpay' | string;
  currency?: string;
  orderDate?: Date | string | null;
  items: OrderItemRow[];
  shippingAddress: AddressData;
}

// ── Subject Lines ─────────────────────────────────────────────────────

export function getOrderConfirmationSubject(orderNumber: string, paymentMethod?: string): string {
  if (paymentMethod === 'cod') {
    return `Your RFC Store order is confirmed \u2014 ${orderNumber}`;
  }
  return `Your RFC Store order is confirmed \u2014 ${orderNumber}`;
}

// ── HTML ─────────────────────────────────────────────────────────────

export function renderOrderConfirmationHtml(data: OrderConfirmationData): string {
  const isCod = data.paymentMethod === 'cod';
  const orderUrl = data.orderId
    ? `${BRAND.SITE_URL}/account/orders/${data.orderId}`
    : `${BRAND.SITE_URL}/account/orders`;

  // Build price lines
  const priceLines = [];
  if (data.subtotal != null && data.subtotal !== data.totalAmount) {
    priceLines.push({ label: 'Subtotal', value: data.subtotal });
    if (data.discountAmount && data.discountAmount > 0) {
      priceLines.push({ label: 'Discount', value: -data.discountAmount, muted: true });
    }
    if (data.shippingAmount != null) {
      priceLines.push({ label: 'Shipping', value: data.shippingAmount, muted: data.shippingAmount === 0 });
    }
    if (data.taxAmount && data.taxAmount > 0) {
      priceLines.push({ label: 'GST', value: data.taxAmount, muted: true });
    }
    if (isCod && data.codFee && data.codFee > 0) {
      priceLines.push({ label: 'COD Handling Fee', value: data.codFee, muted: true });
    }
  }
  priceLines.push({ label: 'Total', value: data.totalAmount, total: true });

  // Timeline — COD confirmed, payment on delivery
  const timelineSteps = isCod
    ? [
        { label: 'Order Placed', state: 'done' as const },
        { label: 'Order Confirmed', state: 'active' as const },
        { label: 'Processing & Packing', state: 'pending' as const },
        { label: 'Shipped', state: 'pending' as const },
        { label: 'Delivered & Payment Collected', state: 'pending' as const },
      ]
    : [
        { label: 'Order Placed', state: 'done' as const },
        { label: 'Payment Received', state: 'done' as const },
        { label: 'Order Confirmed', state: 'active' as const },
        { label: 'Processing & Packing', state: 'pending' as const },
        { label: 'Shipped', state: 'pending' as const },
        { label: 'Delivered', state: 'pending' as const },
      ];

  const heroTitle = isCod
    ? 'Order Confirmed'
    : 'Order Confirmed';
  const heroSubtitle = isCod
    ? `Thank you, ${esc(data.customerName)}. Your Cash on Delivery order has been placed successfully.`
    : `Thank you, ${esc(data.customerName)}. Your order has been confirmed.`;

  const body = [
    emailGreeting(data.customerName),
    emailParagraph(
      isCod
        ? 'Your order is confirmed and will be dispatched within 1\u20132 business days. Keep the exact amount ready at delivery.'
        : 'Your payment has been received and your order is confirmed. We\u2019ll notify you once it\u2019s dispatched.'
    ),
    emailInfoCard([
      { label: 'Order Number', value: data.orderNumber, bold: true, large: true },
      { label: 'Order Date',   value: fmtDate(data.orderDate) },
      { label: 'Payment',      value: isCod ? 'Cash on Delivery' : 'Online Payment' },
      { label: 'Order Total',  value: fmtInr(data.totalAmount), bold: true },
    ]),
    emailOrderItems(data.items),
    emailPriceSummary(priceLines),
    isCod && data.totalAmount ? emailCodNotice(data.totalAmount) : '',
    emailAddressBlock(data.shippingAddress),
    emailStatusTimeline(timelineSteps),
    emailCTAButton('View Your Order', orderUrl),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  const html = [
    emailHeader(isCod ? 'Order Confirmed' : 'Order Confirmed'),
    emailHero({ tone: 'success', title: heroTitle, subtitle: heroSubtitle }),
    emailBodyOpen(),
    body,
    emailBodyClose(),
  ].join('');

  return emailShell(html + emailFooter());
}

// ── Plain Text ────────────────────────────────────────────────────────

export function renderOrderConfirmationText(data: OrderConfirmationData): string {
  const isCod = data.paymentMethod === 'cod';
  const lines = [
    `RFC Store \u2014 Order Confirmed`,
    ``,
    `Hi ${data.customerName},`,
    ``,
    `Your order ${data.orderNumber} has been confirmed.`,
    `Total: ${fmtInr(data.totalAmount)}`,
    `Payment: ${isCod ? 'Cash on Delivery' : 'Online Payment'}`,
    `Date: ${fmtDate(data.orderDate)}`,
    ``,
    `Items:`,
    ...data.items.map(i => `  \u2022 ${i.productName}${i.variantName ? ` (${i.variantName})` : ''} x${i.quantity} \u2014 ${fmtInr(i.unitPrice * i.quantity)}`),
    ``,
    isCod ? `Please keep ${fmtInr(data.totalAmount)} ready at delivery.` : '',
    ``,
    `Shipping to: ${[data.shippingAddress.line1, data.shippingAddress.line2, data.shippingAddress.city, data.shippingAddress.state, data.shippingAddress.postalCode].filter(Boolean).join(', ')}`,
    ``,
    `Questions? ${BRAND.SUPPORT}`,
  ];
  return lines.filter(l => l !== undefined).join('\n').trim();
}
