-- RFC Store — Phase 2: Persistent Cart for Authenticated Users
-- Applied: 2026-08-16

CREATE TABLE IF NOT EXISTS public.cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id  uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity    int NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 20),
  unit_price  numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_unique_item UNIQUE (user_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON public.cart_items(user_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items: users read own rows"
  ON public.cart_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items: users insert own rows"
  ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items: users update own rows"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items: users delete own rows"
  ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.cart_items IS
  'Persistent cart for authenticated users. unit_price is informational only — placeOrderAction re-fetches from DB.';
COMMENT ON COLUMN public.cart_items.unit_price IS
  'Price snapshot at add-time. Display only. NEVER authoritative at checkout.';
COMMENT ON COLUMN public.cart_items.variant_id IS
  'NULL for products with no variants. SET NULL on variant deletion.';
