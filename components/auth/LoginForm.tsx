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
import { createClient } from "@/lib/supabase/client";
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
  const [isGooglePending, setIsGooglePending] = useState(false);


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
      } catch (err: unknown) {
        // Next.js redirect() throws internally — do NOT treat it as an error
        if (
          err instanceof Error &&
          (err.message === "NEXT_REDIRECT" ||
            (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
        ) {
          return; // Successful redirect — ignore
        }
        setServerError("An unexpected error occurred. Please try again.");
      }
    });
  };

  const handleGoogleSignIn = async () => {
    setIsGooglePending(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) {
        setServerError("Could not sign in with Google. Please try again.");
        setIsGooglePending(false);
      }
      // On success, browser is redirected by Supabase — no further action needed
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsGooglePending(false);
    }
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
        disabled={isPending || isGooglePending}
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

      {/* Divider */}
      <div className={formStyles.divider}>or</div>

      {/* Google Sign In */}
      <button
        type="button"
        className={formStyles.googleBtn}
        onClick={handleGoogleSignIn}
        disabled={isPending || isGooglePending}
        aria-label="Sign in with Google"
      >
        {isGooglePending ? (
          <>
            <span className={formStyles.spinner} style={{ borderTopColor: '#4285F4', borderColor: 'rgba(66,133,244,0.3)' }} aria-hidden="true" />
            Connecting...
          </>
        ) : (
          <>
            {/* Official Google G icon */}
            <svg className={formStyles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>
    </form>
  );
}
