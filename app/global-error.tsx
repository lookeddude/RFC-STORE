/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
/**
 * RFC Store — Global Error Boundary (Phase 9)
 *
 * Catches root-level crashes: DB failure, middleware error,
 * corrupted layout, unhandled server exception.
 *
 * SECURITY:
 *   - Never exposes error.message or stack trace to users
 *   - Error is logged server-side via Next.js built-in error reporting
 *   - digest is a safe, non-revealing reference for support
 *
 * Must include <html> and <body> — it replaces the root layout.
 */
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log for internal monitoring — digest is safe (no PII, no secrets)
    console.error("[RFC Store] Global error:", error.digest ?? "no-digest");
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0a0e14",
          fontFamily: "'Inter', system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          textAlign: "center",
        }}
      >
        <div style={{ padding: "32px 24px", maxWidth: 480 }}>
          {/* RFC Logo Mark */}
          <div
            style={{
              width: 56,
              height: 56,
              background: "rgba(230,57,70,0.15)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
            aria-hidden="true"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="2">
              <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>

          <p
            style={{
              color: "#E63946",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            REVIVE FIGHT CLUB
          </p>

          <h1
            style={{
              color: "#ffffff",
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            We ran into an unexpected issue. Our team has been notified.
            {error.digest && (
              <>
                {" "}
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                  Ref: {error.digest}
                </span>
              </>
            )}
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "12px 28px",
                background: "#E63946",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: "12px 28px",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
