/**
 * RFC Store — Supabase Server Client
 *
 * Use this client in:
 *  - Server Components
 *  - Server Actions
 *  - API Route Handlers
 *
 * This client has access to the user's session via cookies.
 * It does NOT use the service-role key — it remains scoped to
 * the authenticated user's permissions (Row Level Security applies).
 *
 * For admin/service-role operations, create a separate admin client
 * using SUPABASE_SERVICE_ROLE_KEY in a dedicated server-only file.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Creates a new Supabase server client for each request.
 * Must be called inside a Server Component or Route Handler.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[RFC Store] Supabase environment variables are missing.\n" +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll can fail in Server Components — this is safe to ignore.
          // Session refresh is handled by middleware.
        }
      },
    },
  });
}
