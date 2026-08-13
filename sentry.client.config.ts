/**
 * RFC Store — Sentry Client-side Configuration
 *
 * Setup:
 *   1. Create free account at https://sentry.io
 *   2. Create a new Next.js project
 *   3. Copy the DSN from: Settings → Projects → [your project] → Client Keys
 *   4. Add to .env.local: NEXT_PUBLIC_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
 *   5. Add to Vercel env vars: NEXT_PUBLIC_SENTRY_DSN
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production — skip in local dev
  enabled: process.env.NODE_ENV === "production",

  // Capture 10% of sessions for performance monitoring (free tier friendly)
  tracesSampleRate: 0.1,

  // Capture 100% of errors
  // Adjust in production if volume is high
  sampleRate: 1.0,

  // Show readable stack traces in development
  debug: false,

  // Identify your release for source maps
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Tag all errors with store name
  initialScope: {
    tags: {
      store: "rfc-store",
      environment: process.env.NODE_ENV,
    },
  },
});
