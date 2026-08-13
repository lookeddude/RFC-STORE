import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output mode:
  // - Vercel: no output override needed (Vercel handles it natively)
  // - Hostinger Node.js: needs 'standalone' for self-hosted deployment
  // process.env.VERCEL is automatically set to '1' on Vercel builds
  output: process.env.VERCEL ? undefined : "standalone",


  // ── Permanent redirects for routes not yet implemented ────
  // These routes appear in the navbar and content links.
  // They redirect to /shop until dedicated pages are built.
  // 308 Permanent Redirect — search engines transfer link equity.
  async redirects() {
    return [
      // Category slug → filtered shop view
      // (e.g. DisciplineGrid cards: /categories/boxing → /shop?category=boxing)
      {
        source: "/categories/:slug",
        destination: "/shop?category=:slug",
        permanent: true,
      },
      // Other placeholder routes → shop
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
        // Google Stitch design reference images (dev only)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
  },

  // Security headers — applied to all routes
  async headers() {
    // ── Content Security Policy ──────────────────────────────
    // Using report-only mode to catch violations without breaking functionality.
    // Upgrade to Content-Security-Policy (enforce) after verifying no violations in prod.
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: self + inline scripts (Next.js requires 'unsafe-inline' without nonces)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: self + inline (CSS-in-JS / CSS Modules) + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: self + Google Fonts CDN
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Supabase storage + Google Stitch design images (product images)
      "img-src 'self' data: blob: https://efmwddxzsdiexzmyccvk.supabase.co https://lh3.googleusercontent.com",
      // Connections: self + Supabase API (auth, DB, realtime, storage)
      "connect-src 'self' https://efmwddxzsdiexzmyccvk.supabase.co wss://efmwddxzsdiexzmyccvk.supabase.co",
      // Media: self only
      "media-src 'self'",
      // Frames: deny (no iframes needed)
      "frame-src 'none'",
      // Frame ancestors: deny clickjacking
      "frame-ancestors 'none'",
      // Forms: self only
      "form-action 'self'",
      // Base URI: self only
      "base-uri 'self'",
      // Object/embed: none
      "object-src 'none'",
      // Upgrade insecure requests in production
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy (report-only — upgrade to enforce after prod verification)
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspDirectives,
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Legacy XSS filter (belt + braces with CSP above)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Disable unused browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },


  // TypeScript — fail the build on type errors in production
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
