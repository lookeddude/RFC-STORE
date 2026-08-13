/**
 * RFC Store — Admin Settings Page Wrapper (Phase 8)
 * Server component: fetches settings, passes to client for editing.
 */
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsPageClient } from "./SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings — Admin RFC Store",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("store_settings")
    .select("key, value, label")
    .order("key");

  return <SettingsPageClient settings={settings ?? []} />;
}
