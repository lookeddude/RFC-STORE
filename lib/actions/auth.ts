"use server";
/**
 * RFC Store — Auth Server Actions (Phase 7)
 *
 * loginAction  — validates + calls supabase.auth.signInWithPassword
 * signupAction — validates + calls supabase.auth.signUp
 *
 * Security:
 *   - All validation server-side
 *   - Never trust client-provided user IDs
 *   - Passwords never logged or returned
 *   - Email normalized to lowercase
 */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  LoginFormData,
  LoginFormErrors,
  SignupFormData,
  SignupFormErrors,
  AuthActionResult,
} from "@/types/account";

// ── Validation ─────────────────────────────────────────────

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(data: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RX.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  return errors;
}

function validateSignup(data: SignupFormData): SignupFormErrors {
  const errors: SignupFormErrors = {};
  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RX.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

// ── Actions ────────────────────────────────────────────────

export async function loginAction(
  data: LoginFormData,
  redirectTo: string = "/account"
): Promise<AuthActionResult> {
  const fieldErrors = validateLogin(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email.trim().toLowerCase(),
    password: data.password,
  });

  if (error) {
    // Map Supabase errors to customer-friendly messages
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_credentials")
    ) {
      return { success: false, error: "Incorrect email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { success: false, error: "Please verify your email address before logging in." };
    }
    console.error("[RFC Store] Login error:", error.message);
    return { success: false, error: "Login failed. Please try again." };
  }

  // Safe redirect — validate redirect param to prevent open redirect
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/account";
  redirect(safeRedirect);
}

export async function signupAction(data: SignupFormData): Promise<AuthActionResult> {
  const fieldErrors = validateSignup(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      data: {
        full_name: data.fullName.trim(),
      },
    },
  });

  if (error) {
    if (
      error.message.includes("already registered") ||
      error.message.includes("User already registered")
    ) {
      return {
        success: false,
        error: "An account with this email already exists. Please log in.",
        fieldErrors: { email: "This email is already registered." },
      };
    }
    console.error("[RFC Store] Signup error:", error.message);
    return { success: false, error: "Registration failed. Please try again." };
  }

  // Profile auto-created by DB trigger on_auth_user_created
  redirect("/account");
}
