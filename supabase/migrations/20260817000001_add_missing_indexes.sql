-- RFC Store — Phase 5: Add missing foreign key indexes
-- Timestamp: 20260817000001
--
-- These indexes cover FK columns that are frequently queried but had
-- no explicit index. Without them, PostgreSQL performs sequential scans
-- on growing production tables.
--
-- All use CREATE INDEX IF NOT EXISTS — safe to replay on any environment.

-- orders: user_id queried on every /account/orders page load
CREATE INDEX IF NOT EXISTS orders_user_id_idx
  ON public.orders(user_id);

-- order_items: order_id queried on every order detail view
CREATE INDEX IF NOT EXISTS order_items_order_id_idx
  ON public.order_items(order_id);

-- order_items: product_id and variant_id for join queries
CREATE INDEX IF NOT EXISTS order_items_product_id_idx
  ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS order_items_variant_id_idx
  ON public.order_items(variant_id);

-- product_variants: product_id queried on every product page and checkout
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx
  ON public.product_variants(product_id);

-- product_images: product_id queried on every product page
CREATE INDEX IF NOT EXISTS product_images_product_id_idx
  ON public.product_images(product_id);

-- addresses: user_id queried on checkout and /account/addresses
CREATE INDEX IF NOT EXISTS addresses_user_id_idx
  ON public.addresses(user_id);

-- refunds: order_id queried on admin order detail page
CREATE INDEX IF NOT EXISTS refunds_order_id_idx
  ON public.refunds(order_id);

-- webhook_events: composite index for idempotency lookup on every webhook
CREATE INDEX IF NOT EXISTS webhook_events_provider_event_id_idx
  ON public.webhook_events(provider, event_id);
