'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser, UNAUTHORIZED } from './auth';
import type { AdminActionResult, CategoryFormData } from '@/types/admin';

function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export async function createCategoryAction(data: CategoryFormData): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  if (!data.name?.trim()) return { success: false, error: 'Category name is required.' };
  if (!data.slug?.trim()) return { success: false, error: 'Slug is required.' };
  if (!validateSlug(data.slug)) return { success: false, error: 'Slug must be lowercase letters, numbers, and hyphens only.' };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('categories').select('id').eq('slug', data.slug).maybeSingle();
  if (existing) return { success: false, error: `Slug "${data.slug}" is already in use.` };

  const { data: cat, error } = await supabase
    .from('categories')
    .insert({
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description || null,
      image_url: data.imageUrl || null,
      sort_order: parseInt(data.sortOrder) || 0,
      is_active: data.isActive,
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/categories');
  revalidatePath('/shop');
  return { success: true, id: cat.id };
}

export async function updateCategoryAction(
  categoryId: string,
  data: Partial<CategoryFormData>
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  if (data.slug && !validateSlug(data.slug)) {
    return { success: false, error: 'Slug must be lowercase letters, numbers, and hyphens only.' };
  }

  const supabase = await createClient();

  if (data.slug) {
    const { data: existing } = await supabase
      .from('categories').select('id').eq('slug', data.slug)
      .neq('id', categoryId).maybeSingle();
    if (existing) return { success: false, error: `Slug "${data.slug}" is already in use.` };
  }

  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.slug !== undefined) payload.slug = data.slug.trim();
  if (data.description !== undefined) payload.description = data.description || null;
  if (data.imageUrl !== undefined) payload.image_url = data.imageUrl || null;
  if (data.sortOrder !== undefined) payload.sort_order = parseInt(data.sortOrder) || 0;
  if (data.isActive !== undefined) payload.is_active = data.isActive;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('categories').update(payload as any).eq('id', categoryId);


  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/categories');
  revalidatePath('/shop');
  return { success: true };
}
