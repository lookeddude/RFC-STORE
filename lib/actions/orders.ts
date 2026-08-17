'use server';
/**
 * RFC Store — Guest Order Actions
 *
 * claimGuestOrders: links guest orders (user_id = null) to an authenticated
 * account when the email matches. Called after every successful login/signup/OAuth.
 *
 * Security:
 *   - Uses admin client (service role) — server-only, never exposed to browser
 *   - Email is taken from the verified Supabase session, not client input
 *   - Only updates rows where user_id IS NULL → can never touch another user's orders
 *   - Idempotent: safe to call multiple times (subsequent calls are no-ops)
 */
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Associate all guest orders placed with `email` to the authenticated `userId`.
 *
 * @param userId - Verified Supabase auth UID (from getUser(), not getSession())
 * @param email  - Verified email from the auth session (lowercased)
 */
export async function claimGuestOrders(
  userId: string,
  email: string,
): Promise<{ claimed: number }> {
  try {
    const admin = createAdminClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await admin
      .from('orders')
      .update({
        user_id:    userId,
        updated_at: new Date().toISOString(),
      })
      .is('user_id', null)
      .eq('customer_email', normalizedEmail)
      .select('id');

    if (error) {
      console.error('[RFC Store] claimGuestOrders error:', error.message);
      return { claimed: 0 };
    }

    const claimed = data?.length ?? 0;
    if (claimed > 0) {
      console.info(
        `[RFC Store] claimGuestOrders: ${claimed} order(s) claimed for ${normalizedEmail}`,
      );
    }
    return { claimed };
  } catch (err) {
    // Never let order-claiming failure surface to the user
    console.error('[RFC Store] claimGuestOrders unexpected error:', err);
    return { claimed: 0 };
  }
}
