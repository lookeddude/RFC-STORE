/**
 * RFC Store — Profile Page (Phase 7)
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm } from "@/components/account/ProfileForm";
import type { ProfileRow } from "@/types/account";

export const metadata: Metadata = {
  title: "My Profile — REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url, role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AccountShell pageTitle="My Profile">
      <ProfileForm
        profile={profile as ProfileRow | null}
        email={user.email ?? ""}
        emailVerified={!!user.email_confirmed_at}
      />
    </AccountShell>
  );
}
