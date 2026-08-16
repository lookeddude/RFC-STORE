-- RFC Store Migration: Fix merge_guest_cart() -- GREATEST-based idempotent merge
-- Timestamp: 20260816000003
--
-- Problem: Previous SUM-based merge (existing_qty + guest_qty) is NOT idempotent.
-- If two tabs both capture the same guest items before localStorage is cleared,
-- the second call (after the advisory lock releases) adds the same quantities again.
--
-- Fix: Replace SUM with GREATEST(existing_qty, guest_qty), capped at 20.
--   GREATEST is idempotent: a second call with the same guest_qty produces
--   GREATEST(already_merged, guest_qty) = already_merged -> no change.
--
-- Rollback: CREATE OR REPLACE with previous SUM-based body. No table changes.

CREATE OR REPLACE FUNCTION public.merge_guest_cart(
  p_user_id uuid,
  p_items   jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  item            jsonb;
  existing_qty    int;
  merged_qty      int;
  v_variant_id    uuid;
  v_merged_count  int := 0;
  v_skipped_count int := 0;
BEGIN
  -- Layer 1: Serialize concurrent merges for the same user.
  -- Advisory lock blocks a second concurrent call until the first transaction
  -- commits. Even if both callers hold identical guest items, GREATEST (below)
  -- guarantees the second call is a safe no-op.
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- Layer 2: Short-circuit if nothing to merge.
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'merged',  0,
      'skipped', 0
    );
  END IF;

  -- Layer 3: Process each guest item.
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP

    -- Resolve variant_id (handle null/'null'/'' from JSON serialization)
    v_variant_id := CASE
      WHEN item->>'variant_id' IS NULL
        OR item->>'variant_id' IN ('null', 'NULL', '')
      THEN NULL
      ELSE (item->>'variant_id')::uuid
    END;

    -- Skip deleted/unpublished products
    IF NOT EXISTS (
      SELECT 1 FROM public.products
      WHERE id = (item->>'product_id')::uuid AND is_active = true
    ) THEN
      v_skipped_count := v_skipped_count + 1;
      CONTINUE;
    END IF;

    -- Skip deleted/unavailable variants
    IF v_variant_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.product_variants
      WHERE id         = v_variant_id
        AND product_id = (item->>'product_id')::uuid
        AND is_available = true
    ) THEN
      v_skipped_count := v_skipped_count + 1;
      CONTINUE;
    END IF;

    -- Read current DB quantity (advisory lock prevents concurrent writers)
    SELECT quantity INTO existing_qty
    FROM public.cart_items
    WHERE user_id    = p_user_id
      AND product_id = (item->>'product_id')::uuid
      AND (
        (v_variant_id IS NULL      AND variant_id IS NULL)
        OR (v_variant_id IS NOT NULL AND variant_id = v_variant_id)
      );

    existing_qty := COALESCE(existing_qty, 0);

    -- GREATEST merge: idempotent under repeated or concurrent calls.
    -- Call 1: DB=2, Guest=3 -> GREATEST(2,3)=3, stored=3
    -- Call 2: DB=3, Guest=3 -> GREATEST(3,3)=3, no-op
    -- vs SUM: Call 1 -> 5, Call 2 -> 8 (WRONG)
    merged_qty := LEAST(
      GREATEST(existing_qty, (item->>'quantity')::int),
      20
    );

    INSERT INTO public.cart_items
      (user_id, product_id, variant_id, quantity, unit_price, updated_at)
    VALUES (
      p_user_id,
      (item->>'product_id')::uuid,
      v_variant_id,
      merged_qty,
      (item->>'unit_price')::numeric,
      now()
    )
    ON CONFLICT ON CONSTRAINT cart_items_unique_item DO UPDATE
      SET quantity   = merged_qty,
          unit_price = EXCLUDED.unit_price,
          updated_at = now();

    v_merged_count := v_merged_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'merged',  v_merged_count,
    'skipped', v_skipped_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.merge_guest_cart(uuid, jsonb) IS
'Merges guest cart items into authenticated user DB cart.
Race safety: pg_advisory_xact_lock + GREATEST merge = idempotent.
Quantity: GREATEST(db_qty, guest_qty) capped at 20.
Caller must clear localStorage before calling.';
