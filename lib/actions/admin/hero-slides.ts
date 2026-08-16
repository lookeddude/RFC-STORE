'use server';

/**
 * RFC Store — Admin Hero Slide Server Actions
 *
 * Full CRUD, publish status toggles, duplicating, and drag-and-drop reordering.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser, UNAUTHORIZED } from './auth';
import type { AdminActionResult } from '@/types/admin';
import type { HeroSlideInput, HeroSlideStatus } from '@/types/hero-slide';

export async function createHeroSlideAction(data: Partial<HeroSlideInput>): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  if (!data.internalName?.trim()) {
    return { success: false, error: 'Internal slide name is required.' };
  }

  const supabase = await createClient();

  // Get max sort_order
  const { data: maxOrderRow } = await supabase
    .from('hero_slides')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = ((maxOrderRow?.sort_order as number) ?? 0) + 1;

  const payload = {
    internal_name: data.internalName.trim(),
    status: data.status || 'draft',
    sort_order: data.sortOrder ?? nextOrder,
    desktop_image_url: data.desktopImageUrl || null,
    tablet_image_url: data.tabletImageUrl || null,
    mobile_image_url: data.mobileImageUrl || null,
    desktop_image_alt: data.desktopImageAlt || null,
    tablet_image_alt: data.tabletImageAlt || null,
    mobile_image_alt: data.mobileImageAlt || null,
    eyebrow: data.eyebrow || null,
    heading: data.heading || 'BUILT FOR THE FIGHT.',
    description: data.description || null,
    primary_button_text: data.primaryButtonText || 'SHOP NOW',
    primary_button_url: data.primaryButtonUrl || '/shop',
    secondary_button_text: data.secondaryButtonText || null,
    secondary_button_url: data.secondaryButtonUrl || null,
    text_position: data.textPosition || 'left',
    text_alignment: data.textAlignment || 'left',
    overlay_strength: data.overlayStrength || 'medium',
    slide_duration: data.slideDuration || 5000,
    transition_style: data.transitionStyle || 'fade',
    transition_speed: data.transitionSpeed || 'normal',
    autoplay: data.autoplay ?? true,
    pause_on_hover: data.pauseOnHover ?? true,
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  };

  const { data: slide, error } = await supabase
    .from('hero_slides')
    .insert(payload)
    .select('id')
    .single();

  if (error || !slide) {
    return { success: false, error: error?.message || 'Failed to create slide.' };
  }

  revalidatePath('/admin/media/hero-slideshow');
  revalidatePath('/');
  return { success: true, id: slide.id };
}

export async function updateHeroSlideAction(
  id: string,
  data: Partial<HeroSlideInput>
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;
  if (!id) return { success: false, error: 'Slide ID is required.' };

  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.internalName !== undefined) payload.internal_name = data.internalName.trim();
  if (data.status !== undefined) {
    payload.status = data.status;
    if (data.status === 'published') {
      payload.published_at = new Date().toISOString();
    }
  }
  if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder;
  if (data.desktopImageUrl !== undefined) payload.desktop_image_url = data.desktopImageUrl || null;
  if (data.tabletImageUrl !== undefined) payload.tablet_image_url = data.tabletImageUrl || null;
  if (data.mobileImageUrl !== undefined) payload.mobile_image_url = data.mobileImageUrl || null;
  if (data.desktopImageAlt !== undefined) payload.desktop_image_alt = data.desktopImageAlt || null;
  if (data.tabletImageAlt !== undefined) payload.tablet_image_alt = data.tabletImageAlt || null;
  if (data.mobileImageAlt !== undefined) payload.mobile_image_alt = data.mobileImageAlt || null;
  if (data.eyebrow !== undefined) payload.eyebrow = data.eyebrow || null;
  if (data.heading !== undefined) payload.heading = data.heading;
  if (data.description !== undefined) payload.description = data.description || null;
  if (data.primaryButtonText !== undefined) payload.primary_button_text = data.primaryButtonText || null;
  if (data.primaryButtonUrl !== undefined) payload.primary_button_url = data.primaryButtonUrl || null;
  if (data.secondaryButtonText !== undefined) payload.secondary_button_text = data.secondaryButtonText || null;
  if (data.secondaryButtonUrl !== undefined) payload.secondary_button_url = data.secondaryButtonUrl || null;
  if (data.textPosition !== undefined) payload.text_position = data.textPosition;
  if (data.textAlignment !== undefined) payload.text_alignment = data.textAlignment;
  if (data.overlayStrength !== undefined) payload.overlay_strength = data.overlayStrength;
  if (data.slideDuration !== undefined) payload.slide_duration = data.slideDuration;
  if (data.transitionStyle !== undefined) payload.transition_style = data.transitionStyle;
  if (data.transitionSpeed !== undefined) payload.transition_speed = data.transitionSpeed;
  if (data.autoplay !== undefined) payload.autoplay = data.autoplay;
  if (data.pauseOnHover !== undefined) payload.pause_on_hover = data.pauseOnHover;

  const { error } = await supabase
    .from('hero_slides')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(payload as any)
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/media/hero-slideshow');
  revalidatePath(`/admin/media/hero-slideshow/${id}/edit`);
  revalidatePath('/');
  return { success: true, id };
}

export async function setHeroSlideStatusAction(
  id: string,
  status: HeroSlideStatus
): Promise<AdminActionResult> {
  return updateHeroSlideAction(id, { status });
}

export async function deleteHeroSlideAction(id: string): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();
  const { error } = await supabase.from('hero_slides').delete().eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/media/hero-slideshow');
  revalidatePath('/');
  return { success: true };
}

export async function duplicateHeroSlideAction(id: string): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();
  const { data: original, error: fetchErr } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !original) {
    return { success: false, error: 'Original slide not found.' };
  }

  const duplicatePayload = {
    internal_name: `${original.internal_name} (Copy)`,
    status: 'draft' as const,
    sort_order: (original.sort_order ?? 0) + 1,
    desktop_image_url: original.desktop_image_url,
    tablet_image_url: original.tablet_image_url,
    mobile_image_url: original.mobile_image_url,
    desktop_image_alt: original.desktop_image_alt,
    tablet_image_alt: original.tablet_image_alt,
    mobile_image_alt: original.mobile_image_alt,
    eyebrow: original.eyebrow,
    heading: original.heading,
    description: original.description,
    primary_button_text: original.primary_button_text,
    primary_button_url: original.primary_button_url,
    secondary_button_text: original.secondary_button_text,
    secondary_button_url: original.secondary_button_url,
    text_position: original.text_position,
    text_alignment: original.text_alignment,
    overlay_strength: original.overlay_strength,
    slide_duration: original.slide_duration,
    transition_style: original.transition_style,
    transition_speed: original.transition_speed,
    autoplay: original.autoplay,
    pause_on_hover: original.pause_on_hover,
    published_at: null,
  };

  const { data: dup, error: insErr } = await supabase
    .from('hero_slides')
    .insert(duplicatePayload)
    .select('id')
    .single();

  if (insErr || !dup) {
    return { success: false, error: insErr?.message || 'Failed to duplicate slide.' };
  }

  revalidatePath('/admin/media/hero-slideshow');
  revalidatePath('/');
  return { success: true, id: dup.id };
}

export async function reorderHeroSlidesAction(orderedIds: string[]): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('hero_slides')
      .update({ sort_order: index + 1, updated_at: new Date().toISOString() })
      .eq('id', id)
  );

  await Promise.all(updates);

  revalidatePath('/admin/media/hero-slideshow');
  revalidatePath('/');
  return { success: true };
}
