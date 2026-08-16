/**
 * RFC Store — Razorpay Webhook Handler
 *
 * POST /api/webhooks/razorpay
 *
 * Security:
 *   - Raw body MUST be read before JSON parsing (HMAC requires exact bytes)
 *   - RAZORPAY_WEBHOOK_SECRET used for verification (never exposed to client)
 *   - Idempotent: webhook_events table prevents double-processing
 *   - Always returns 200 to Razorpay (prevents retries on app errors)
 *
 * Supported events:
 *   payment.captured — confirm payment + deduct inventory
 *   payment.failed   — mark order failed
 *   order.paid       — backup for payment.captured
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/payment/razorpay-verify';
import {
  notifyPaymentConfirmed,
  notifyPaymentFailed,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Step 1: Read raw body (MUST be before JSON parse for HMAC) ──
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  // ── Step 2: Verify webhook signature ─────────────────────────────
  if (!verifyWebhookSignature(rawBody, signature)) {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    console.warn('[Webhook] Invalid Razorpay webhook signature — possible forgery attempt', { ip });
    // Return 200 to prevent Razorpay from flagging this as a service error
    // The invalid request is just ignored
    return NextResponse.json({ status: 'ignored', reason: 'invalid_signature' }, { status: 200 });
  }

  // ── Step 3: Parse payload ─────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: 'ignored', reason: 'invalid_json' }, { status: 200 });
  }

  const eventId = payload.id as string;
  const eventType = payload.event as string;

  if (!eventId || !eventType) {
    return NextResponse.json({ status: 'ignored', reason: 'missing_event_id' }, { status: 200 });
  }

  const admin = createAdminClient();

  // ── Step 4: Idempotency check ─────────────────────────────────────
  const { data: existing } = await admin
    .from('webhook_events')
    .select('id')
    .eq('provider', 'razorpay')
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing) {
    // Already processed
    return NextResponse.json({ status: 'duplicate', event_id: eventId }, { status: 200 });
  }

  // Record the event BEFORE processing (prevents race if two webhooks arrive simultaneously)
  const { error: insertError } = await admin.from('webhook_events').insert({
    provider: 'razorpay',
    event_id: eventId,
    event_type: eventType,
    payload: payload as unknown as import('@/types/database').Json,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      // Unique violation — another request inserted simultaneously
      return NextResponse.json({ status: 'duplicate', event_id: eventId }, { status: 200 });
    }
    console.error('[Webhook] Failed to record webhook event:', insertError);
    // Still return 200 to prevent Razorpay retry storm
    return NextResponse.json({ status: 'error', reason: 'db_error' }, { status: 200 });
  }

  // ── Step 5: Route to handler ──────────────────────────────────────
  try {
    switch (eventType) {
      case 'payment.captured':
      case 'order.paid':
        await handlePaymentCaptured(payload, admin);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload, admin);
        break;

      default:
        // Unknown event — log and ignore (always 200)
        console.info('[Webhook] Unhandled event type:', eventType);
    }
  } catch (err) {
    // Processing error — still return 200 (event is recorded; manual retry possible)
    console.error('[Webhook] Error processing event:', eventType, err);
  }

  return NextResponse.json({ status: 'ok', event: eventType }, { status: 200 });
}

// ── payment.captured handler ─────────────────────────────────────────

async function handlePaymentCaptured(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any
): Promise<void> {
  const paymentEntity = payload?.payload?.payment?.entity;
  if (!paymentEntity) {
    console.warn('[Webhook] payment.captured: missing payment entity');
    return;
  }

  const rzpOrderId: string = paymentEntity.order_id;
  const rzpPaymentId: string = paymentEntity.id;
  const amountPaise: number = paymentEntity.amount;
  const currency: string = paymentEntity.currency;

  if (!rzpOrderId || !rzpPaymentId) {
    console.warn('[Webhook] payment.captured: missing order_id or payment_id');
    return;
  }

  // Find RFC order by Razorpay order ID
  const { data: order } = await admin
    .from('orders')
    .select('id, status, payment_status, total_amount, order_number, customer_name, customer_email, customer_phone')
    .eq('razorpay_order_id', rzpOrderId)
    .maybeSingle();

  if (!order) {
    console.warn('[Webhook] payment.captured: no RFC order found for rzp_order_id:', rzpOrderId);
    return;
  }

  // Confirm payment atomically
  const { data: confirmResult, error: confirmError } = await admin.rpc('confirm_razorpay_payment', {
    p_order_id: order.id,
    p_razorpay_payment_id: rzpPaymentId,
    p_razorpay_signature: '', // Webhook doesn't have payment signature (different from checkout callback)
    p_payment_amount: amountPaise / 100,
  });

  if (confirmError) {
    console.error('[Webhook] confirm_razorpay_payment error:', confirmError);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = confirmResult as any;

  if (!result?.success) {
    if (result?.error === 'INSUFFICIENT_INVENTORY') {
      // Initiate refund
      const { createRazorpayRefund } = await import('@/lib/payment/razorpay-service');
      const { notifyRefundInitiated } = await import('@/lib/notifications');

      try {
        const refundAmount = amountPaise / 100;
        await admin.from('refunds').insert({
          order_id: order.id,
          razorpay_payment_id: rzpPaymentId,
          amount: refundAmount,
          reason: 'inventory_unavailable',
          status: 'pending',
        }).onConflict('razorpay_payment_id, reason').ignore();

        const refund = await createRazorpayRefund(rzpPaymentId, {
          amount: amountPaise,
          receipt: `${order.order_number}-oversell`,
        });

        await admin.from('refunds').update({
          status: 'initiated',
          razorpay_refund_id: refund.id,
          initiated_at: new Date().toISOString(),
          attempt_count: 1,
        }).eq('razorpay_payment_id', rzpPaymentId);

        void notifyRefundInitiated({
          orderNumber: order.order_number,
          orderId: order.id,
          razorpayPaymentId: rzpPaymentId,
          amount: refundAmount,
        });
      } catch (refundErr) {
        console.error('[Webhook] Oversell refund failed:', refundErr);
        await admin.from('orders').update({ payment_status: 'refund_failed' }).eq('id', order.id);
      }
    }
    return;
  }

  // Email only if THIS call performed the state transition
  const wasAlreadyPaid: boolean = result.was_already_paid ?? false;
  if (!wasAlreadyPaid) {
    void notifyPaymentConfirmed({
      orderNumber: result.order_number ?? order.order_number,
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      totalAmount: amountPaise / 100,
      currency,
      razorpayPaymentId: rzpPaymentId,
    });
  }
}

// ── payment.failed handler ───────────────────────────────────────────

async function handlePaymentFailed(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any
): Promise<void> {
  const paymentEntity = payload?.payload?.payment?.entity;
  if (!paymentEntity) return;

  const rzpOrderId: string = paymentEntity.order_id;

  const { data: order } = await admin
    .from('orders')
    .select('id, status, payment_status, order_number, customer_name, customer_email')
    .eq('razorpay_order_id', rzpOrderId)
    .maybeSingle();

  if (!order) return;

  // Only update if still in pending_payment
  if (order.status === 'pending_payment') {
    await admin.from('orders').update({
      status: 'cancelled',
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);

    void notifyPaymentFailed({
      orderNumber: order.order_number,
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
    });
  }
}
