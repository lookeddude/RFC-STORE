/**
 * RFC Store — Error State Component
 * Consistent error display with optional retry action.
 */
import React from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn("error-state", className)}
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center" as const,
        padding: "var(--space-12)",
        gap: "var(--space-4)",
        minHeight: "320px",
      }}
    >
      {/* Error icon */}
      <div
        aria-hidden="true"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--color-error-container)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        ⚠
      </div>

      <div style={{ maxWidth: "400px" }}>
        <h3
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "var(--font-headline-md-size)",
            fontWeight: "var(--font-headline-md-weight)",
            marginBottom: "var(--space-2)",
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--font-body-md-size)",
            color: "var(--color-text-secondary)",
            lineHeight: "1.5",
          }}
        >
          {message}
        </p>
      </div>

      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
