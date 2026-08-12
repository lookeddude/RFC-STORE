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

  // ── Future Phase 2+: Protected Route Guards ──────────
  // Uncomment and extend when authentication is implemented:
  //
  // const isAccountRoute = request.nextUrl.pathname.startsWith('/account');
  // const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  //
  // if (isAccountRoute && !user) {
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  //   return NextResponse.redirect(loginUrl);
  // }
  //
  // if (isAdminRoute && (!user || userRole !== 'admin')) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  // Suppress unused variable warning — user will be used in Phase 2
  void user;

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
