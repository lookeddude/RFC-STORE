"use client";
/**
 * RFC Store — Profile Form (Phase 7)
 *
 * Updates: full_name, phone only.
 * Email is displayed read-only (managed by Supabase Auth — changing email
 * triggers a verification flow; not implemented in Phase 7 UI).
 */
import React, { useState, useTransition } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import type { ProfileRow, UpdateProfileErrors } from "@/types/account";
import styles from "./ProfileForm.module.css";

interface ProfileFormProps {
  profile: ProfileRow | null;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [fieldErrors, setFieldErrors] = useState<UpdateProfileErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = <K extends "fullName" | "phone">(field: K, value: string) => {
    if (field === "fullName") setFullName(value);
    if (field === "phone") setPhone(value);
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: undefined }));
    setServerError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setFieldErrors({});
    setServerError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      try {
        const result = await updateProfileAction({ fullName, phone });
        if (result.success) {
          setSuccessMsg("Profile updated successfully.");
        } else {
          if (result.fieldErrors) setFieldErrors(result.fieldErrors);
          setServerError(result.error ?? "Update failed.");
        }
      } catch {
        setServerError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className={styles.serverError} role="alert">{serverError}</div>
      )}
      {successMsg && (
        <div className={styles.successMsg} role="status">{successMsg}</div>
      )}

      {/* Email — read only */}
      <div className={styles.field}>
        <label htmlFor="profile-email" className={styles.label}>
          Email Address
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          disabled
          readOnly
          className={styles.input}
          aria-describedby="profile-email-note"
        />
        <p id="profile-email-note" className={styles.hint}>
          Email is managed by your account. Contact support to change it.
        </p>
      </div>

      {/* Full Name */}
      <div className={styles.field}>
        <label htmlFor="profile-name" className={styles.label}>
          Full Name
        </label>
        <input
          id="profile-name"
          type="text"
          autoComplete="name"
          className={styles.input}
          value={fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          aria-required="true"
          aria-invalid={!!fieldErrors.fullName}
          aria-describedby={fieldErrors.fullName ? "profile-name-error" : undefined}
          disabled={isPending}
        />
        {fieldErrors.fullName && (
          <span id="profile-name-error" className={styles.error} role="alert">
            {fieldErrors.fullName}
          </span>
        )}
      </div>

      {/* Phone */}
      <div className={styles.field}>
        <label htmlFor="profile-phone" className={styles.label}>
          Phone Number <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id="profile-phone"
          type="tel"
          autoComplete="tel"
          className={styles.input}
          value={phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="+91 98765 43210"
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? "profile-phone-error" : undefined}
          disabled={isPending}
        />
        {fieldErrors.phone && (
          <span id="profile-phone-error" className={styles.error} role="alert">
            {fieldErrors.phone}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Saving..." : "SAVE CHANGES"}
        </button>
      </div>
    </form>
  );
}
