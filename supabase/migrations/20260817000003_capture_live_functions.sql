-- RFC Store — Phase 5: Capture live database functions into migrations
-- Timestamp: 20260817000003
--
-- These functions were previously applied directly to the Supabase project
-- via execute_sql and not captured in migration files. This migration makes
-- the repository self-sufficient: a fresh database bootstrapped from all
-- migrations will have identical functionality to production.
--
-- All statements use CREATE OR REPLACE FUNCTION — idempotent and safe
-- to run on the live database.
--
-- DDL extracted verbatim via:
--   SELECT pg_get_functiondef(p.oid) FROM pg_proc p
--   JOIN pg_namespace n ON p.pronamespace = n.oid
--   WHERE n.nspname = 'public' AND p.prokind = 'f';


-- ── 1. confirm_razorpay_payment ────────────────────────────────────────────
-- Called by: app/api/webhooks/razorpay/route.ts, lib/actions/razorpay.ts
-- Locks the order, validates inventory, deducts stock, marks as paid.
-- On inventory failure after payment: sets refund_pending for manual review.

CREATE OR REPLACE FUNCTION public.confirm_razorpay_payment(
  p_order_id           uuid,
  p_razorpay_payment_id text,
  p_razorpay_signature  text,
  p_payment_amount      numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order            record;
  v_item             record;
  v_inv              record;
  v_order_number     text;
BEGIN
  -- Lock the order row
  SELECT id, status, payment_status, order_number, total_amount
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_NOT_FOUND');
  END IF;

  -- Idempotency: already paid
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'was_already_paid', true, 'order_number', v_order.order_number);
  END IF;

  -- Only process orders in pending_payment status
  IF v_order.status != 'pending_payment' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'status', v_order.status);
  END IF;

  -- Lock and validate inventory for all items
  FOR v_item IN
    SELECT oi.variant_id, oi.product_id, oi.quantity
      FROM public.order_items oi
      WHERE oi.order_id = p_order_id
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      SELECT inv.quantity, inv.reserved
        INTO v_inv
        FROM public.inventory inv
        WHERE inv.variant_id = v_item.variant_id
        FOR UPDATE;

      IF NOT FOUND OR (v_inv.quantity - v_inv.reserved) < v_item.quantity THEN
        -- Inventory unavailable after payment: trigger refund flow
        UPDATE public.orders
          SET status = 'refund_pending',
              payment_status = 'refund_pending',
              razorpay_payment_id = p_razorpay_payment_id,
              razorpay_signature = p_razorpay_signature,
              payment_amount = p_payment_amount,
              payment_provider = 'razorpay',
              updated_at = now()
          WHERE id = p_order_id;
        RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_INVENTORY', 'order_number', v_order.order_number);
      END IF;
    END IF;
  END LOOP;

  -- Deduct inventory
  FOR v_item IN
    SELECT oi.variant_id, oi.quantity
      FROM public.order_items oi
      WHERE oi.order_id = p_order_id AND oi.variant_id IS NOT NULL
  LOOP
    UPDATE public.inventory
      SET reserved = reserved + v_item.quantity,
          updated_at = now()
      WHERE variant_id = v_item.variant_id;
  END LOOP;

  -- Confirm order
  UPDATE public.orders
    SET status = 'pending',
        payment_status = 'paid',
        razorpay_payment_id = p_razorpay_payment_id,
        razorpay_signature = p_razorpay_signature,
        payment_amount = p_payment_amount,
        payment_provider = 'razorpay',
        updated_at = now()
    WHERE id = p_order_id
    RETURNING order_number INTO v_order_number;

  RETURN jsonb_build_object('success', true, 'was_already_paid', false, 'order_number', v_order_number);
END;
$$;


-- ── 2. create_order_atomic ─────────────────────────────────────────────────
-- Called by: lib/actions/checkout.ts (COD checkout)
-- Validates inventory with FOR UPDATE locks, inserts order + items,
-- reserves inventory. Handles idempotency via idempotency_key.

CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_user_id         uuid,
  p_customer_name   text,
  p_customer_email  text,
  p_customer_phone  text,
  p_shipping_address jsonb,
  p_items           jsonb,
  p_subtotal        numeric,
  p_shipping_amount numeric,
  p_tax_amount      numeric,
  p_total_amount    numeric,
  p_currency        text    DEFAULT 'INR',
  p_idempotency_key text    DEFAULT NULL,
  p_payment_method  text    DEFAULT 'cod',
  p_cod_fee         numeric DEFAULT 0,
  p_discount_amount numeric DEFAULT 0,
  p_notes           text    DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id       uuid;
  v_order_number   text;
  v_item           jsonb;
  v_variant_id     uuid;
  v_quantity       integer;
  v_available      integer;
  v_existing_order jsonb;
BEGIN
  -- Idempotency: return existing order if this key was already used
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object('order_id', id, 'order_number', order_number)
      INTO v_existing_order
      FROM public.orders
      WHERE idempotency_key = p_idempotency_key;

    IF v_existing_order IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success',      true,
        'order_id',     v_existing_order->>'order_id',
        'order_number', v_existing_order->>'order_number',
        'replayed',     true
      );
    END IF;
  END IF;

  -- Validate + lock inventory for all items.
  -- FOR UPDATE acquires an exclusive row lock on each inventory record.
  -- A second concurrent order for the same variant blocks here.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := NULLIF(v_item->>'variantId', 'null')::uuid;
    v_quantity   := (v_item->>'quantity')::integer;

    IF v_variant_id IS NOT NULL THEN
      SELECT (quantity - reserved) INTO v_available
        FROM public.inventory
        WHERE variant_id = v_variant_id
        FOR UPDATE;

      IF v_available IS NULL THEN
        RETURN jsonb_build_object(
          'success', false,
          'error',   'INVENTORY_NOT_FOUND',
          'detail',  format('No inventory record for variant %s', v_variant_id)
        );
      END IF;

      IF v_quantity > v_available THEN
        RETURN jsonb_build_object(
          'success', false,
          'error',   'INSUFFICIENT_INVENTORY',
          'detail',  format('Only %s units available for %s', v_available, v_item->>'productName')
        );
      END IF;
    END IF;
  END LOOP;

  -- Insert the order record
  INSERT INTO public.orders (
    user_id, customer_name, customer_email, customer_phone,
    shipping_address, subtotal, shipping_amount, tax_amount,
    discount_amount, cod_fee, total_amount, currency,
    idempotency_key, payment_method, notes
  ) VALUES (
    p_user_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_subtotal, p_shipping_amount, p_tax_amount,
    p_discount_amount, p_cod_fee, p_total_amount, p_currency,
    p_idempotency_key, p_payment_method, p_notes
  ) RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Insert order items + reserve inventory
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := NULLIF(v_item->>'variantId', 'null')::uuid;
    v_quantity   := (v_item->>'quantity')::integer;

    INSERT INTO public.order_items (
      order_id, product_id, variant_id,
      product_name_snapshot, variant_name_snapshot, sku_snapshot,
      unit_price_snapshot, quantity, line_total
    ) VALUES (
      v_order_id,
      (v_item->>'productId')::uuid,
      v_variant_id,
      v_item->>'productName',
      NULLIF(v_item->>'variantName', 'null'),
      NULLIF(v_item->>'sku',         'null'),
      (v_item->>'unitPrice')::numeric,
      v_quantity,
      (v_item->>'lineTotal')::numeric
    );

    IF v_variant_id IS NOT NULL THEN
      UPDATE public.inventory
        SET reserved   = reserved + v_quantity,
            updated_at = now()
        WHERE variant_id = v_variant_id;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success',      true,
    'order_id',     v_order_id,
    'order_number', v_order_number,
    'replayed',     false
  );

EXCEPTION
  -- Concurrent request raced and inserted with same idempotency_key
  WHEN unique_violation THEN
    IF p_idempotency_key IS NOT NULL THEN
      SELECT jsonb_build_object('order_id', id, 'order_number', order_number)
        INTO v_existing_order
        FROM public.orders
        WHERE idempotency_key = p_idempotency_key;

      IF v_existing_order IS NOT NULL THEN
        RETURN jsonb_build_object(
          'success',      true,
          'order_id',     v_existing_order->>'order_id',
          'order_number', v_existing_order->>'order_number',
          'replayed',     true
        );
      END IF;
    END IF;
    RETURN jsonb_build_object(
      'success', false, 'error', 'DATABASE_ERROR', 'detail', 'Duplicate key'
    );

  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false, 'error', 'DATABASE_ERROR', 'detail', SQLERRM
    );
END;
$$;


-- ── 3. create_order_pending ────────────────────────────────────────────────
-- Called by: lib/actions/razorpay.ts (Razorpay checkout — creates order
-- in pending_payment status WITHOUT touching inventory).
-- Inventory is only deducted on payment confirmation.

CREATE OR REPLACE FUNCTION public.create_order_pending(
  p_user_id          uuid,
  p_customer_name    text,
  p_customer_email   text,
  p_customer_phone   text,
  p_shipping_address jsonb,
  p_items            jsonb,
  p_subtotal         numeric,
  p_shipping_amount  numeric,
  p_tax_amount       numeric,
  p_total_amount     numeric,
  p_currency         text,
  p_idempotency_key  text,
  p_payment_method   text    DEFAULT 'razorpay',
  p_discount_amount  numeric DEFAULT 0,
  p_notes            text    DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id     uuid;
  v_order_number text;
  v_item         jsonb;
BEGIN
  -- Idempotency: return existing order if key already used
  SELECT id, order_number INTO v_order_id, v_order_number
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'was_existing', true);
  END IF;

  -- Insert order WITHOUT touching inventory (pending_payment)
  INSERT INTO public.orders (
    user_id, customer_name, customer_email, customer_phone,
    shipping_address, status, payment_status, payment_method,
    subtotal, shipping_amount, tax_amount, discount_amount, total_amount,
    currency, idempotency_key, notes
  ) VALUES (
    p_user_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, 'pending_payment', 'pending', p_payment_method,
    p_subtotal, p_shipping_amount, p_tax_amount, p_discount_amount, p_total_amount,
    p_currency, p_idempotency_key, p_notes
  ) RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Insert order items (snapshot only — no inventory changes)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, variant_id,
      product_name_snapshot, variant_name_snapshot, sku_snapshot,
      unit_price_snapshot, quantity, line_total
    ) VALUES (
      v_order_id,
      (v_item->>'productId')::uuid,
      NULLIF(v_item->>'variantId', '')::uuid,
      v_item->>'productName',
      NULLIF(v_item->>'variantName', ''),
      NULLIF(v_item->>'sku', ''),
      (v_item->>'unitPrice')::numeric,
      (v_item->>'quantity')::int,
      (v_item->>'lineTotal')::numeric
    );
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'was_existing', false);

EXCEPTION
  WHEN unique_violation THEN
    -- Race condition on idempotency_key — fetch and return existing
    SELECT id, order_number INTO v_order_id, v_order_number
      FROM public.orders WHERE idempotency_key = p_idempotency_key;
    RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'was_existing', true);
END;
$$;


-- ── 4. generate_invoice_number ─────────────────────────────────────────────
-- Generates RFC-INV-YYYYMM-NNNNN format invoice numbers.
-- Depends on: public.invoice_number_seq (must exist before this function runs)

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'RFC-INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.invoice_number_seq')::text, 5, '0');
END;
$$;


-- ── 5. generate_order_number ───────────────────────────────────────────────
-- Generates RFC-YYYYMMDD-NNNNNN format order numbers.
-- Depends on: public.order_number_seq (must exist before this function runs)

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  seq_val bigint;
BEGIN
  seq_val := nextval('public.order_number_seq');
  RETURN 'RFC-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(seq_val::text, 6, '0');
END;
$$;


-- ── 6. is_admin ────────────────────────────────────────────────────────────
-- Convenience function for RLS policies.
-- Returns true if the calling user has admin or super_admin role.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;


-- ── 7. handle_new_user ─────────────────────────────────────────────────────
-- Trigger function: auto-creates profile row on new auth.users insert.
-- Linked to trigger: on_auth_user_created on auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;


-- ── 8. Timestamp trigger functions ────────────────────────────────────────
-- Auto-update updated_at columns on row modification.

CREATE OR REPLACE FUNCTION public.update_addresses_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_cart_items_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_hero_slides_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;


-- ── Grants ─────────────────────────────────────────────────────────────────
-- Match exactly the grants observed in production via information_schema.

GRANT EXECUTE ON FUNCTION public.confirm_razorpay_payment(uuid, text, text, numeric) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(uuid, text, text, text, jsonb, jsonb, numeric, numeric, numeric, numeric, text, text, text, numeric, numeric, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_order_pending(uuid, text, text, text, jsonb, jsonb, numeric, numeric, numeric, numeric, text, text, text, numeric, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;
