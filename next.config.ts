import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration — 'standalone' for Node.js deployments (Vercel, Hostinger Node)
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
          // Legacy XSS filter (belt + braces with CSP in Phase 6)
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
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Remove fingerprinting header
          {
            key: "X-Powered-By",
            value: "",
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
