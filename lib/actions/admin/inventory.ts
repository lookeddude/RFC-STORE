'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser, UNAUTHORIZED } from './auth';
import type { AdminActionResult } from '@/types/admin';

export async function updateInventoryAction(
  inventoryId: string,
  quantity: number,
  lowThreshold?: number
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  if (!Number.isInteger(quantity) || quantity < 0) {
    return { success: false, error: 'Quantity must be a non-negative whole number.' };
  }
  if (lowThreshold !== undefined && (lowThreshold < 0 || !Number.isInteger(lowThreshold))) {
    return { success: false, error: 'Low stock threshold must be a non-negative whole number.' };
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = {
    quantity,
    updated_at: new Date().toISOString(),
  };
  if (lowThreshold !== undefined) payload.low_threshold = lowThreshold;

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('inventory').update(payload as any).eq('id', inventoryId);


  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/inventory');
  return { success: true };
}
