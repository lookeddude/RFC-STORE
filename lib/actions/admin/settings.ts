'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser, UNAUTHORIZED } from './auth';
import type { AdminActionResult } from '@/types/admin';

export async function updateSettingAction(
  key: string,
  value: string
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  // Whitelist of allowed setting keys (never trust arbitrary key from client)
  const ALLOWED_KEYS = [
    'store_name', 'contact_email', 'contact_phone', 'whatsapp_number',
    'instagram_url', 'facebook_url', 'hero_title', 'hero_subtitle', 'announcement_text',
  ];

  if (!ALLOWED_KEYS.includes(key)) {
    return { success: false, error: `Setting key "${key}" is not allowed.` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('store_settings')
    .update({ value: value.trim(), updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/settings');
  return { success: true };
}

export async function updateAllSettingsAction(
  settings: Record<string, string>
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const results = await Promise.all(
    Object.entries(settings).map(([key, value]) => updateSettingAction(key, value))
  );

  const failed = results.find(r => !r.success);
  if (failed) return failed;
  return { success: true };
}
