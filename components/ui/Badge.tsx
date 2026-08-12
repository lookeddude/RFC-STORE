/**
 * RFC Store — Badge Component
 *
 * Stitch spec:
 *   - Square-edged rectangular shape (no pill)
 *   - Dark Navy bg, white uppercase text for standard badges
 *   - Coral Red bg for accent/urgent badges
 *   - Tiny uppercase Inter Bold text
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

const variantStyles: Record<BadgeVariant, string> = {
  default: "badge--default",
  accent: "badge--accent",
  outline: "badge--outline",
  success: "badge--success",
  warning: "badge--warning",
};

export function Badge({
  variant = "default",
  children,
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={cn("badge", `badge--${variantStyles[variant] ? variant : "default"}`, className)}
      style={{ ...badgeStyles[variant], ...style }}
    >
      {children}
    </span>
  );
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

// Inline global badge styles injected once
export const badgeGlobalStyles = `
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 0; /* square-edged per Stitch spec */
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}
`;
