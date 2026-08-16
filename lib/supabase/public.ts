/**
 * RFC Store — Supabase Public Client
 *
 * This client does NOT use cookies.
 * It is meant exclusively for fetching public catalog data (products, categories).
 * By omitting cookies(), it prevents Next.js from opting into dynamic rendering,
 * allowing the homepage and shop pages to be fully cached or statically generated.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[RFC Store] Supabase environment variables are missing.\n" +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
