"use client";

/**
 * RFC Store — Button Component
 *
 * Variants map directly to the Stitch design specification:
 *   primary  → Coral Red bg, White text (CTA buttons)
 *   secondary → Dark Navy bg, White text (secondary actions)
 *   ghost    → Transparent bg, Dark Navy 1.5px border (tertiary actions)
 *   danger   → Error red bg (destructive actions)
 *
 * All variants use label-bold typography (Inter 600, 0.05em tracking, uppercase).
 * Button radius: 2px (--radius-sm) per Stitch specification.
 */
import React from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Render as a full-width block button */
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        fullWidth && styles["btn--full"],
        isLoading && styles["btn--loading"],
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
      <span className={isLoading ? styles["btn__label--loading"] : undefined}>
        {children}
      </span>
    </button>
  );
}
