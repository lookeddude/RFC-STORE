/**
 * RFC Store — Supabase Admin Client (Service Role)
 *
 * ⚠️  CRITICAL SECURITY RULES:
 *   1. NEVER import this file in Client Components or browser code
 *   2. NEVER pass this client to any frontend function
 *   3. ONLY use in Server Actions, API Route Handlers, and migration scripts
 *   4. This client BYPASSES Row Level Security — every operation is unrestricted
 *
 * Use cases:
 *   - Database migrations
 *   - Admin dashboard operations
 *   - Server-to-server data seeding
 *   - Background jobs and webhooks
 *
 * For regular authenticated user operations, use lib/supabase/server.ts instead.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Returns a Supabase admin client using the service role key.
 * Bypasses all Row Level Security policies.
 *
 * Must only be called in server-side contexts.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "[RFC Store] Admin client cannot be created.\n" +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local\n" +
        "The service role key must NEVER be exposed to the browser."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable auto-refresh — admin client is stateless per-request
      autoRefreshToken: false,
      // Do not persist sessions — this client has no session
      persistSession: false,
    },
  });
}
