/**
 * RFC Store — Sentry Server-side Configuration
 *
 * Captures server component errors, API route errors,
 * and Server Action failures automatically.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: process.env.NODE_ENV === "production",

  // Lower server tracing — server errors are more critical
  tracesSampleRate: 0.05,

  // Capture all server errors
  sampleRate: 1.0,

  debug: false,

  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  initialScope: {
    tags: {
      store: "rfc-store",
      layer: "server",
    },
  },
});
