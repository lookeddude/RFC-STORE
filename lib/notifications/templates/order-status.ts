/**
 * RFC Store — Order Status Update Email Template
 */

interface OrderStatusData {
  orderNumber: string;
  customerName: string;
  newStatus: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

const STATUS_MESSAGES: Record<string, { subject: string; heading: string; body: string; emoji: string }> = {
  confirmed: {
    emoji: '✅',
    subject: 'Order Confirmed',
    heading: 'Your order is confirmed!',
    body: 'We have confirmed your order and it is being prepared for dispatch.',
  },
  processing: {
    emoji: '📦',
    subject: 'Order Being Processed',
    heading: 'We are packing your order!',
    body: 'Your order is currently being processed and packed. It will be dispatched soon.',
  },
  shipped: {
    emoji: '🚚',
    subject: 'Order Dispatched!',
    heading: 'Your order is on its way!',
    body: 'Your order has been dispatched and is on its way to you. Expected delivery in 2–4 business days.',
  },
  delivered: {
    emoji: '🎉',
    subject: 'Order Delivered',
    heading: 'Order delivered!',
    body: 'Your order has been delivered. We hope you love your gear! If you have any issues, please contact us within 7 days.',
  },
  cancelled: {
    emoji: '❌',
    subject: 'Order Cancelled',
    heading: 'Order cancelled',
    body: 'Your order has been cancelled. If this was unexpected or you paid in advance, please contact us immediately.',
  },
};

export function getOrderStatusSubject(orderNumber: string, status: string): string {
  const msg = STATUS_MESSAGES[status];
  return `${msg?.subject ?? `Order ${status}`} — ${orderNumber} | Revive Fight Club`;
}

export function renderOrderStatusHtml(data: OrderStatusData): string {
  const msg = STATUS_MESSAGES[data.newStatus] ?? {
    emoji: '📋', subject: `Order ${data.newStatus}`, heading: `Order Update`, body: `Your order status has been updated to: ${data.newStatus}.`
  };

  const trackingHtml = data.trackingNumber ? `
    <div style="background:#dbeafe;border:1px solid #93c5fd;border-radius:6px;padding:14px 16px;margin:20px 0;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;">Tracking Info</p>
      <p style="margin:6px 0 0;font-size:14px;color:#1d4ed8;">Tracking Number: <strong>${data.trackingNumber}</strong></p>
      ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="color:#1d4ed8;font-size:14px;">Track your order →</a>` : ''}
    </div>` : '';

  return `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#0B1C30;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">REVIVE FIGHT CLUB</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:36px;margin:0 0 16px;">${msg.emoji}</p>
          <h1 style="margin:0 0 12px;font-size:20px;color:#0B1C30;">${msg.heading}</h1>
          <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hi <strong>${data.customerName}</strong>,</p>
          <p style="font-size:15px;color:#374151;">${msg.body}</p>
          <p style="font-size:14px;color:#6b7280;">Order: <strong>${data.orderNumber}</strong></p>
          ${trackingHtml}
          <p style="font-size:14px;color:#6b7280;">Questions? <a href="mailto:revivefightclub@gmail.com" style="color:#E63946;">revivefightclub@gmail.com</a></p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 Revive Fight Club</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
