import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapDBHeroSlide, type DBHeroSlide } from "@/lib/data/hero-slides";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (!["admin", "super_admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const slides = (data as DBHeroSlide[]).map(mapDBHeroSlide);
  return NextResponse.json({ slides });
}
