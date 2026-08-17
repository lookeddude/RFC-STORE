/**
 * RFC Store — Transactional Email Design System
 *
 * Pure TypeScript functions that return email-safe HTML strings.
 * All styles are inline — no external CSS, no JavaScript, no web fonts required.
 * Compatible with: Gmail, Apple Mail, Outlook 2016+, Android Mail, Yahoo Mail.
 *
 * Brand tokens:
 *   Navy   #0B1C30  — header, headings, primary text
 *   Crimson #E63946 — CTA buttons, accent
 *   Gray   #6B7280  — muted/secondary text
 *   Slate  #374151  — body text
 *   Ice    #F3F4F6  — page background
 *   Cloud  #F9FAFB  — card background
 *   Border #E5E7EB  — dividers, card borders
 *
 * SERVER-ONLY. Never import in client components or pages.
 */

// ── Brand Constants ─────────────────────────────────────────────────

export const BRAND = {
  NAVY:       '#0B1C30',
  NAVY_LIGHT: '#142540',
  CRIMSON:    '#E63946',
  CRIMSON_D:  '#c5303c',
  WHITE:      '#FFFFFF',
  SLATE:      '#374151',
  GRAY:       '#6B7280',
  MUTED:      '#9CA3AF',
  ICE:        '#F3F4F6',
  CLOUD:      '#F9FAFB',
  BORDER:     '#E5E7EB',
  SUCCESS_BG: '#F0FDF4',
  SUCCESS_BD: '#22C55E',
  SUCCESS_TX: '#15803D',
  DANGER_BG:  '#FEF2F2',
  DANGER_BD:  '#FCA5A5',
  DANGER_TX:  '#B91C1C',
  INFO_BG:    '#EFF6FF',
  INFO_BD:    '#93C5FD',
  INFO_TX:    '#1D4ED8',
  WARN_BG:    '#FFFBEB',
  WARN_BD:    '#FCD34D',
  WARN_TX:    '#B45309',
  NAME:       'RFC Store',
  SUPPORT:    'revivefightclub@gmail.com',
  SITE_URL:   process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rfc-store.vercel.app',
} as const;

// ── Security ────────────────────────────────────────────────────────

/**
 * Escapes a string for safe insertion into HTML.
 * Must be applied to ALL dynamic customer/order data.
 */
export function esc(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ── Formatters ──────────────────────────────────────────────────────

export function fmtInr(amount: number): string {
  return '\u20B9' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function fmtDate(date?: Date | string | null): string {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Shell ───────────────────────────────────────────────────────────

/**
 * Full email document wrapper. Wrap all email content with this.
 */
export function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${esc(BRAND.NAME)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.ICE};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.ICE};min-height:100%;">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Header ──────────────────────────────────────────────────────────

/**
 * RFC Store top nav header.
 * @param subtitle  Optional small badge text below the wordmark (e.g. "Order Confirmed")
 */
export function emailHeader(subtitle?: string): string {
  return `
<tr>
  <td style="background-color:${BRAND.NAVY};padding:28px 40px 24px;border-radius:8px 8px 0 0;text-align:center;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:900;color:${BRAND.WHITE};letter-spacing:0.12em;text-transform:uppercase;">RFC STORE</p>
          ${subtitle ? `<p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.55);letter-spacing:0.14em;text-transform:uppercase;">${esc(subtitle)}</p>` : ''}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// ── Hero ────────────────────────────────────────────────────────────

export type HeroTone = 'success' | 'danger' | 'info' | 'warning' | 'neutral';

interface HeroOpts {
  tone: HeroTone;
  title: string;
  subtitle?: string;
}

const TONE_STYLES: Record<HeroTone, { bg: string; border: string; titleColor: string; subtitleColor: string }> = {
  success: { bg: BRAND.SUCCESS_BG, border: BRAND.SUCCESS_BD, titleColor: '#14532D',  subtitleColor: BRAND.SUCCESS_TX },
  danger:  { bg: BRAND.DANGER_BG,  border: BRAND.DANGER_BD,  titleColor: '#7F1D1D',  subtitleColor: BRAND.DANGER_TX },
  info:    { bg: BRAND.INFO_BG,    border: BRAND.INFO_BD,    titleColor: '#1E3A5F',  subtitleColor: BRAND.INFO_TX },
  warning: { bg: BRAND.WARN_BG,    border: BRAND.WARN_BD,    titleColor: '#78350F',  subtitleColor: BRAND.WARN_TX },
  neutral: { bg: BRAND.CLOUD,      border: BRAND.BORDER,     titleColor: BRAND.NAVY, subtitleColor: BRAND.SLATE },
};

/**
 * Context-specific hero section beneath the header.
 */
export function emailHero({ tone, title, subtitle }: HeroOpts): string {
  const s = TONE_STYLES[tone];
  return `
<tr>
  <td style="background-color:${s.bg};border-left:4px solid ${s.border};padding:28px 40px;text-align:left;">
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;color:${s.titleColor};letter-spacing:-0.01em;line-height:1.2;">${esc(title)}</p>
    ${subtitle ? `<p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${s.subtitleColor};line-height:1.5;">${esc(subtitle)}</p>` : ''}
  </td>
</tr>`;
}

// ── Body Wrapper ────────────────────────────────────────────────────

export function emailBodyOpen(): string {
  return `<tr><td style="background-color:${BRAND.WHITE};padding:32px 40px;">`;
}

export function emailBodyClose(): string {
  return `</td></tr>`;
}

// ── Greeting ────────────────────────────────────────────────────────

export function emailGreeting(name: string): string {
  return `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${BRAND.SLATE};line-height:1.6;">Hi <strong>${esc(name)}</strong>,</p>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.SLATE};line-height:1.6;">${text}</p>`;
}

// ── Info Card ───────────────────────────────────────────────────────

export interface InfoRow {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
}

/**
 * A card of key → value rows (order number, date, payment method, etc.)
 */
export function emailInfoCard(rows: InfoRow[]): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid ${BRAND.BORDER};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:${BRAND.GRAY};text-transform:uppercase;letter-spacing:0.06em;width:42%;vertical-align:top;">${esc(r.label)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid ${BRAND.BORDER};font-family:Arial,Helvetica,sans-serif;font-size:${r.large ? '18px' : '14px'};font-weight:${r.bold || r.large ? '700' : '400'};color:${r.large ? BRAND.NAVY : BRAND.SLATE};vertical-align:top;">${esc(r.value)}</td>
    </tr>`).join('');

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.CLOUD};border:1px solid ${BRAND.BORDER};border-radius:6px;margin-bottom:24px;overflow:hidden;">
  ${rowsHtml}
</table>`;
}

// ── Section Label ───────────────────────────────────────────────────

export function emailSectionLabel(text: string): string {
  return `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${BRAND.GRAY};text-transform:uppercase;letter-spacing:0.1em;">${esc(text)}</p>`;
}

// ── Order Items Table ────────────────────────────────────────────────

export interface OrderItemRow {
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
}

export function emailOrderItems(items: OrderItemRow[]): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BRAND.BORDER};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.SLATE};line-height:1.4;vertical-align:top;">
        <span style="font-weight:600;color:${BRAND.NAVY};">${esc(item.productName)}</span>
        ${item.variantName ? `<br><span style="font-size:12px;color:${BRAND.GRAY};">${esc(item.variantName)}</span>` : ''}
        <span style="font-size:12px;color:${BRAND.GRAY};"> &times; ${item.quantity}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${BRAND.BORDER};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.NAVY};text-align:right;vertical-align:top;white-space:nowrap;">${fmtInr(item.unitPrice * item.quantity)}</td>
    </tr>`).join('');

  return `
${emailSectionLabel('Items Ordered')}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr>
    <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid ${BRAND.NAVY};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${BRAND.NAVY};text-transform:uppercase;letter-spacing:0.08em;">Product</th>
    <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid ${BRAND.NAVY};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${BRAND.NAVY};text-transform:uppercase;letter-spacing:0.08em;">Amount</th>
  </tr>
  ${rows}
</table>`;
}

// ── Price Summary ───────────────────────────────────────────────────

export interface PriceLine {
  label: string;
  value: number;
  muted?: boolean;
  total?: boolean;
}

export function emailPriceSummary(lines: PriceLine[]): string {
  const rows = lines.map(l => `
    <tr>
      <td style="padding:${l.total ? '14px 0 0' : '6px 0'};font-family:Arial,Helvetica,sans-serif;font-size:${l.total ? '16px' : '14px'};font-weight:${l.total ? '900' : '400'};color:${l.total ? BRAND.NAVY : (l.muted ? BRAND.GRAY : BRAND.SLATE)};${l.total ? 'border-top:2px solid ' + BRAND.BORDER + ';' : ''}">${esc(l.label)}</td>
      <td style="padding:${l.total ? '14px 0 0' : '6px 0'};font-family:Arial,Helvetica,sans-serif;font-size:${l.total ? '18px' : '14px'};font-weight:${l.total ? '900' : '400'};color:${l.total ? BRAND.NAVY : (l.muted ? BRAND.GRAY : BRAND.SLATE)};text-align:right;white-space:nowrap;${l.total ? 'border-top:2px solid ' + BRAND.BORDER + ';' : ''}">${fmtInr(l.value)}</td>
    </tr>`).join('');

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
  ${rows}
</table>`;
}

// ── COD Notice ──────────────────────────────────────────────────────

export function emailCodNotice(amount: number): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.SUCCESS_BG};border:1px solid ${BRAND.SUCCESS_BD};border-radius:6px;margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${BRAND.SUCCESS_TX};text-transform:uppercase;letter-spacing:0.06em;">Cash on Delivery</p>
      <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.SUCCESS_TX};line-height:1.5;">Please keep <strong>${fmtInr(amount)}</strong> ready when your order arrives. Our delivery partner will collect payment on delivery.</p>
    </td>
  </tr>
</table>`;
}

// ── Address Block ───────────────────────────────────────────────────

export interface AddressData {
  fullName?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string | null;
  phone?: string | null;
}

export function emailAddressBlock(addr: AddressData): string {
  const parts = [
    addr.line1,
    addr.line2,
    `${addr.city}, ${addr.state} ${addr.postalCode}`,
    addr.country && addr.country !== 'IN' ? addr.country : null,
  ].filter(Boolean).map(p => esc(p!));

  return `
${emailSectionLabel('Delivering To')}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.CLOUD};border:1px solid ${BRAND.BORDER};border-radius:6px;margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      ${addr.fullName ? `<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.NAVY};">${esc(addr.fullName)}</p>` : ''}
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.SLATE};line-height:1.7;">${parts.join('<br>')}</p>
      ${addr.phone ? `<p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.GRAY};">${esc(addr.phone)}</p>` : ''}
    </td>
  </tr>
</table>`;
}

// ── Tracking Card ───────────────────────────────────────────────────

interface TrackingCardOpts {
  courier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
}

export function emailTrackingCard({ courier, trackingNumber, trackingUrl, estimatedDelivery }: TrackingCardOpts): string {
  if (!trackingNumber && !estimatedDelivery) return '';
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.INFO_BG};border:1px solid ${BRAND.INFO_BD};border-radius:6px;margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${BRAND.INFO_TX};text-transform:uppercase;letter-spacing:0.1em;">Shipment Details</p>
      ${courier ? `<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.INFO_TX};">Courier: <strong>${esc(courier)}</strong></p>` : ''}
      ${trackingNumber ? `<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.INFO_TX};">Tracking: <strong>${esc(trackingNumber)}</strong></p>` : ''}
      ${estimatedDelivery ? `<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.INFO_TX};">Est. Delivery: <strong>${esc(estimatedDelivery)}</strong></p>` : ''}
      ${trackingUrl ? `<p style="margin:8px 0 0;"><a href="${trackingUrl}" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.INFO_TX};font-weight:700;">Track Shipment &rarr;</a></p>` : ''}
    </td>
  </tr>
</table>`;
}

// ── Status Timeline ─────────────────────────────────────────────────

export interface TimelineStep {
  label: string;
  state: 'done' | 'active' | 'pending';
}

export function emailStatusTimeline(steps: TimelineStep[]): string {
  const rows = steps.map((step, i) => {
    const isLast = i === steps.length - 1;
    const dotColor = step.state === 'done' ? BRAND.SUCCESS_TX : step.state === 'active' ? BRAND.CRIMSON : BRAND.BORDER;
    const dotFill  = step.state === 'done' ? BRAND.SUCCESS_TX : step.state === 'active' ? BRAND.CRIMSON : BRAND.WHITE;
    const txtColor = step.state === 'pending' ? BRAND.MUTED : BRAND.SLATE;
    const weight   = step.state === 'active' ? '700' : '400';
    return `
    <tr>
      <td width="20" style="vertical-align:top;text-align:center;padding-bottom:${isLast ? '0' : '0'};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr><td>
            <div style="width:14px;height:14px;border-radius:50%;background-color:${dotFill};border:2px solid ${dotColor};margin:2px auto 0;"></div>
          </td></tr>
          ${!isLast ? `<tr><td style="text-align:center;"><div style="width:2px;height:20px;background-color:${BRAND.BORDER};margin:0 auto;"></div></td></tr>` : ''}
        </table>
      </td>
      <td style="padding-bottom:${isLast ? '0' : '20px'};padding-left:12px;vertical-align:top;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:${weight};color:${txtColor};line-height:1.6;">${esc(step.label)}</p>
      </td>
    </tr>`;
  }).join('');

  return `
${emailSectionLabel('Order Progress')}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
  ${rows}
</table>`;
}

// ── CTA Buttons ─────────────────────────────────────────────────────

export function emailCTAButton(label: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr>
    <td align="center">
      <a href="${url}" style="display:inline-block;background-color:${BRAND.CRIMSON};color:${BRAND.WHITE};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em;padding:14px 36px;border-radius:4px;mso-padding-alt:14px 36px;">${esc(label)}</a>
    </td>
  </tr>
</table>`;
}

export function emailSecondaryButton(label: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr>
    <td align="center">
      <a href="${url}" style="display:inline-block;background-color:transparent;color:${BRAND.NAVY};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.04em;padding:12px 32px;border-radius:4px;border:2px solid ${BRAND.NAVY};">${esc(label)}</a>
    </td>
  </tr>
</table>`;
}

// ── Divider ─────────────────────────────────────────────────────────

export function emailDivider(): string {
  return `<tr><td style="padding:0;height:1px;background-color:${BRAND.BORDER};font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

export function emailSpacer(px = 20): string {
  return `<p style="margin:0;padding:${px}px 0;font-size:0;line-height:0;">&nbsp;</p>`;
}

// ── Payment Badge ───────────────────────────────────────────────────

export function emailPaymentBadge(method: string): string {
  const label = method === 'cod'
    ? 'Cash on Delivery'
    : method === 'razorpay'
    ? 'Online Payment'
    : esc(method);
  return `<span style="display:inline-block;padding:3px 10px;background-color:${BRAND.CLOUD};border:1px solid ${BRAND.BORDER};border-radius:99px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:${BRAND.SLATE};">${label}</span>`;
}

// ── Support Section ─────────────────────────────────────────────────

export function emailSupportSection(): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;">
  <tr>
    <td style="padding:20px;background-color:${BRAND.CLOUD};border:1px solid ${BRAND.BORDER};border-radius:6px;text-align:center;">
      <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${BRAND.SLATE};">Need help?</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.GRAY};line-height:1.5;">Reply to this email or contact us at <a href="mailto:${BRAND.SUPPORT}" style="color:${BRAND.CRIMSON};text-decoration:none;font-weight:600;">${BRAND.SUPPORT}</a></p>
    </td>
  </tr>
</table>`;
}

// ── Footer ──────────────────────────────────────────────────────────

export function emailFooter(): string {
  return `
<tr>
  <td style="background-color:${BRAND.CLOUD};padding:24px 40px 28px;border-top:1px solid ${BRAND.BORDER};border-radius:0 0 8px 8px;text-align:center;">
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:900;color:${BRAND.NAVY};letter-spacing:0.1em;text-transform:uppercase;">RFC STORE</p>
    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.MUTED};line-height:1.6;">
      <a href="mailto:${BRAND.SUPPORT}" style="color:${BRAND.GRAY};text-decoration:none;">${BRAND.SUPPORT}</a>
      &nbsp;&bull;&nbsp;
      <a href="${BRAND.SITE_URL}" style="color:${BRAND.GRAY};text-decoration:none;">${BRAND.SITE_URL.replace('https://', '')}</a>
    </p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${BRAND.MUTED};">&copy; ${new Date().getFullYear()} RFC Store. All rights reserved.</p>
    <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${BRAND.MUTED};">
      <a href="${BRAND.SITE_URL}/privacy-policy" style="color:${BRAND.MUTED};text-decoration:none;">Privacy Policy</a>
      &nbsp;&bull;&nbsp;
      <a href="${BRAND.SITE_URL}/terms" style="color:${BRAND.MUTED};text-decoration:none;">Terms &amp; Conditions</a>
    </p>
  </td>
</tr>`;
}
