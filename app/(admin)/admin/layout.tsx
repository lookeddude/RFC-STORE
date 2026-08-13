/**
 * RFC Store — Admin Layout (Phase 8)
 *
 * Security layers:
 *   1. Edge (proxy.ts): blocks unauthenticated users
 *   2. HERE (server): DB role check — blocks non-admin authenticated users
 *
 * Uses the Supabase service-role client to bypass RLS for the role check
 * itself (avoiding the chicken-and-egg problem where a customer's RLS
 * policies prevent reading their own role for the admin check).
 *
 * The AdminShell (client) handles sidebar and mobile nav.
 * The storefront Navbar and Footer are NOT present in admin routes.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin — REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Layer 2: Get authenticated user (cryptographically verified)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // Layer 3: DB role check — is this user actually an admin?
  // We query the profiles table for the role column.
  // The admin_select_all_profiles RLS policy allows admins to select.
  // But for the initial check, the user's own RLS (profiles_select_own) applies.
  // This works because: SELECT self → profiles_select_own (own row) → get role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;
  if (!profile || !["admin", "super_admin"].includes(role ?? "")) {
    // Silent redirect — do not reveal admin panel exists
    redirect("/");
  }

  return (
    <AdminShell
      adminName={profile.full_name ?? ""}
      adminEmail={profile.email}
      adminRole={role === "super_admin" ? "Super Admin" : "Admin"}
    >
      {children}
    </AdminShell>
  );
}
