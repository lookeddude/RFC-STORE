/**
 * RFC Store — Admin Authorization Helper (Phase 8)
 *
 * All admin server actions MUST call getAdminUser() first.
 * This provides a consistent, centralized security check.
 *
 * Pattern:
 *   const adminUser = await getAdminUser();
 *   if (!adminUser) return { success: false, error: 'Unauthorized' };
 */
import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "super_admin";
}

/**
 * Validates that the current session belongs to an admin.
 * Returns the admin user profile, or null if unauthorized.
 * NEVER throws — returns null so callers can handle gracefully.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return null;
    if (!["admin", "super_admin"].includes(profile.role ?? "")) return null;

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as "admin" | "super_admin",
    };
  } catch {
    return null;
  }
}

/** Standard unauthorized result for server actions */
export const UNAUTHORIZED = {
  success: false as const,
  error: "Unauthorized. Admin access required.",
};
