/**
 * RFC Store — OAuth Callback Handler
 *
 * Supabase sends the user back here after Google OAuth.
 * This route exchanges the auth code for a session, then
 * redirects the user to their intended destination.
 *
 * URL: /auth/callback?code=xxx&next=/account
 *
 * Guest order claiming:
 *   After a successful OAuth login we attempt to associate any guest orders
 *   (user_id = null) whose customer_email matches this user's email.
 *   This is silent and non-blocking — a failure does not abort the redirect.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils/validation";
import { claimGuestOrders } from "@/lib/actions/orders";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Validate next param to prevent open redirect attacks
  const next = safeRedirectPath(searchParams.get("next"), "/account");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Claim any guest orders placed with this email before redirecting.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          await claimGuestOrders(user.id, user.email);
        }
      } catch (claimErr) {
        // Never let claiming failure block the OAuth redirect
        console.error("[RFC Auth] Guest order claim failed:", claimErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[RFC Auth] OAuth code exchange failed:", error.message);
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=Could+not+sign+in+with+Google.+Please+try+again.`
  );
}
