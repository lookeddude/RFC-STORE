-- RFC Store — Phase 2: Wishlist for Authenticated Users
-- Applied: 2026-08-16

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wishlist_items_unique_item UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON public.wishlist_items(user_id);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_items: users read own rows"
  ON public.wishlist_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist_items: users insert own rows"
  ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_items: users delete own rows"
  ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.wishlist_items IS
  'Product-level wishlist for authenticated users. No variant_id — wishlist represents product interest, not reservation.';
