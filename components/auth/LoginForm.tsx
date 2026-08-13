"use client";
/**
 * RFC Store — Login Form (Phase 7)
 *
 * Client component: manages form state + calls loginAction.
 * Uses useSearchParams to forward the redirect param.
 */
import React, { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import type { LoginFormData, LoginFormErrors } from "@/types/account";
import formStyles from "./AuthForm.module.css";

const INITIAL: LoginFormData = { email: "", password: "" };

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";

  const [formData, setFormData] = useState<LoginFormData>(INITIAL);
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
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
        const result = await loginAction(formData, redirectTo);
        if (result && !result.success) {
          if (result.fieldErrors) setFieldErrors(result.fieldErrors as LoginFormErrors);
          setServerError(result.error ?? "Something went wrong.");
        }
        // On success, loginAction calls redirect() — no further handling needed
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

      {/* Email */}
      <div className={formStyles.field}>
        <label htmlFor="login-email" className={formStyles.label}>
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={formStyles.input}
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          aria-required="true"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          disabled={isPending}
        />
        {fieldErrors.email && (
          <span id="login-email-error" className={formStyles.error} role="alert">
            {fieldErrors.email}
          </span>
        )}
      </div>

      {/* Password */}
      <div className={formStyles.field}>
        <label htmlFor="login-password" className={formStyles.label}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className={formStyles.input}
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          aria-required="true"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
          disabled={isPending}
        />
        {fieldErrors.password && (
          <span id="login-password-error" className={formStyles.error} role="alert">
            {fieldErrors.password}
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
            Signing In...
          </>
        ) : (
          "SIGN IN"
        )}
      </button>
    </form>
  );
}
