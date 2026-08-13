/**
 * RFC Store — Account Dashboard Page (Redesigned)
 *
 * Fetches:
 *  - authenticated user (session)
 *  - profile row
 *  - most recent order WITH real item count
 *  - default address
 *
 * AccountShell independently fetches profile + counts for the identity bar.
 * This page fetches the richer dashboard data for DashboardClient.
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

  // Build recent order with REAL item count
  let recentOrder: OrderListItem | null = null;
  if (ordersRes.data && ordersRes.data.length > 0) {
    const o = ordersRes.data[0] as {
      id: string; order_number: string; status: string;
      payment_status: string; total_amount: number; currency: string; created_at: string;
    };

    // Fetch real item count for this order
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("quantity")
      .eq("order_id", o.id);

    const itemCount = (itemRows ?? []).reduce(
      (sum: number, r: { quantity: number }) => sum + r.quantity, 0
    );

    recentOrder = { ...o, item_count: itemCount };
  }

  return (
    <AccountShell>
      <DashboardClient
        profile={profile}
        recentOrder={recentOrder}
        defaultAddress={defaultAddress}
        email={user.email ?? ""}
      />
    </AccountShell>
  );
}
