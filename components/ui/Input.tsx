"use client";

/**
 * RFC Store — Input Component
 *
 * Stitch spec:
 *   - Bottom-border only (1px, --color-outline)
 *   - Focus: 2px Coral Red bottom-border
 *   - No rounded corners on storefront inputs
 *   - Font: Inter Body MD
 */
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Show a full 4-sided border (for admin/forms context) */
  bordered?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, bordered = false, className, id, ...props },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            styles.input,
            bordered && styles["input--bordered"],
            error && styles["input--error"],
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
              ? `${inputId}-hint`
              : undefined
          }
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            className={styles.errorText}
            role="alert"
          >
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className={styles.hintText}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
