/**
 * RFC Store — Order Status Email Templates
 *
 * Each status transition gets a purpose-built layout, not a generic
 * "status update" message. Status-specific content, hero tone,
 * CTA, and information shown.
 *
 * Statuses handled:
 *  - confirmed   : Admin confirmed the order
 *  - processing  : Order is being packed
 *  - shipped     : Order dispatched with tracking
 *  - delivered   : Order delivered
 *  - cancelled   : Order cancelled
 *
 * Uses the RFC Store shared email design system (components.ts).
 */

import {
  esc, fmtInr, fmtDate, emailShell, emailHeader, emailHero,
  emailBodyOpen, emailBodyClose, emailGreeting, emailParagraph,
  emailInfoCard, emailTrackingCard, emailStatusTimeline,
  emailCTAButton, emailSecondaryButton, emailSupportSection,
  emailFooter, emailSpacer, BRAND,
  type TimelineStep,
} from './components';

// ── Types ────────────────────────────────────────────────────────────

export interface OrderStatusEmailData {
  orderNumber: string;
  orderId: string;
  customerName: string;
  newStatus: string;
  previousStatus?: string;
  // Shipping specific
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
  estimatedDelivery?: string | null;
  // Order financials (optional — included when available)
  totalAmount?: number;
  deliveredDate?: Date | string | null;
}

// ── Subject Lines ─────────────────────────────────────────────────────

const STATUS_SUBJECTS: Record<string, (orderNumber: string) => string> = {
  confirmed:   (n) => `Your RFC Store order is confirmed \u2014 ${n}`,
  processing:  (n) => `Your RFC Store order is being prepared \u2014 ${n}`,
  shipped:     (n) => `Your RFC Store order is on the way \u2014 ${n}`,
  delivered:   (n) => `Your RFC Store order has arrived \u2014 ${n}`,
  cancelled:   (n) => `Your RFC Store order has been cancelled \u2014 ${n}`,
  refund_pending: (n) => `Your RFC Store order is on hold \u2014 ${n}`,
};

export function getOrderStatusSubject(orderNumber: string, status: string): string {
  const fn = STATUS_SUBJECTS[status];
  return fn ? fn(orderNumber) : `RFC Store order update \u2014 ${orderNumber}`;
}

// ── Confirmed ─────────────────────────────────────────────────────────

function renderConfirmedHtml(data: OrderStatusEmailData): string {
  const orderUrl = `${BRAND.SITE_URL}/account/orders/${data.orderId}`;
  const timeline: TimelineStep[] = [
    { label: 'Order Placed', state: 'done' },
    { label: 'Order Confirmed', state: 'done' },
    { label: 'Processing & Packing', state: 'pending' },
    { label: 'Shipped', state: 'pending' },
    { label: 'Delivered', state: 'pending' },
  ];

  const body = [
    emailGreeting(data.customerName),
    emailParagraph('Great news \u2014 your order has been confirmed by our team and is being prepared for dispatch.'),
    emailInfoCard([
      { label: 'Order Number', value: data.orderNumber, bold: true, large: true },
      { label: 'Status',       value: 'Confirmed \u2714' },
      { label: 'Est. Dispatch', value: '1\u20132 business days' },
    ]),
    emailStatusTimeline(timeline),
    emailCTAButton('View Your Order', orderUrl),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  return emailShell([
    emailHeader('Order Confirmed'),
    emailHero({ tone: 'success', title: 'Order Confirmed', subtitle: `Your order ${esc(data.orderNumber)} is confirmed and will be dispatched soon.` }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}

// ── Processing ────────────────────────────────────────────────────────

function renderProcessingHtml(data: OrderStatusEmailData): string {
  const orderUrl = `${BRAND.SITE_URL}/account/orders/${data.orderId}`;
  const timeline: TimelineStep[] = [
    { label: 'Order Placed', state: 'done' },
    { label: 'Order Confirmed', state: 'done' },
    { label: 'Processing & Packing', state: 'active' },
    { label: 'Shipped', state: 'pending' },
    { label: 'Delivered', state: 'pending' },
  ];

  const body = [
    emailGreeting(data.customerName),
    emailParagraph('Our warehouse team is packing your order right now. You\u2019ll receive a shipping confirmation with tracking details as soon as it\u2019s dispatched.'),
    emailInfoCard([
      { label: 'Order Number', value: data.orderNumber, bold: true, large: true },
      { label: 'Status',       value: 'Being Packed' },
    ]),
    emailStatusTimeline(timeline),
    emailCTAButton('View Your Order', orderUrl),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  return emailShell([
    emailHeader('Order Processing'),
    emailHero({ tone: 'info', title: 'We\u2019re packing your order', subtitle: `Order ${esc(data.orderNumber)} is being prepared for dispatch.` }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}

// ── Shipped ───────────────────────────────────────────────────────────

function renderShippedHtml(data: OrderStatusEmailData): string {
  const orderUrl = `${BRAND.SITE_URL}/account/orders/${data.orderId}`;
  const timeline: TimelineStep[] = [
    { label: 'Order Placed', state: 'done' },
    { label: 'Order Confirmed', state: 'done' },
    { label: 'Processing & Packing', state: 'done' },
    { label: 'Shipped', state: 'active' },
    { label: 'Delivered', state: 'pending' },
  ];

  const body = [
    emailGreeting(data.customerName),
    emailParagraph('Your RFC Store gear is on its way! Your order has been dispatched and is en route to you.'),
    emailInfoCard([
      { label: 'Order Number', value: data.orderNumber, bold: true, large: true },
      { label: 'Status',       value: 'Shipped \uD83D\uDE9A' },
      ...(data.estimatedDelivery ? [{ label: 'Est. Delivery', value: data.estimatedDelivery }] : []),
    ]),
    emailTrackingCard({
      courier: data.carrier,
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
      estimatedDelivery: data.estimatedDelivery,
    }),
    emailStatusTimeline(timeline),
    data.trackingUrl
      ? emailCTAButton('Track Your Shipment', data.trackingUrl)
      : emailCTAButton('View Your Order', orderUrl),
    emailSecondaryButton('View Order Details', orderUrl),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  return emailShell([
    emailHeader('Order Shipped'),
    emailHero({ tone: 'success', title: 'Your order is on the way', subtitle: `Order ${esc(data.orderNumber)} has been dispatched.` }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}

// ── Delivered ─────────────────────────────────────────────────────────

function renderDeliveredHtml(data: OrderStatusEmailData): string {
  const orderUrl = `${BRAND.SITE_URL}/account/orders/${data.orderId}`;
  const timeline: TimelineStep[] = [
    { label: 'Order Placed', state: 'done' },
    { label: 'Order Confirmed', state: 'done' },
    { label: 'Processing & Packing', state: 'done' },
    { label: 'Shipped', state: 'done' },
    { label: 'Delivered', state: 'active' },
  ];

  const body = [
    emailGreeting(data.customerName),
    emailParagraph('Your RFC Store order has been delivered. We hope you love your new gear \u2014 train hard!'),
    emailInfoCard([
      { label: 'Order Number',    value: data.orderNumber, bold: true, large: true },
      { label: 'Status',          value: 'Delivered \u2714' },
      ...(data.deliveredDate ? [{ label: 'Delivered On', value: fmtDate(data.deliveredDate) }] : []),
      ...(data.totalAmount != null ? [{ label: 'Order Total', value: fmtInr(data.totalAmount) }] : []),
    ]),
    emailStatusTimeline(timeline),
    emailParagraph('If you have any concerns about your order, please contact us within <strong>7 days</strong> of delivery.'),
    emailCTAButton('View Your Order', orderUrl),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  return emailShell([
    emailHeader('Delivered'),
    emailHero({ tone: 'success', title: 'Your order has arrived', subtitle: `Order ${esc(data.orderNumber)} has been delivered successfully.` }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}

// ── Cancelled ─────────────────────────────────────────────────────────

function renderCancelledHtml(data: OrderStatusEmailData): string {
  const body = [
    emailGreeting(data.customerName),
    emailParagraph('Your RFC Store order has been cancelled as requested.'),
    emailInfoCard([
      { label: 'Order Number', value: data.orderNumber, bold: true },
      { label: 'Status',       value: 'Cancelled' },
    ]),
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.DANGER_BG};border:1px solid ${BRAND.DANGER_BD};border-radius:6px;margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.DANGER_TX};line-height:1.6;">If you paid online and are expecting a refund, it will be credited back to your original payment method within <strong>5\u20137 business days</strong>. If this cancellation was unexpected, please contact us immediately.</p>
    </td>
  </tr>
</table>`,
    emailCTAButton('Browse Our Store', BRAND.SITE_URL),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  return emailShell([
    emailHeader('Order Cancelled'),
    emailHero({ tone: 'danger', title: 'Your order has been cancelled', subtitle: `Order ${esc(data.orderNumber)} has been cancelled.` }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}

// ── Refund Pending ────────────────────────────────────────────────────

function renderRefundPendingHtml(data: OrderStatusEmailData): string {
  const body = [
    emailGreeting(data.customerName),
    emailParagraph('Your order is currently on hold. Our team is reviewing it and will be in touch with you shortly.'),
    emailInfoCard([
      { label: 'Order Number', value: data.orderNumber, bold: true },
      { label: 'Status',       value: 'On Hold / Pending' },
    ]),
    emailParagraph('If a payment was collected and the order cannot be fulfilled, a full refund will be processed within <strong>5\u20137 business days</strong>.'),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  return emailShell([
    emailHeader('Order On Hold'),
    emailHero({ tone: 'warning', title: 'Your order is on hold', subtitle: `Order ${esc(data.orderNumber)} requires attention.` }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}

// ── Router ────────────────────────────────────────────────────────────

const STATUS_RENDERERS: Record<string, (data: OrderStatusEmailData) => string> = {
  confirmed:      renderConfirmedHtml,
  processing:     renderProcessingHtml,
  shipped:        renderShippedHtml,
  delivered:      renderDeliveredHtml,
  cancelled:      renderCancelledHtml,
  refund_pending: renderRefundPendingHtml,
};

export function renderOrderStatusHtml(data: OrderStatusEmailData): string {
  const renderer = STATUS_RENDERERS[data.newStatus];
  if (renderer) return renderer(data);

  // Safe generic fallback — never raw JSON
  const orderUrl = `${BRAND.SITE_URL}/account/orders/${data.orderId}`;
  const body = [
    emailGreeting(data.customerName),
    emailParagraph(`Your order status has been updated.`),
    emailInfoCard([
      { label: 'Order Number', value: data.orderNumber, bold: true },
      { label: 'New Status',   value: esc(data.newStatus) },
    ]),
    emailCTAButton('View Your Order', orderUrl),
    emailSpacer(8),
    emailSupportSection(),
  ].join('');

  return emailShell([
    emailHeader('Order Update'),
    emailHero({ tone: 'neutral', title: 'Order Status Update', subtitle: `Order ${esc(data.orderNumber)} has been updated.` }),
    emailBodyOpen(), body, emailBodyClose(),
    emailFooter(),
  ].join(''));
}

export function renderOrderStatusText(data: OrderStatusEmailData): string {
  const statusMap: Record<string, string> = {
    confirmed:   'Your RFC Store order has been confirmed.',
    processing:  'Your RFC Store order is being packed.',
    shipped:     `Your RFC Store order has been shipped.${data.trackingNumber ? ` Tracking: ${data.trackingNumber}` : ''}`,
    delivered:   'Your RFC Store order has been delivered.',
    cancelled:   'Your RFC Store order has been cancelled.',
    refund_pending: 'Your RFC Store order is on hold.',
  };
  return `RFC Store \u2014 Order Update

Hi ${data.customerName},

${statusMap[data.newStatus] ?? `Your order status is now: ${data.newStatus}`}

Order: ${data.orderNumber}

Questions? ${BRAND.SUPPORT}`.trim();
}
