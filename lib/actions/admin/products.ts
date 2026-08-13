'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser, UNAUTHORIZED } from './auth';
import type { AdminActionResult } from '@/types/admin';

export interface ProductMutationData {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string;
  basePrice: number;
  compareAtPrice?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface VariantMutation {
  id?: string; // existing ID = update, no ID = create
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  attributes?: Record<string, string>;
  isAvailable: boolean;
  stockQuantity?: number; // for inventory upsert
}

export async function createProductAction(
  data: ProductMutationData,
  variants: VariantMutation[]
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  // Validate
  if (!data.name?.trim()) return { success: false, error: 'Product name is required.' };
  if (!data.slug?.trim()) return { success: false, error: 'Slug is required.' };
  if (!data.basePrice || data.basePrice <= 0) return { success: false, error: 'Valid price is required.' };

  const supabase = await createClient();

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('products').select('id').eq('slug', data.slug).maybeSingle();
  if (existing) return { success: false, error: `Slug "${data.slug}" is already in use.` };

  // Create product
  const { data: product, error: prodError } = await supabase
    .from('products')
    .insert({
      name: data.name.trim(),
      slug: data.slug.trim(),
      short_description: data.shortDescription || null,
      description: data.description || null,
      category_id: data.categoryId || null,
      base_price: data.basePrice,
      compare_at_price: data.compareAtPrice || null,
      is_active: data.isActive,
      is_featured: data.isFeatured,
      is_new_arrival: data.isNewArrival,
      is_bestseller: data.isBestseller,
      tags: data.tags || [],
      meta_title: data.metaTitle || null,
      meta_description: data.metaDescription || null,
    })
    .select('id')
    .single();

  if (prodError || !product) {
    return { success: false, error: prodError?.message || 'Failed to create product.' };
  }

  // Create variants + inventory
  for (const v of variants) {
    if (!v.name?.trim() || !v.sku?.trim()) continue;
    const { data: variant } = await supabase
      .from('product_variants')
      .insert({
        product_id: product.id,
        name: v.name.trim(),
        sku: v.sku.trim(),
        price: v.price,
        compare_at_price: v.compareAtPrice || null,
        attributes: v.attributes || {},
        is_available: v.isAvailable,
      })
      .select('id')
      .single();

    if (variant && v.stockQuantity !== undefined) {
      await supabase.from('inventory').insert({
        variant_id: variant.id,
        quantity: Math.max(0, v.stockQuantity),
      });
    }
  }

  revalidatePath('/admin/products');
  return { success: true, id: product.id };
}

export async function updateProductAction(
  productId: string,
  data: Partial<ProductMutationData>
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;
  if (!productId) return { success: false, error: 'Product ID required.' };

  const supabase = await createClient();

  // If slug is being changed, check uniqueness
  if (data.slug) {
    const { data: existing } = await supabase
      .from('products').select('id').eq('slug', data.slug)
      .neq('id', productId).maybeSingle();
    if (existing) return { success: false, error: `Slug "${data.slug}" is already in use.` };
  }

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.slug !== undefined) updatePayload.slug = data.slug.trim();
  if (data.shortDescription !== undefined) updatePayload.short_description = data.shortDescription;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId || null;
  if (data.basePrice !== undefined) updatePayload.base_price = data.basePrice;
  if (data.compareAtPrice !== undefined) updatePayload.compare_at_price = data.compareAtPrice || null;
  if (data.isActive !== undefined) updatePayload.is_active = data.isActive;
  if (data.isFeatured !== undefined) updatePayload.is_featured = data.isFeatured;
  if (data.isNewArrival !== undefined) updatePayload.is_new_arrival = data.isNewArrival;
  if (data.isBestseller !== undefined) updatePayload.is_bestseller = data.isBestseller;
  if (data.tags !== undefined) updatePayload.tags = data.tags;
  if (data.metaTitle !== undefined) updatePayload.meta_title = data.metaTitle;
  if (data.metaDescription !== undefined) updatePayload.meta_description = data.metaDescription;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('products').update(updatePayload as any).eq('id', productId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/shop');
  return { success: true, id: productId };
}

export async function toggleProductStatusAction(
  productId: string,
  isActive: boolean
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return { success: true };
}

export async function upsertVariantAction(
  productId: string,
  variant: VariantMutation
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();

  if (variant.id) {
    // Update existing variant
    const { error } = await supabase
      .from('product_variants')
      .update({
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        compare_at_price: variant.compareAtPrice || null,
        attributes: variant.attributes || {},
        is_available: variant.isAvailable,
      })
      .eq('id', variant.id)
      .eq('product_id', productId); // ownership check

    if (error) return { success: false, error: error.message };

    if (variant.stockQuantity !== undefined) {
      await supabase.from('inventory').upsert(
        { variant_id: variant.id, quantity: Math.max(0, variant.stockQuantity) },
        { onConflict: 'variant_id' }
      );
    }
    revalidatePath(`/admin/products/${productId}`);
    return { success: true, id: variant.id };
  } else {
    // Create new variant
    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        compare_at_price: variant.compareAtPrice || null,
        attributes: variant.attributes || {},
        is_available: variant.isAvailable,
      })
      .select('id')
      .single();

    if (error || !data) return { success: false, error: error?.message || 'Failed.' };

    if (variant.stockQuantity !== undefined) {
      await supabase.from('inventory').insert({
        variant_id: data.id,
        quantity: Math.max(0, variant.stockQuantity),
      });
    }
    revalidatePath(`/admin/products/${productId}`);
    return { success: true, id: data.id };
  }
}

export async function deleteVariantAction(
  variantId: string,
  productId: string
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();

  // Archive the variant instead of hard delete (preserve order history)
  const { error } = await supabase
    .from('product_variants')
    .update({ is_available: false })
    .eq('id', variantId)
    .eq('product_id', productId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function addProductImageAction(
  productId: string,
  url: string,
  altText: string,
  isPrimary: boolean
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();

  // If setting as primary, unset all others first
  if (isPrimary) {
    await supabase.from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);
  }

  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, alt_text: altText, is_primary: isPrimary })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true, id: data.id };
}

export async function removeProductImageAction(
  imageId: string
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();
  const { error } = await supabase
    .from('product_images').delete().eq('id', imageId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products');
  return { success: true };
}
