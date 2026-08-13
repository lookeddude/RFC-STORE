/**
 * RFC Store — Order Confirmation Email Template
 * Sent to customer when COD order is placed.
 */

interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  codFee?: number;
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

export function getOrderConfirmationSubject(orderNumber: string): string {
  return `Order Confirmed — ${orderNumber} | Revive Fight Club`;
}

export function renderOrderConfirmationHtml(data: OrderConfirmationData): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #e5e7eb; font-family:Arial,sans-serif; font-size:14px; color:#374151;">
        ${item.productName}${item.variantName ? ` — ${item.variantName}` : ''}
        <span style="color:#6b7280;"> × ${item.quantity}</span>
      </td>
      <td style="padding:10px 0; border-bottom:1px solid #e5e7eb; text-align:right; font-family:Arial,sans-serif; font-size:14px; font-weight:700; color:#111827;">
        ₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const addr = data.shippingAddress;
  const addrHtml = [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode]
    .filter(Boolean).join(', ');

  const isCod = data.paymentMethod === 'cod';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#0B1C30;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.1em;">REVIVE FIGHT CLUB</p>
          <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.08em;">Order Confirmed</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hi <strong>${data.customerName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;color:#374151;">Your order has been placed successfully. Here are your order details:</p>

          <!-- Order Number -->
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Order Number</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#0B1C30;letter-spacing:0.02em;">${data.orderNumber}</p>
          </div>

          <!-- Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><th style="text-align:left;padding-bottom:10px;border-bottom:2px solid #0B1C30;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#0B1C30;">Item</th>
            <th style="text-align:right;padding-bottom:10px;border-bottom:2px solid #0B1C30;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#0B1C30;">Amount</th></tr>
            ${itemsHtml}
            ${data.codFee ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">COD Handling Fee</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;font-weight:700;color:#374151;">₹${data.codFee}</td></tr>` : ''}
            <tr><td style="padding:16px 0 0;font-size:16px;font-weight:900;color:#0B1C30;">Total</td>
            <td style="padding:16px 0 0;text-align:right;font-size:18px;font-weight:900;color:#0B1C30;">₹${data.totalAmount.toLocaleString('en-IN')}</td></tr>
          </table>

          <!-- Payment Method -->
          ${isCod ? `
          <div style="background:#f0fdf4;border:1px solid #22c55e;border-radius:6px;padding:14px 16px;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;">💵 Cash on Delivery</p>
            <p style="margin:6px 0 0;font-size:14px;color:#166534;">Keep <strong>₹${data.totalAmount.toLocaleString('en-IN')}</strong> ready when your order arrives. Our delivery partner will collect payment.</p>
          </div>` : ''}

          <!-- Shipping Address -->
          <div style="margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Delivering To</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${addrHtml}</p>
          </div>

          <p style="font-size:14px;color:#6b7280;line-height:1.6;">Estimated delivery: <strong>5–7 business days</strong>. You'll receive another email with tracking details once dispatched.</p>
          <p style="font-size:14px;color:#6b7280;">Questions? Reply to this email or contact <a href="mailto:revivefightclub@gmail.com" style="color:#E63946;">revivefightclub@gmail.com</a></p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 Revive Fight Club. All rights reserved.</p>
          <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">revivefightclub@gmail.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function renderOrderConfirmationText(data: OrderConfirmationData): string {
  return `
Revive Fight Club — Order Confirmed

Hi ${data.customerName},

Your order ${data.orderNumber} has been placed!

Total: ₹${data.totalAmount.toLocaleString('en-IN')}
Payment: ${data.paymentMethod === 'cod' ? 'Cash on Delivery (pay when delivered)' : data.paymentMethod}

Delivery in 5–7 business days.

Questions? revivefightclub@gmail.com
  `.trim();
}
