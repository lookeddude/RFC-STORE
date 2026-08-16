/**
 * RFC Store — Guest Payment Ownership Tokens
 *
 * SERVER-ONLY. Manages cryptographic tokens for guest Razorpay verification.
 *
 * Security model:
 *   - Raw token: 256-bit random (crypto.randomBytes(32)) — returned to browser ONCE
 *   - Stored token: SHA-256 hash — raw token never persisted in DB or logs
 *   - Scope: one token per order (UNIQUE on order_id in payment_tokens table)
 *   - Expiry: 24 hours from creation
 *   - Replay: allowed within expiry window (idempotency is at DB confirmation level)
 *   - Cross-order: impossible — token hash is tied to specific order_id
 */

import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Generate a guest payment token for an order.
 * Call this AFTER create_order_pending() succeeds.
 *
 * @param orderId - RFC internal order UUID
 * @returns rawToken - Return this to the browser. Never log or store it.
 */
export async function createGuestPaymentToken(orderId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex'); // 256 bits of entropy
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const admin = createAdminClient();

  // Upsert: if order already has a token (e.g., retry), replace it
  await admin.from('payment_tokens').upsert(
    {
      order_id: orderId,
      token_hash: tokenHash,
      // expires_at defaults to now() + 24 hours in DB
    },
    { onConflict: 'order_id' }
  );

  return rawToken; // Return raw token to browser — NEVER log this
}

/**
 * Validate a guest payment token for a specific order.
 *
 * @param orderId    - RFC internal order UUID
 * @param rawToken   - Token submitted by the browser
 * @returns true if token is valid and not expired
 */
export async function validateGuestPaymentToken(
  orderId: string,
  rawToken: string
): Promise<boolean> {
  if (!rawToken || rawToken.length < 10) return false;

  const submittedHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const admin = createAdminClient();

  const { data: record } = await admin
    .from('payment_tokens')
    .select('token_hash')
    .eq('order_id', orderId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!record) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(record.token_hash, 'hex'),
      Buffer.from(submittedHash, 'hex')
    );
  } catch {
    // Buffer length mismatch
    return false;
  }
}
