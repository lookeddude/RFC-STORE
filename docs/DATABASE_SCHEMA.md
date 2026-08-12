# RFC Store — Database Architecture Plan

**Status:** Architecture documented (Phase 1). Tables to be implemented in Phase 2.  
**Supabase Project:** `efmwddxzsdiexzmyccvk` (RFC STORE)  
**Database:** PostgreSQL 17

---

## Schema Philosophy

- **Normalized relational data** — no JSON blobs for structured relational data
- **UUID primary keys** throughout
- **`created_at` / `updated_at`** on every table (triggers for auto-update)
- **Row Level Security (RLS)** enabled on every table from Day 1
- **Soft deletes** via `is_active` or `deleted_at` — never hard delete customer data
- **No duplicate sources of truth** — a price lives in one place

---

## Planned Tables

### Identity & Auth

```sql
-- Extends auth.users — one-to-one
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL,
  email         text NOT NULL,
  full_name     text,
  phone         text,
  avatar_url    text,
  role          text DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin'))
);
```

### Product Catalogue

```sql
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now() NOT NULL,
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  image_url   text,           -- references media_assets in future
  parent_id   uuid REFERENCES categories(id),
  sort_order  integer DEFAULT 0,
  is_active   boolean DEFAULT true
);

CREATE TABLE public.products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL,
  name                text NOT NULL,
  slug                text UNIQUE NOT NULL,
  description         text,
  short_description   text,
  category_id         uuid REFERENCES categories(id),
  base_price          numeric(10,2) NOT NULL,
  compare_at_price    numeric(10,2),
  is_active           boolean DEFAULT true,
  is_featured         boolean DEFAULT false,
  tags                text[] DEFAULT '{}',
  meta_title          text,
  meta_description    text
);

CREATE TABLE public.product_variants (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz DEFAULT now() NOT NULL,
  product_id        uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name              text NOT NULL,
  sku               text UNIQUE NOT NULL,
  price             numeric(10,2) NOT NULL,
  compare_at_price  numeric(10,2),
  attributes        jsonb DEFAULT '{}',  -- { "size": "L", "color": "Red" }
  is_available      boolean DEFAULT true
);

CREATE TABLE public.product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url         text NOT NULL,
  alt_text    text,
  sort_order  integer DEFAULT 0,
  is_primary  boolean DEFAULT false
);

CREATE TABLE public.inventory (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at      timestamptz DEFAULT now() NOT NULL,
  variant_id      uuid UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
  quantity        integer DEFAULT 0 NOT NULL,
  reserved        integer DEFAULT 0 NOT NULL,  -- items in pending orders
  low_threshold   integer DEFAULT 5
);
```

### Customer Activity

```sql
CREATE TABLE public.addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now() NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label       text DEFAULT 'Home',
  full_name   text NOT NULL,
  phone       text NOT NULL,
  line1       text NOT NULL,
  line2       text,
  city        text NOT NULL,
  state       text NOT NULL,
  postal_code text NOT NULL,
  country     text DEFAULT 'IN' NOT NULL,
  is_default  boolean DEFAULT false
);

CREATE TABLE public.wishlist_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now() NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id  uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (user_id, product_id)
);
```

### Cart (Server-side for authenticated users; local state for guests)

```sql
CREATE TABLE public.cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  variant_id  uuid REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
  quantity    integer DEFAULT 1 NOT NULL,
  UNIQUE (user_id, variant_id)
);
```

### Orders

```sql
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);

CREATE TABLE public.orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL,
  user_id             uuid REFERENCES auth.users(id),  -- NULL for guest orders
  order_number        text UNIQUE NOT NULL,           -- RFC-2024-001234
  status              order_status DEFAULT 'pending' NOT NULL,
  subtotal            numeric(10,2) NOT NULL,
  shipping_cost       numeric(10,2) DEFAULT 0,
  tax_amount          numeric(10,2) DEFAULT 0,
  total_amount        numeric(10,2) NOT NULL,
  shipping_address_id uuid REFERENCES addresses(id),
  notes               text,
  payment_intent_id   text         -- Stripe/Razorpay reference
);

CREATE TABLE public.order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  variant_id  uuid REFERENCES product_variants(id) NOT NULL,
  product_name text NOT NULL,    -- snapshot at time of purchase
  variant_name text NOT NULL,
  sku         text NOT NULL,
  price       numeric(10,2) NOT NULL,
  quantity    integer NOT NULL
);
```

### CMS / Site Content

```sql
CREATE TABLE public.site_content (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  key         text UNIQUE NOT NULL,   -- e.g. 'homepage_hero_title'
  label       text NOT NULL,          -- Human readable
  value       text,
  value_json  jsonb,
  content_type text DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'json', 'rich_text')),
  section     text,                   -- e.g. 'homepage', 'categories'
  is_active   boolean DEFAULT true
);

CREATE TABLE public.media_assets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now() NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  filename    text NOT NULL,
  url         text NOT NULL,          -- Supabase Storage URL
  storage_path text NOT NULL,         -- Internal storage path
  mime_type   text NOT NULL,
  size_bytes  bigint,
  alt_text    text,
  tags        text[] DEFAULT '{}'
);
```

---

## RLS Policies (Phase 2 Implementation)

| Table | Policy | Rule |
|---|---|---|
| `profiles` | SELECT own | `auth.uid() = id` |
| `profiles` | SELECT admin | `role = 'admin'` |
| `products` | SELECT active | `is_active = true` |
| `products` | ALL admin | `role IN ('admin', 'super_admin')` |
| `orders` | SELECT own | `auth.uid() = user_id` |
| `orders` | ALL admin | admin role check |
| `wishlist_items` | ALL own | `auth.uid() = user_id` |
| `cart_items` | ALL own | `auth.uid() = user_id` |
| `site_content` | SELECT | Public read |
| `site_content` | MODIFY | Admin only |
| `media_assets` | SELECT | Public read |
| `media_assets` | INSERT | Admin only |

---

## Phase 2 Implementation Steps

1. Apply migrations using `supabase/migrations/` folder
2. Enable RLS on every table
3. Create policies as documented above  
4. Run `npx supabase gen types typescript --project-id efmwddxzsdiexzmyccvk > types/database.ts`
5. Update all TypeScript types to use generated output
