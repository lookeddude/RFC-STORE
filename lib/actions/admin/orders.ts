'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser, UNAUTHORIZED } from './auth';
import { notifyOrderStatusChanged } from '@/lib/notifications';
import type { AdminActionResult, AdminOrderStatus } from '@/types/admin';
import { ORDER_STATUS_TRANSITIONS as TRANSITIONS } from '@/types/admin';

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: AdminOrderStatus
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return UNAUTHORIZED;

  const supabase = await createClient();

  // Fetch current order status + customer details for notification
  const { data: order } = await supabase
    .from('orders')
    .select('status, order_number, customer_email, customer_name')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return { success: false, error: 'Order not found.' };

  const currentStatus = order.status as AdminOrderStatus;
  const allowedNext = TRANSITIONS[currentStatus] ?? [];

  if (!allowedNext.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from "${currentStatus}" to "${newStatus}".`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
    .eq('id', orderId);

  if (error) return { success: false, error: error.message };

  // Fire customer notification (non-blocking — never breaks admin flow)
  void notifyOrderStatusChanged({
    orderNumber: order.order_number as string,
    orderId,
    customerEmail: order.customer_email as string,
    customerName: (order.customer_name ?? 'Customer') as string,
    previousStatus: currentStatus,
    newStatus,
  });

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/account/orders');
  return { success: true };
}

