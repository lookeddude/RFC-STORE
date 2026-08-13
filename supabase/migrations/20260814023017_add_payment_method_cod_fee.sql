-- RFC Store Migration: Add payment_method and cod_fee to orders table
-- Timestamp: 20260814023017

-- Add payment_method column
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod'
  CHECK (payment_method IN ('cod', 'razorpay', 'cashfree', 'stripe', 'manual'));

-- Add cod_fee column (₹ amount charged for COD, 0 if none)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cod_fee numeric(10,2) NOT NULL DEFAULT 0;

-- Add tracking_number column (for admin to add when shipped)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number text;

-- Add tracking_courier column
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_courier text;

-- Backfill existing orders as COD (they were placed without payment, so COD is correct)
UPDATE public.orders
  SET payment_method = 'cod'
  WHERE payment_method IS NULL OR payment_method = '';

-- Update total_amount for existing orders to include any cod_fee
-- (no change needed — existing orders have cod_fee = 0 by default)

COMMENT ON COLUMN public.orders.payment_method IS 'Payment method selected at checkout: cod, razorpay, cashfree, stripe, manual';
COMMENT ON COLUMN public.orders.cod_fee IS 'Cash on Delivery handling fee charged to customer (INR). 0 for non-COD orders.';
COMMENT ON COLUMN public.orders.tracking_number IS 'Shipping tracking number added by admin when order is shipped';
COMMENT ON COLUMN public.orders.tracking_courier IS 'Courier/logistics provider name (e.g. Delhivery, Bluedart, DTDC)';
