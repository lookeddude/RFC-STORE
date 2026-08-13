/**
 * RFC Store — Add Address Page (Phase 7)
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressForm } from "@/components/account/AddressForm";

export const metadata: Metadata = {
  title: "Add Address — REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

export default async function NewAddressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/addresses/new");

  return (
    <AccountShell greeting="Add Address">
      <AddressForm mode="add" />
    </AccountShell>
  );
}
