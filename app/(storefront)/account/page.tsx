/**
 * RFC Store — Account Dashboard Page (Phase 7)
 *
 * Fetches:
 *  - authenticated user (session)
 *  - profile row (full_name, phone)
 *  - most recent order (1 row, minimal columns)
 *  - default address
 *
 * All fetched server-side. User ID is derived from session — never trusted from URL.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/account/AccountShell";
import { DashboardClient } from "@/components/account/DashboardClient";
import type { ProfileRow, AddressRow, OrderListItem } from "@/types/account";

export const metadata: Metadata = {
  title: "My Account — REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

export default async function AccountDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  // Parallel fetch: profile, recent order, default address
  const [profileRes, ordersRes, addressRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url, role, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("orders")
      .select("id, order_number, status, payment_status, total_amount, currency, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),

    supabase
      .from("addresses")
      .select("id, user_id, label, full_name, phone, line1, line2, city, state, postal_code, country, is_default, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
  ]);

  const profile = profileRes.data as ProfileRow | null;
  const defaultAddress = addressRes.data as AddressRow | null;

  // Build OrderListItem for the most recent order (no item_count join needed here)
  let recentOrder: OrderListItem | null = null;
  if (ordersRes.data && ordersRes.data.length > 0) {
    const o = ordersRes.data[0] as {
      id: string; order_number: string; status: string;
      payment_status: string; total_amount: number; currency: string; created_at: string;
    };
    recentOrder = { ...o, item_count: 0 };
  }

  const displayName = profile?.full_name ?? user.email?.split("@")[0] ?? "Fighter";

  return (
    <AccountShell
      greeting={`Welcome Back, ${displayName}`}
      subheading="Manage your gear, orders, and training preferences."
    >
      <DashboardClient
        profile={profile}
        recentOrder={recentOrder}
        defaultAddress={defaultAddress}
        email={user.email ?? ""}
      />
    </AccountShell>
  );
}
