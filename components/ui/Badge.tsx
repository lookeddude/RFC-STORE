/**
 * RFC Store — Badge Component
 *
 * Stitch spec:
 *   - Square-edged rectangular shape (no pill)
 *   - Dark Navy bg, white uppercase text for standard badges
 *   - Coral Red bg for accent/urgent badges
 *   - Tiny uppercase Inter Bold text
 *
 * Styles come from globals.css (.badge) — variants applied via inline style overrides.
 */
import React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant = "default" | "accent" | "outline" | "success" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const badgeStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--color-primary)",
    color: "var(--color-on-primary)",
  },
  accent: {
    backgroundColor: "var(--color-secondary)",
    color: "var(--color-on-secondary)",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--color-primary)",
    border: "1px solid var(--color-primary)",
  },
  success: {
    backgroundColor: "#166534",
    color: "#ffffff",
  },
  warning: {
    backgroundColor: "#92400e",
    color: "#ffffff",
  },
};

export function Badge({
  variant = "default",
  children,
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={cn("badge", className)}
      style={{ ...badgeStyles[variant], ...style }}
    >
      {children}
    </span>
  );
}
