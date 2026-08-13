import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Output mode:
  // - Vercel: no output override needed (Vercel handles it natively)
  // - Hostinger Node.js: needs 'standalone' for self-hosted deployment
  output: process.env.VERCEL ? undefined : "standalone",

  // ── Permanent redirects for routes not yet implemented ────
  async redirects() {
    return [
      {
        source: "/categories/:slug",
        destination: "/shop?category=:slug",
        permanent: true,
      },
      { source: "/wholesale", destination: "/shop", permanent: true },
      { source: "/search",    destination: "/shop", permanent: true },
    ];
  },

  // Image optimization — allow Supabase storage domain
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "efmwddxzsdiexzmyccvk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
  },

  // Security headers
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://efmwddxzsdiexzmyccvk.supabase.co https://lh3.googleusercontent.com",
      "connect-src 'self' https://efmwddxzsdiexzmyccvk.supabase.co wss://efmwddxzsdiexzmyccvk.supabase.co https://*.sentry.io",
      "media-src 'self'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: cspDirectives },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "DENY" },
          { key: "X-XSS-Protection",        value: "1; mode=block" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },

  // TypeScript — fail the build on type errors in production
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry project config — set these after creating your Sentry project:
  //   SENTRY_ORG, SENTRY_PROJECT in .env.local or Vercel env vars
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in CI/production (not local dev)
  silent: !process.env.CI,

  // Disable source map upload if no SENTRY_AUTH_TOKEN is set
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
