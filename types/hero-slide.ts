/**
 * RFC Store — Hero Slide Types
 *
 * Full type definitions for CMS-driven Homepage Hero Slideshow.
 */

export type HeroSlideStatus = 'draft' | 'published' | 'disabled';
export type TextPosition    = 'left' | 'center' | 'right';
export type OverlayStrength = 'none' | 'low' | 'medium' | 'high';
export type TransitionStyle = 'fade' | 'slide' | 'crossfade' | 'zoom' | 'none';
export type TransitionSpeed = 'fast' | 'normal' | 'slow';

export interface HeroSlide {
  id:                    string;
  internalName:          string;
  status:                HeroSlideStatus;
  sortOrder:             number;

  desktopImageUrl:       string | null;
  tabletImageUrl:        string | null;
  mobileImageUrl:        string | null;
  desktopImageAlt:       string | null;
  tabletImageAlt:        string | null;
  mobileImageAlt:        string | null;

  eyebrow:               string | null;
  heading:               string;
  description:           string | null;
  primaryButtonText:     string | null;
  primaryButtonUrl:      string | null;
  secondaryButtonText:   string | null;
  secondaryButtonUrl:    string | null;

  textPosition:          TextPosition;
  textAlignment:         TextPosition;
  overlayStrength:       OverlayStrength;

  slideDuration:         number;   // ms
  transitionStyle:       TransitionStyle;
  transitionSpeed:       TransitionSpeed;
  autoplay:              boolean;
  pauseOnHover:          boolean;

  createdAt:             string;
  updatedAt:             string;
  publishedAt:           string | null;
}

export type HeroSlideInput = Omit<
  HeroSlide,
  'id' | 'createdAt' | 'updatedAt' | 'publishedAt'
>;
