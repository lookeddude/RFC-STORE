import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapDBHeroSlide, type DBHeroSlide } from "@/lib/data/hero-slides";
import { SlideEditor } from "./SlideEditor";

export const metadata = {
  title: "Edit Hero Slide — Admin RFC Store",
};

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHeroSlidePage({ params }: EditPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const slide = mapDBHeroSlide(data as DBHeroSlide);

  return <SlideEditor initialSlide={slide} />;
}
