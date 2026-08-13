/**
 * RFC Store — Next.js Proxy (formerly Middleware)
 *
 * Next.js 16 renamed the middleware convention to "proxy".
 * This file was previously middleware.ts — migrated per Next.js 16 convention.
 *
 * Responsibilities in Phase 1:
 *   1. Refresh Supabase auth session on every request
 *   2. Route protection foundation (guards enabled in Phase 2)
 *
 * Future phases will add:
 *   - Protected route enforcement (account, admin)
 *   - Role-based access control
 *   - Rate limiting
 *
 * IMPORTANT: This proxy runs on the Edge Runtime.
 * Do not import Node.js-only modules here.
 */
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are not configured, skip Supabase middleware
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session — IMPORTANT: do not add logic between here and returning.
  // See: https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Phase 7: Protected Route Guards ───────────────────
  const pathname = request.nextUrl.pathname;
  const isAccountRoute = pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAccountRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Phase 8: Admin Route Guard (Edge) ─────────────────
  // Role check cannot happen here (DB round-trip not available on Edge with anon key)
  // Full role verification happens in the admin layout (server component)
  if (isAdminRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", "/admin");
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, site.webmanifest, robots.txt, sitemap.xml
     * - Public assets: /icon-*, /apple-touch-icon.png, /og-image.jpg
     */
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|robots.txt|sitemap.xml|icon-|apple-touch-icon|og-image).*)",
  ],
};
