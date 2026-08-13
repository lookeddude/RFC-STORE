/**
 * RFC Store — Account Layout (Phase 7)
 *
 * This layout applies to all /account/* pages.
 * Server component: fetches session and profile.
 *
 * Security: middleware (proxy.ts) handles the primary redirect for
 * unauthenticated users. This layout provides a secondary guard.
 *
 * No-index: account pages are never public.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Secondary guard — proxy handles primary
  if (!user) {
    redirect("/login?redirect=/account");
  }

  return <>{children}</>;
}
