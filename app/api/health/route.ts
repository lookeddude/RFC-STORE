/**
 * RFC Store — Supabase Health Check API
 *
 * GET /api/health
 *
 * Verifies connectivity for both Supabase clients:
 *   - Anon client (public user-facing queries)
 *   - Admin client (service role, server-side operations)
 *
 * Safe to call publicly — no secrets or user data are exposed in the response.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const timestamp = new Date().toISOString();
  const isDev = process.env.NODE_ENV === "development";

  const result = {
    status: "ok" as "ok" | "error",
    timestamp,
    environment: isDev ? "development" : "production",
    project: "efmwddxzsdiexzmyccvk",
    checks: {
      anonClient: false,
      adminClient: false,
    },
    error: undefined as string | undefined,
  };

  // ── Check 1: Anon Client (session-based) ──────────────
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (!error || error.message.includes("session")) {
      result.checks.anonClient = true;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    result.status = "error";
    result.error = isDev ? `Anon client: ${msg}` : "Anon client check failed";
  }

  // ── Check 2: Admin Client (service role) ─────────────
  try {
    const admin = createAdminClient();
    // Lightweight check — list auth users (returns empty array on fresh project)
    const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!error) {
      result.checks.adminClient = true;
    } else {
      throw new Error(error.message);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    result.status = "error";
    result.error = isDev
      ? `Admin client: ${msg}`
      : "Admin client check failed. Ensure SUPABASE_SERVICE_ROLE_KEY is set.";
  }

  const httpStatus =
    result.checks.anonClient && result.checks.adminClient ? 200 : 503;

  // Remove undefined fields from response
  const response = Object.fromEntries(
    Object.entries(result).filter(([, v]) => v !== undefined)
  );

  return NextResponse.json(response, { status: httpStatus });
}
