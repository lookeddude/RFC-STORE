# RFC Store — Supabase Storage Architecture

**Status:** Architecture documented (Phase 1). Buckets to be created in Phase 2.  
**Supabase Project:** `efmwddxzsdiexzmyccvk` (RFC STORE)

---

## Design Principle

Images should **never be hardcoded** throughout source code.  
All media must flow through Supabase Storage + the `media_assets` database table.  
Future admin Media Library will allow replacing images without touching source code.

---

## Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `product-images` | Public read | Product photography |
| `site-assets` | Public read | Homepage hero, banners, section images |
| `gallery` | Public read | RFC gym gallery, event photos |
| `user-avatars` | Auth read | Customer profile photos |
| `admin-uploads` | Admin only | Temporary admin upload staging |

---

## Folder Structure

### `product-images/`
```
product-images/
├── {product-id}/
│   ├── primary.webp          # Primary product photo
│   ├── gallery-1.webp
│   ├── gallery-2.webp
│   └── thumbnail.webp        # 400x400 square crop
```

### `site-assets/`
```
site-assets/
├── homepage/
│   ├── hero-desktop.webp
│   ├── hero-mobile.webp
│   ├── featured-banner.webp
│   └── cta-background.webp
├── categories/
│   ├── boxing.webp
│   ├── mma.webp
│   ├── training.webp
│   └── protection.webp
└── programs/
    └── {program-slug}.webp
```

### `gallery/`
```
gallery/
├── events/
├── gym/
└── athletes/
```

---

## Access Policies

```sql
-- product-images: public read, admin write
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- user-avatars: user owns their avatar
CREATE POLICY "Users can manage their own avatar"
ON storage.objects
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## URL Generation

```typescript
// Correct pattern — never hardcode storage URLs
export function getProductImageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
}

// Future: use media_assets table reference
export async function getContentImageUrl(contentKey: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', contentKey)
    .single();
  return data?.value ?? null;
}
```

---

## Image Optimisation Strategy

1. **Upload format:** WebP with AVIF fallback via Next.js `<Image>`
2. **Sizes:** Product thumbnails: 400px, Detail: 1200px, Hero: 1920px
3. **CDN:** Supabase Storage serves via CDN automatically
4. **Transformation:** Use Supabase Image Transformation API for responsive crops
5. **Alt text:** Stored in `media_assets.alt_text` — never empty in production

---

## Phase 2 Implementation Steps

1. Create buckets via Supabase Dashboard → Storage
2. Set bucket policies (public read where appropriate)
3. Apply storage RLS via SQL editor
4. Build `lib/storage/` service layer for upload/retrieve
5. Build admin Media Library UI referencing `media_assets` table
6. Wire `site_content` table to homepage sections
