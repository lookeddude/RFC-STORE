/**
 * RFC Store — Logout Route Handler
 *
 * POST /api/auth/logout
 *
 * Calls supabase.auth.signOut() to invalidate the session,
 * then redirects to the homepage.
 *
 * Using POST (not GET) to prevent CSRF via image tags / link prefetch.
 * The AccountNav renders a <form method="POST"> to trigger this route.
 */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Redirect to homepage after logout
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    { status: 303 }
  );
}
