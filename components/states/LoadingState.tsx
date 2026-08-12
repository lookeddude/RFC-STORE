/**
 * RFC Store — Loading State Component
 * Reusable loading skeleton and spinner for async content.
 */
import React from "react";
import { cn } from "@/lib/utils/cn";

interface LoadingStateProps {
  /** Display mode */
  variant?: "spinner" | "skeleton" | "page";
  /** Descriptive text for screen readers */
  label?: string;
  className?: string;
}

export function LoadingState({
  variant = "spinner",
  label = "Loading...",
  className,
}: LoadingStateProps) {
  if (variant === "page") {
    return (
      <div
        className={cn("loading-page", className)}
        role="status"
        aria-label={label}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div className="loading-spinner" aria-hidden="true" />
        <span
          style={{
            fontFamily: "var(--font-label)",
            fontSize: "var(--font-label-bold-size)",
            fontWeight: "var(--font-label-bold-weight)",
            letterSpacing: "var(--font-label-bold-letter-spacing)",
            textTransform: "uppercase" as const,
            color: "var(--color-text-secondary)",
          }}
        >
          {label}
        </span>
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div
        className={cn("loading-skeleton", className)}
        role="status"
        aria-label={label}
        style={{
          borderRadius: "var(--radius-default)",
          backgroundColor: "var(--color-surface-container)",
          animation: "skeleton-pulse 1.5s ease-in-out infinite",
          minHeight: "120px",
        }}
      >
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn("loading-spinner-wrapper", className)}
      role="status"
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="loading-spinner"
        aria-hidden="true"
        style={{
          width: "24px",
          height: "24px",
          border: "2px solid var(--color-outline-variant)",
          borderTopColor: "var(--color-secondary)",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
