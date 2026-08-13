/**
 * RFC Store — Hero Slides Data Access Layer
 *
 * Server-only module to query published hero slides from Supabase.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { HeroSlide } from "@/types/hero-slide";

export interface DBHeroSlide {
  id: string;
  internal_name: string;
  status: 'draft' | 'published' | 'disabled';
  sort_order: number;
  desktop_image_url: string | null;
  tablet_image_url: string | null;
  mobile_image_url: string | null;
  desktop_image_alt: string | null;
  tablet_image_alt: string | null;
  mobile_image_alt: string | null;
  eyebrow: string | null;
  heading: string;
  description: string | null;
  primary_button_text: string | null;
  primary_button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  text_position: 'left' | 'center' | 'right';
  text_alignment: 'left' | 'center' | 'right';
  overlay_strength: 'none' | 'low' | 'medium' | 'high';
  slide_duration: number;
  transition_style: 'fade' | 'slide' | 'crossfade' | 'zoom' | 'none';
  transition_speed: 'fast' | 'normal' | 'slow';
  autoplay: boolean;
  pause_on_hover: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export function mapDBHeroSlide(raw: DBHeroSlide): HeroSlide {
  return {
    id: raw.id,
    internalName: raw.internal_name,
    status: raw.status,
    sortOrder: raw.sort_order,
    desktopImageUrl: raw.desktop_image_url,
    tabletImageUrl: raw.tablet_image_url,
    mobileImageUrl: raw.mobile_image_url,
    desktopImageAlt: raw.desktop_image_alt,
    tabletImageAlt: raw.tablet_image_alt,
    mobileImageAlt: raw.mobile_image_alt,
    eyebrow: raw.eyebrow,
    heading: raw.heading,
    description: raw.description,
    primaryButtonText: raw.primary_button_text,
    primaryButtonUrl: raw.primary_button_url,
    secondaryButtonText: raw.secondary_button_text,
    secondaryButtonUrl: raw.secondary_button_url,
    textPosition: raw.text_position || 'left',
    textAlignment: raw.text_alignment || 'left',
    overlayStrength: raw.overlay_strength || 'medium',
    slideDuration: raw.slide_duration || 5000,
    transitionStyle: raw.transition_style || 'fade',
    transitionSpeed: raw.transition_speed || 'normal',
    autoplay: raw.autoplay ?? true,
    pauseOnHover: raw.pause_on_hover ?? true,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    publishedAt: raw.published_at,
  };
}

/**
 * Fetches all published hero slides ordered by sort_order.
 */
export async function getPublishedHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return [];
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[getPublishedHeroSlides] Supabase error:", error.message);
      return [];
    }

    return (data as unknown as DBHeroSlide[]).map(mapDBHeroSlide);
  } catch (err) {
    console.error("[getPublishedHeroSlides] Error fetching hero slides:", err);
    return [];
  }
}
