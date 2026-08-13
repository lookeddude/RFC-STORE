/**
 * RFC Store — Hero Slideshow Server Component
 *
 * Queries published hero slides from Supabase.
 * If published slides exist → renders dynamic HeroSlideshowClient.
 * If zero published slides exist → gracefully falls back to static HeroSection.
 */
import { getPublishedHeroSlides } from "@/lib/data/hero-slides";
import { HeroSlideshowClient } from "./HeroSlideshowClient";
import { HeroSection } from "./HeroSection";

export async function HeroSlideshow() {
  const slides = await getPublishedHeroSlides();

  if (slides.length === 0) {
    return <HeroSection />;
  }

  return <HeroSlideshowClient slides={slides} />;
}
