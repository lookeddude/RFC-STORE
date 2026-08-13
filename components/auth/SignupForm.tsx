"use client";
/**
 * RFC Store — Signup Form (Phase 7)
 */
import React, { useState, useTransition } from "react";
import { signupAction } from "@/lib/actions/auth";
import type { SignupFormData, SignupFormErrors } from "@/types/account";
import formStyles from "./AuthForm.module.css";

const INITIAL: SignupFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>(INITIAL);
  const [fieldErrors, setFieldErrors] = useState<SignupFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof SignupFormErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const result = await signupAction(formData);
        if (result && !result.success) {
          if (result.fieldErrors) setFieldErrors(result.fieldErrors as SignupFormErrors);
          setServerError(result.error ?? "Something went wrong.");
        }
      } catch {
        setServerError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className={formStyles.serverError} role="alert" aria-live="assertive">
          {serverError}
        </div>
      )}

      {/* Full Name */}
      <div className={formStyles.field}>
        <label htmlFor="signup-name" className={formStyles.label}>Full Name</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          className={formStyles.input}
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          aria-required="true"
          aria-invalid={!!fieldErrors.fullName}
          aria-describedby={fieldErrors.fullName ? "signup-name-error" : undefined}
          disabled={isPending}
        />
        {fieldErrors.fullName && (
          <span id="signup-name-error" className={formStyles.error} role="alert">
            {fieldErrors.fullName}
          </span>
        )}
      </div>

      {/* Email */}
      <div className={formStyles.field}>
        <label htmlFor="signup-email" className={formStyles.label}>Email Address</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          className={formStyles.input}
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          aria-required="true"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
          disabled={isPending}
        />
        {fieldErrors.email && (
          <span id="signup-email-error" className={formStyles.error} role="alert">
            {fieldErrors.email}
          </span>
        )}
      </div>

      {/* Password */}
      <div className={formStyles.field}>
        <label htmlFor="signup-password" className={formStyles.label}>Password</label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          className={formStyles.input}
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          aria-required="true"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
          disabled={isPending}
          minLength={8}
        />
        {fieldErrors.password && (
          <span id="signup-password-error" className={formStyles.error} role="alert">
            {fieldErrors.password}
          </span>
        )}
      </div>

      {/* Confirm Password */}
      <div className={formStyles.field}>
        <label htmlFor="signup-confirm" className={formStyles.label}>Confirm Password</label>
        <input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          className={formStyles.input}
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          aria-required="true"
          aria-invalid={!!fieldErrors.confirmPassword}
          aria-describedby={fieldErrors.confirmPassword ? "signup-confirm-error" : undefined}
          disabled={isPending}
        />
        {fieldErrors.confirmPassword && (
          <span id="signup-confirm-error" className={formStyles.error} role="alert">
            {fieldErrors.confirmPassword}
          </span>
        )}
      </div>

      <button
        type="submit"
        className={formStyles.submitBtn}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <span className={formStyles.spinner} aria-hidden="true" />
            Creating Account...
          </>
        ) : (
          "CREATE ACCOUNT"
        )}
      </button>
    </form>
  );
}
