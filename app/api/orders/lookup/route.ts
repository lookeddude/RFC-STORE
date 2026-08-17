/**
 * RFC Store — Guest Order Lookup API
 *
 * POST /api/orders/lookup
 * Body: { email: string, orderNumber: string }
 *
 * Security:
 *   - Requires BOTH email AND order number (two independent factors)
 *   - Uses admin client — server-only, never exposed to browser
 *   - Does NOT filter by user_id — works for claimed AND unclaimed guest orders
 *   - Returns sanitized order data — never returns raw user_id or internal IDs
 *   - Rate-limit: basic per-IP guard (3 failures per minute per IP)
 *   - Input validated and length-capped before any DB call
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ── Simple in-memory rate limiter (resets on cold-start / redeploy) ──
const FAIL_WINDOW_MS  = 60_000;   // 1 minute
const MAX_FAILS       = 10;        // per IP per minute
const failMap         = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now   = Date.now();
  const entry = failMap.get(ip);
  if (!entry || now > entry.resetAt) {
    failMap.set(ip, { count: 0, resetAt: now + FAIL_WINDOW_MS });
    return true;  // allowed
  }
  return entry.count < MAX_FAILS;
}

function recordFailure(ip: string): void {
  const now   = Date.now();
  const entry = failMap.get(ip);
  if (!entry || now > entry.resetAt) {
    failMap.set(ip, { count: 1, resetAt: now + FAIL_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

// ── Order number format validation ───────────────────────────────────
const ORDER_NUMBER_RX = /^RFC-\d{8}-\d+$/;
const EMAIL_RX        = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { email, orderNumber } = body as Record<string, unknown>;

  // Validate inputs
  if (
    typeof email !== 'string' ||
    typeof orderNumber !== 'string' ||
    email.length > 254 ||
    orderNumber.length > 30
  ) {
    return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
  }

  const normalizedEmail       = email.trim().toLowerCase();
  const normalizedOrderNumber = orderNumber.trim().toUpperCase();

  if (!EMAIL_RX.test(normalizedEmail)) {
    recordFailure(ip);
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 422 },
    );
  }

  if (!ORDER_NUMBER_RX.test(normalizedOrderNumber)) {
    recordFailure(ip);
    return NextResponse.json(
      { error: 'Order number format is invalid. It should look like RFC-20260818-123456.' },
      { status: 422 },
    );
  }

  // Query via admin client
  const admin = createAdminClient();

  const { data: rawOrder, error } = await admin
    .from('orders')
    .select(`
      id, order_number, status, payment_status, payment_method,
      customer_name, customer_email,
      shipping_address,
      subtotal, shipping_amount, tax_amount, discount_amount, cod_fee, total_amount, currency,
      created_at, razorpay_payment_id,
      tracking_number, tracking_courier,
      order_items (
        id, product_name_snapshot, variant_name_snapshot,
        sku_snapshot, unit_price_snapshot, quantity, line_total
      )
    `)
    .eq('order_number', normalizedOrderNumber)
    .eq('customer_email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('[RFC Order Lookup] DB error:', error.message);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }

  if (!rawOrder) {
    recordFailure(ip);
    // Deliberate vagueness: don't reveal whether email or order number is wrong
    return NextResponse.json(
      { error: 'No order found with that email and order number. Please double-check and try again.' },
      { status: 404 },
    );
  }

  // Sanitize — strip internal IDs + email (customer already knows their email)
  const { customer_email: _ce, ...safeOrder } = rawOrder as Record<string, unknown>;
  void _ce;

  return NextResponse.json({ order: safeOrder }, { status: 200 });
}
