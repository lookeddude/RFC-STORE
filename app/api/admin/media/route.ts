/**
 * RFC Store — Admin Media List API (Phase 8)
 * Returns list of files from the product-images bucket.
 * Admin-only.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (!["admin", "super_admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ images: [] });
  }

  const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

  const { data: files } = await adminSupabase.storage
    .from("product-images")
    .list("products", { limit: 200, offset: 0, sortBy: { column: "created_at", order: "desc" } });

  const images = (files ?? []).map((f) => {
    const { data: urlData } = adminSupabase.storage
      .from("product-images")
      .getPublicUrl(`products/${f.name}`);
    return {
      name: `products/${f.name}`,
      url: urlData.publicUrl,
      size: f.metadata?.size,
      created_at: f.created_at,
    };
  });

  return NextResponse.json({ images });
}
