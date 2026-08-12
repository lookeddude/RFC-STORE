/**
 * RFC Store — Card Component
 *
 * Stitch spec:
 *   - Minimalist white background
 *   - 4px radius (--radius-default)
 *   - 1px border (#E2E8F0 / outline-variant) — no shadow at rest
 *   - Hover: sharp diffusion shadow (0 10px 20px rgba(10,14,20,0.05))
 */
import React from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Whether to apply the interactive hover effect */
  interactive?: boolean;
  /** Padding variant */
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "padding: var(--space-4)",
  md: "padding: var(--space-6)",
  lg: "padding: var(--space-8)",
};

export function Card({
  children,
  className,
  interactive = false,
  padding = "md",
}: CardProps) {
  const paddingValue =
    padding === "none"
      ? "0"
      : padding === "sm"
      ? "var(--space-4)"
      : padding === "lg"
      ? "var(--space-8)"
      : "var(--space-6)";

  return (
    <div
      className={cn("rfc-card", interactive && "rfc-card--interactive", className)}
      style={
        {
          "--card-padding": paddingValue,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

/** Card.Header — optional header section */
Card.Header = function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rfc-card__header", className)}>{children}</div>
  );
};

/** Card.Body — main content area */
Card.Body = function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("rfc-card__body", className)}>{children}</div>;
};

/** Card.Footer — optional footer section */
Card.Footer = function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rfc-card__footer", className)}>{children}</div>
  );
};
