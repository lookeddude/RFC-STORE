/**
 * RFC Store — Invoice PDF Generator
 * 
 * Uses pdf-lib for server-side PDF generation.
 * No React dependency — works with Next.js 16 + React 19.
 * 
 * Data source: orders + order_items DB snapshots ONLY.
 * NEVER uses live product data.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createAdminClient } from '@/lib/supabase/admin';
import { getOrCreateInvoice } from './numbering';
import type { InvoiceData, InvoiceItem, InvoiceAddress } from './types';

const STORE_CONFIG = {
  businessName:    'Revive Fight Club',
  businessEmail:   process.env.BREVO_FROM_EMAIL    ?? 'orders@revivefightclub.com',
  businessPhone:   process.env.STORE_PHONE         ?? '[Set STORE_PHONE in env]',
  businessAddress: process.env.STORE_ADDRESS       ?? '[Set STORE_ADDRESS in env]',
  gstNumber:       process.env.STORE_GST_NUMBER    ?? null,
} as const;

/**
 * Builds the PDF for an order and returns the Buffer.
 * Authorization (ownership check) must be done by the caller.
 */
export async function buildInvoicePdf(orderId: string): Promise<Buffer> {
  const admin = createAdminClient();

  // Fetch order snapshot
  const { data: rawOrder } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();

  if (!rawOrder) throw new Error('Order not found');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = rawOrder as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (order.order_items ?? []) as any[];
  const addr = order.shipping_address as Record<string, string>;

  const invoiceItems: InvoiceItem[] = items.map((item) => ({
    productName: item.product_name_snapshot,
    variantName: item.variant_name_snapshot ?? null,
    sku: item.sku_snapshot ?? null,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price_snapshot),
    lineTotal: Number(item.line_total),
  }));

  const address: InvoiceAddress = {
    fullName: addr.fullName ?? addr.full_name ?? '',
    phone: order.customer_phone ?? '',
    line1: addr.line1 ?? '',
    line2: addr.line2 ?? null,
    city: addr.city ?? '',
    state: addr.state ?? '',
    postalCode: addr.postalCode ?? addr.postal_code ?? '',
    country: addr.country ?? 'India',
  };

  const invoiceData: InvoiceData = {
    invoiceNumber: '',  // will be set by getOrCreateInvoice
    orderNumber: order.order_number,
    invoiceDate: new Date().toISOString(),
    orderDate: order.created_at,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    address,
    items: invoiceItems,
    subtotal: Number(order.subtotal),
    shippingAmount: Number(order.shipping_amount),
    taxAmount: Number(order.tax_amount),
    taxRate: Number(order.tax_rate ?? 0),
    cgstAmount: Number(order.cgst_amount ?? 0),
    sgstAmount: Number(order.sgst_amount ?? 0),
    igstAmount: Number(order.igst_amount ?? 0),
    discountAmount: Number(order.discount_amount),
    codFee: Number(order.cod_fee),
    totalAmount: Number(order.total_amount),
    currency: order.currency ?? 'INR',
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    razorpayPaymentId: order.razorpay_payment_id ?? null,
    businessName: STORE_CONFIG.businessName,
    businessEmail: STORE_CONFIG.businessEmail,
    businessPhone: STORE_CONFIG.businessPhone,
    businessAddress: STORE_CONFIG.businessAddress,
  };

  // Get or create invoice record (idempotent)
  const record = await getOrCreateInvoice(orderId, invoiceData);
  
  // Use the stored snapshot (immutable historical accuracy)
  const data = {
    ...record.invoiceData,
    invoiceNumber: record.invoiceNumber,
    invoiceDate: record.issuedAt,
  };

  return generatePdf(data);
}

/**
 * Generates the PDF from an InvoiceData snapshot.
 * Pure function — no DB calls.
 */
async function generatePdf(data: InvoiceData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const accent = rgb(0.902, 0.224, 0.275);  // #E63946
  const dark   = rgb(0.051, 0.106, 0.165);  // #0D1B2A
  const gray   = rgb(0.427, 0.447, 0.490);  // #6D7279
  const light  = rgb(0.949, 0.949, 0.949);  // #F2F2F2
  const white  = rgb(1, 1, 1);

  let y = height - 40;
  const margin = 50;
  const colRight = width - margin;

  // ── Header bar ───────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: dark });

  page.drawText(data.businessName.toUpperCase(), {
    x: margin, y: height - 52,
    size: 18, font: boldFont, color: white,
  });

  page.drawText('INVOICE', {
    x: colRight - 70, y: height - 52,
    size: 20, font: boldFont, color: accent,
  });

  y = height - 100;

  // ── Invoice meta ─────────────────────────────────────────
  const drawLabelValue = (label: string, value: string, x: number, yPos: number) => {
    page.drawText(label, { x, y: yPos, size: 8, font: boldFont, color: gray });
    page.drawText(value, { x, y: yPos - 14, size: 10, font: regularFont, color: dark });
  };

  drawLabelValue('INVOICE NO', data.invoiceNumber, margin, y);
  drawLabelValue('ORDER NO', data.orderNumber, margin + 150, y);
  drawLabelValue('DATE', new Date(data.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), margin + 300, y);

  y -= 50;

  // ── Divider ───────────────────────────────────────────────
  page.drawRectangle({ x: margin, y, width: colRight - margin, height: 1, color: light });
  y -= 20;

  // ── Billed To / Shipped To ────────────────────────────────
  const addr = data.address;
  const addrLines = [
    addr.fullName,
    addr.line1,
    addr.line2 ?? '',
    `${addr.city}, ${addr.state} ${addr.postalCode}`,
    addr.country,
    addr.phone,
  ].filter(Boolean);

  page.drawText('SHIPPING & BILLING ADDRESS', { x: margin, y, size: 8, font: boldFont, color: gray });
  y -= 14;
  for (const line of addrLines) {
    page.drawText(line, { x: margin, y, size: 10, font: regularFont, color: dark });
    y -= 14;
  }

  // ── Business info (right side) ────────────────────────────
  const bizY = height - 128;
  page.drawText('FROM', { x: colRight - 180, y: bizY, size: 8, font: boldFont, color: gray });
  const bizLines = [
    data.businessName,
    data.businessEmail,
    data.businessPhone,
    data.businessAddress,
  ];
  let bizRowY = bizY - 14;
  for (const line of bizLines) {
    if (line) {
      page.drawText(line, { x: colRight - 180, y: bizRowY, size: 9, font: regularFont, color: dark });
      bizRowY -= 12;
    }
  }

  y -= 20;
  page.drawRectangle({ x: margin, y, width: colRight - margin, height: 1, color: light });
  y -= 10;

  // ── Items table header ────────────────────────────────────
  const tableTop = y;
  page.drawRectangle({ x: margin, y: tableTop - 24, width: colRight - margin, height: 24, color: dark });
  y = tableTop - 8;

  const col = {
    item: margin + 5,
    sku: margin + 230,
    qty: margin + 310,
    price: margin + 370,
    total: colRight - 5,
  };

  page.drawText('ITEM', { x: col.item, y, size: 8, font: boldFont, color: white });
  page.drawText('SKU', { x: col.sku, y, size: 8, font: boldFont, color: white });
  page.drawText('QTY', { x: col.qty, y, size: 8, font: boldFont, color: white });
  page.drawText('UNIT PRICE', { x: col.price, y, size: 8, font: boldFont, color: white });
  page.drawText('TOTAL', { x: col.total - 30, y, size: 8, font: boldFont, color: white });

  y -= 22;

  // ── Items ─────────────────────────────────────────────────
  for (const item of data.items) {
    const name = item.variantName ? `${item.productName} — ${item.variantName}` : item.productName;
    // Truncate long names
    const displayName = name.length > 35 ? name.substring(0, 32) + '...' : name;

    page.drawText(displayName, { x: col.item, y, size: 9, font: regularFont, color: dark });
    page.drawText(item.sku ?? '—', { x: col.sku, y, size: 9, font: regularFont, color: gray });
    page.drawText(String(item.quantity), { x: col.qty, y, size: 9, font: regularFont, color: dark });
    page.drawText(fmt(item.unitPrice), { x: col.price, y, size: 9, font: regularFont, color: dark });
    page.drawText(fmt(item.lineTotal), { x: col.total - boldFont.widthOfTextAtSize(fmt(item.lineTotal), 9), y, size: 9, font: boldFont, color: dark });

    y -= 18;
    page.drawRectangle({ x: margin, y: y + 1, width: colRight - margin, height: 0.5, color: light });
    y -= 4;
  }

  y -= 10;

  // ── Totals ────────────────────────────────────────────────
  const totalsX = colRight - 200;
  const valX = colRight - 5;

  const drawTotal = (label: string, value: string, bold = false, isAccent = false) => {
    const f = bold ? boldFont : regularFont;
    const c = isAccent ? accent : (bold ? dark : gray);
    page.drawText(label, { x: totalsX, y, size: 9, font: f, color: c });
    page.drawText(value, { x: valX - f.widthOfTextAtSize(value, 9), y, size: 9, font: f, color: c });
    y -= 16;
  };

  drawTotal('Subtotal', fmt(data.subtotal));
  if (data.shippingAmount > 0) drawTotal('Shipping', fmt(data.shippingAmount));
  if (data.codFee > 0) drawTotal('COD Handling Fee', fmt(data.codFee));
  if (data.discountAmount > 0) drawTotal('Discount', `-${fmt(data.discountAmount)}`);
  if (data.taxAmount > 0) {
    drawTotal(`GST (${(data.taxRate * 100).toFixed(0)}%)`, fmt(data.taxAmount));
  } else {
    drawTotal('GST', '₹0.00 (pending registration)');
  }

  // Total line
  y -= 4;
  page.drawRectangle({ x: totalsX - 10, y, width: colRight - totalsX + 10, height: 1, color: dark });
  y -= 14;
  drawTotal('TOTAL', fmt(data.totalAmount), true, true);

  // ── Payment Info ──────────────────────────────────────────
  y -= 20;
  page.drawRectangle({ x: margin, y: y - 46, width: colRight - margin, height: 56, color: rgb(0.976, 0.976, 0.976) });

  page.drawText('PAYMENT INFORMATION', { x: margin + 10, y: y - 10, size: 8, font: boldFont, color: gray });
  page.drawText(
    `Method: ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}`,
    { x: margin + 10, y: y - 24, size: 9, font: regularFont, color: dark }
  );
  page.drawText(
    `Status: ${data.paymentStatus === 'paid' ? 'Paid' : data.paymentStatus === 'pending' ? 'Pending' : data.paymentStatus}`,
    { x: margin + 10, y: y - 38, size: 9, font: regularFont, color: data.paymentStatus === 'paid' ? rgb(0.086, 0.502, 0.235) : dark }
  );
  if (data.razorpayPaymentId) {
    page.drawText(`Transaction ID: ${data.razorpayPaymentId}`, { x: margin + 200, y: y - 24, size: 9, font: regularFont, color: dark });
  }

  // ── Footer ────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 40, color: dark });
  page.drawText(
    `${data.businessName} · ${data.businessEmail} · This is a computer-generated invoice.`,
    { x: margin, y: 14, size: 8, font: regularFont, color: gray }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function fmt(n: number): string {
  // pdf-lib StandardFonts.Helvetica uses WinAnsiEncoding — does not support
  // the Indian Rupee sign (U+20B9). Use 'Rs.' as a safe ASCII alternative.
  return 'Rs. ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
