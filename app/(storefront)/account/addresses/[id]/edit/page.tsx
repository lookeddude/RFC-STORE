/**
 * RFC Store — Edit Address Page (Phase 7)
 *
 * Security: Fetches address by id AND user_id — prevents cross-user access.
 * If address not found or doesn't belong to user, 404.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressForm } from "@/components/account/AddressForm";
import type { AddressRow } from "@/types/account";

export const metadata: Metadata = {
  title: "Edit Address — REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

interface EditAddressPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAddressPage({ params }: EditAddressPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/addresses");

  const { id } = await params;

  const { data: address } = await supabase
    .from("addresses")
    .select("id, user_id, label, full_name, phone, line1, line2, city, state, postal_code, country, is_default, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id) // ownership enforced — never trust URL ID alone
    .maybeSingle();

  if (!address) notFound();

  return (
    <AccountShell greeting="Edit Address">
      <AddressForm mode="edit" address={address as AddressRow} />
    </AccountShell>
  );
}
