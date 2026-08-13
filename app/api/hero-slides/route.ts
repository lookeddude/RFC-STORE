import { NextResponse } from "next/server";
import { getPublishedHeroSlides } from "@/lib/data/hero-slides";

export async function GET() {
  const slides = await getPublishedHeroSlides();
  return NextResponse.json({ slides });
}
