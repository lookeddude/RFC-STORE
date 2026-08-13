"use server";
/**
 * RFC Store — Profile Server Actions (Phase 7)
 *
 * updateProfileAction — updates full_name and phone on profiles table.
 *
 * Email changes:
 *   Email is managed by Supabase Auth (auth.users.email).
 *   Changing email requires supabase.auth.updateUser({ email }) which
 *   triggers a verification flow. Not implemented in Phase 7 UI but
 *   the architecture is correct — never directly UPDATE profiles.email.
 *
 * Security:
 *   - auth.uid() derived from server session — never from client input
 *   - Profile update scoped to authenticated user via RLS
 *   - Role field is NOT updatable by customers
 */
import { createClient } from "@/lib/supabase/server";
import type {
  UpdateProfileData,
  UpdateProfileErrors,
  UpdateProfileResult,
} from "@/types/account";

// ── Validation ─────────────────────────────────────────────

function validateProfile(data: UpdateProfileData): UpdateProfileErrors {
  const errors: UpdateProfileErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  } else if (data.fullName.trim().length > 100) {
    errors.fullName = "Full name must be less than 100 characters.";
  }

  if (data.phone.trim()) {
    const cleanPhone = data.phone.replace(/[\s\-()]/g, "");
    const phoneRx = /^(\+?\d{7,15}|[6-9]\d{9})$/;
    if (!phoneRx.test(cleanPhone)) {
      errors.phone = "Please enter a valid phone number.";
    }
  }

  return errors;
}

// ── Action ─────────────────────────────────────────────────

export async function updateProfileAction(
  data: UpdateProfileData
): Promise<UpdateProfileResult> {
  const fieldErrors = validateProfile(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();

  // Get authenticated user — never trust client-provided ID
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "You must be logged in to update your profile." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName.trim(),
      phone: data.phone.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[RFC Store] Profile update error:", error.message);
    return { success: false, error: "Profile could not be updated. Please try again." };
  }

  return { success: true };
}
