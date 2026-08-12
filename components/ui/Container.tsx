/**
 * RFC Store — Container Component
 *
 * Responsive max-width container matching the Stitch layout spec:
 *   - Max width: 1440px
 *   - Mobile padding: 16px
 *   - Tablet padding: 24px (gutter)
 *   - Desktop padding: 64px (margin-desktop)
 */
import React from "react";
import { cn } from "@/lib/utils/cn";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  /** Whether to allow full bleed (no max-width) */
  fluid?: boolean;
  as?: React.ElementType;
}

export function Container({
  children,
  className,
  fluid = false,
  as: Component = "div",
  ...rest
}: ContainerProps) {
  return (
    <Component
      className={cn("container", fluid && "container--fluid", className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
