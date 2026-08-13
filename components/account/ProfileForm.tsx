"use client";
/**
 * RFC Store — Profile Form (Redesigned)
 *
 * Shows:
 *  - Email (read-only + verified/unverified indicator)
 *  - Full name (editable)
 *  - Phone (editable)
 *  - Account security section (sign out)
 */
import React, { useState, useTransition } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import type { ProfileRow, UpdateProfileErrors } from "@/types/account";
import styles from "./ProfileForm.module.css";

interface ProfileFormProps {
  profile: ProfileRow | null;
  email: string;
  emailVerified?: boolean;
}

export function ProfileForm({ profile, email, emailVerified = false }: ProfileFormProps) {
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
    <div className={styles.wrap}>
      {/* ── Personal Information ──────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          <p className={styles.sectionDesc}>
            Update your name and contact details.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className={styles.serverError} role="alert">
              {serverError}
            </div>
          )}
          {successMsg && (
            <div className={styles.successMsg} role="status">
              ✓ {successMsg}
            </div>
          )}

          {/* Email — read only with verified status */}
          <div className={styles.field}>
            <label htmlFor="profile-email" className={styles.label}>
              Email Address
            </label>
            <div className={styles.emailRow}>
              <input
                id="profile-email"
                type="email"
                value={email}
                disabled
                readOnly
                className={`${styles.input} ${styles.inputDisabled}`}
                aria-describedby="profile-email-meta"
              />
              <span
                className={emailVerified ? styles.verifiedBadge : styles.unverifiedBadge}
                title={emailVerified ? "Email verified" : "Email not verified"}
                aria-label={emailVerified ? "Email verified" : "Email not verified"}
              >
                {emailVerified ? "✓ Verified" : "⚠ Unverified"}
              </span>
            </div>
            <p id="profile-email-meta" className={styles.hint}>
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
              placeholder="Your full name"
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
              Phone Number{" "}
              <span className={styles.optional}>(optional)</span>
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
              aria-describedby={
                fieldErrors.phone ? "profile-phone-error" : "profile-phone-hint"
              }
              disabled={isPending}
            />
            {fieldErrors.phone ? (
              <span id="profile-phone-error" className={styles.error} role="alert">
                {fieldErrors.phone}
              </span>
            ) : (
              <p id="profile-phone-hint" className={styles.hint}>
                Used for order communication and delivery updates.
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* ── Account Security ─────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Account Security</h2>
          <p className={styles.sectionDesc}>
            Manage your account access and session.
          </p>
        </div>

        <div className={styles.securityRows}>
          <div className={styles.securityRow}>
            <div className={styles.securityInfo}>
              <span className={styles.securityLabel}>Password</span>
              <span className={styles.securityMeta}>
                Managed by Supabase Auth. Reset via email link.
              </span>
            </div>
          </div>

          <div className={styles.securityRow}>
            <div className={styles.securityInfo}>
              <span className={styles.securityLabel}>Sign Out</span>
              <span className={styles.securityMeta}>
                Sign out from your current session.
              </span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className={styles.signOutBtn}>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
