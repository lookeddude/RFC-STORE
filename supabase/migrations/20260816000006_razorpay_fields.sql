-- RFC Store — Phase 4: Razorpay payment columns + status constraint updates
-- Applied: 2026-08-16

-- ── Razorpay payment columns ───────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id   text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
  ADD COLUMN IF NOT EXISTS razorpay_signature  text;

-- Index for webhook → order lookup by Razorpay order ID
CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx
  ON public.orders(razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

-- ── Status check constraint update ─────────────────────────
-- Add: pending_payment (Razorpay order awaiting payment)
--      refund_pending  (payment captured, refund in progress)

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'pending_payment',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refund_pending',
  'refunded'
));

-- ── Payment status check constraint update ─────────────────
-- Add: refund_pending  (money captured, refund not yet confirmed)
--      refund_failed   (refund API failed, needs admin)
--      refunded        (fully refunded)

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN (
  'pending',
  'paid',
  'failed',
  'refund_pending',
  'refund_failed',
  'refunded'
));

-- ── Comments ───────────────────────────────────────────────

COMMENT ON COLUMN public.orders.razorpay_order_id IS
  'Razorpay order ID (rzp_order_xxx) created via Razorpay API at checkout initiation. Used by webhook to look up RFC order.';
COMMENT ON COLUMN public.orders.razorpay_payment_id IS
  'Razorpay payment ID (pay_xxx) set after successful payment verification.';
COMMENT ON COLUMN public.orders.razorpay_signature IS
  'Razorpay HMAC signature stored for audit purposes after payment verification.';
