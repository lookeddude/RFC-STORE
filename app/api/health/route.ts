/**
 * RFC Store — Supabase Health Check API
 *
 * GET /api/health
 *
 * Verifies that the application can communicate with the configured
 * Supabase project. Safe to call publicly — no secrets or data
 * are exposed in the response.
 *
 * Response shape:
 * {
 *   status: "ok" | "error",
 *   timestamp: string (ISO 8601),
 *   supabase: boolean,
 *   environment: "development" | "production",
 *   error?: string  // sanitised error message only in development
 * }
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const timestamp = new Date().toISOString();
  const isDev = process.env.NODE_ENV === "development";

  try {
    const supabase = await createClient();

    // Lightweight connectivity check — fetch Supabase auth config
    // This does NOT expose any user data or internal tables.
    const { error } = await supabase.auth.getSession();

    if (error && error.message && !error.message.includes("session")) {
      // Real connectivity error (not just "no active session" which is fine)
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        status: "ok",
        timestamp,
        supabase: true,
        environment: isDev ? "development" : "production",
        project: "efmwddxzsdiexzmyccvk",
      },
      { status: 200 }
    );
  } catch (err) {
    const message =
      isDev && err instanceof Error ? err.message : "Connection check failed";

    return NextResponse.json(
      {
        status: "error",
        timestamp,
        supabase: false,
        environment: isDev ? "development" : "production",
        error: message,
      },
      { status: 503 }
    );
  }
}
