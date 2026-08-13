/**
 * RFC Store — SEO & Site Metadata Configuration
 *
 * All metadata for Next.js generateMetadata() functions lives here.
 * Future phases will extend this with per-page overrides.
 */
import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://rfc-store.vercel.app";

export const siteConfig = {
  name: "REVIVE FIGHT CLUB",
  shortName: "RFC",
  url: siteUrl,
  description:
    "Premium combat sports equipment and athletic gear for fighters who demand the best. Boxing gloves, MMA gear, training equipment and more.",
  keywords: [
    "boxing gloves",
    "MMA gear",
    "combat sports",
    "fight gear",
    "training equipment",
    "boxing equipment",
    "revive fight club",
    "RFC store",
  ],
  ogImage: `${siteUrl}/og-image.jpg`,
  creator: "Revive Fight Club",
} as const;

/**
 * Default metadata applied to every page.
 * Individual pages should call generateMetadata() to override specific fields.
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords] as string[],
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Premium Combat Sports Equipment`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@revivefightclub",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",   sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",   sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
};
