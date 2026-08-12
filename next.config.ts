import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration — 'standalone' for Node.js deployments (Vercel, Hostinger Node)
  // Switch to 'export' for fully static if dynamic features are not required in later phases
  output: "standalone",

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
    // Default image sizes matching RFC design grid
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
  },

  // Security headers — applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
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
