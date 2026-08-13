/**
 * RFC Store — Admin Image Upload API (Phase 8)
 *
 * Security:
 *   - POST only
 *   - Admin role verified via DB query (server-side)
 *   - File type validated (MIME + extension)
 *   - File size capped at 5MB
 *   - Safe filename: UUID-based path
 *   - Uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *     so the service-role key never reaches the browser
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = "product-images";

function getExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mimeType] ?? "jpg";
}

export async function POST(request: NextRequest) {
  // ── Auth check ─────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["admin", "super_admin"].includes(profile.role ?? "")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // ── Parse form data ─────────────────────────────────────
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // ── File validation ─────────────────────────────────────
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size: 5MB" },
      { status: 400 }
    );
  }

  // ── Safe filename ───────────────────────────────────────
  const ext = getExt(file.type);
  const uuid = crypto.randomUUID();
  const path = `products/${uuid}.${ext}`;

  // ── Upload with service-role client (bypasses Storage RLS for server-side upload) ──
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );
  }

  const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: uploadError } = await adminSupabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // ── Get public URL ──────────────────────────────────────
  const { data: urlData } = adminSupabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    url: urlData.publicUrl,
    path,
  });
}
