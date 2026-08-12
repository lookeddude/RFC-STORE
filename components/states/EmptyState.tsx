/**
 * RFC Store — Empty State Component
 * Consistent empty-content display with optional CTA.
 */
import React from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "📦",
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn("empty-state", className)}
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
      <div aria-hidden="true" style={{ fontSize: "48px" }}>
        {icon}
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
        {message && (
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
        )}
      </div>

      {action && (
        <Button
          variant="primary"
          size="md"
          onClick={action.onClick}
          {...(action.href
            ? { as: "a" as unknown as undefined, href: action.href }
            : {})}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
