"use client";
/**
 * RFC Store — Address Form (Phase 7)
 *
 * Shared form for adding and editing addresses.
 * Calls addAddressAction or updateAddressAction based on mode.
 */
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAddressAction, updateAddressAction } from "@/lib/actions/addresses";
import type { AddressRow, AddressFormData, AddressFormErrors } from "@/types/account";
import styles from "./AddressForm.module.css";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

interface AddressFormProps {
  mode: "add" | "edit";
  address?: AddressRow; // provided in edit mode
}

export function AddressForm({ mode, address }: AddressFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<AddressFormData>({
    label: address?.label ?? "Home",
    fullName: address?.full_name ?? "",
    phone: address?.phone ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    postalCode: address?.postal_code ?? "",
    country: address?.country ?? "IN",
  });
  const [fieldErrors, setFieldErrors] = useState<AddressFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof AddressFormData>(field: K, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof AddressFormErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setFieldErrors({});
    setServerError(null);

    startTransition(async () => {
      try {
        const result = mode === "add"
          ? await addAddressAction(formData)
          : await updateAddressAction(address!.id, formData);

        if (result.success) {
          router.push("/account/addresses");
          router.refresh();
        } else {
          if (result.fieldErrors) setFieldErrors(result.fieldErrors);
          setServerError(result.error ?? "Something went wrong.");
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

      {/* Label */}
      <div className={styles.field}>
        <label htmlFor="addr-label" className={styles.label}>Label</label>
        <select id="addr-label" className={styles.select} value={formData.label}
          onChange={(e) => set("label", e.target.value)} disabled={isPending}>
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Two-col: Full Name + Phone */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="addr-name" className={styles.label}>Full Name</label>
          <input id="addr-name" type="text" autoComplete="name" className={styles.input}
            value={formData.fullName} onChange={(e) => set("fullName", e.target.value)}
            aria-required="true" aria-invalid={!!fieldErrors.fullName} disabled={isPending} />
          {fieldErrors.fullName && <span className={styles.error} role="alert">{fieldErrors.fullName}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="addr-phone" className={styles.label}>Phone</label>
          <input id="addr-phone" type="tel" autoComplete="tel" className={styles.input}
            value={formData.phone} onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 98765 43210"
            aria-required="true" aria-invalid={!!fieldErrors.phone} disabled={isPending} />
          {fieldErrors.phone && <span className={styles.error} role="alert">{fieldErrors.phone}</span>}
        </div>
      </div>

      {/* Address Line 1 */}
      <div className={styles.field}>
        <label htmlFor="addr-line1" className={styles.label}>Address</label>
        <input id="addr-line1" type="text" autoComplete="address-line1" className={styles.input}
          value={formData.line1} onChange={(e) => set("line1", e.target.value)}
          placeholder="House/Flat No., Street, Locality"
          aria-required="true" aria-invalid={!!fieldErrors.line1} disabled={isPending} />
        {fieldErrors.line1 && <span className={styles.error} role="alert">{fieldErrors.line1}</span>}
      </div>

      {/* Address Line 2 */}
      <div className={styles.field}>
        <label htmlFor="addr-line2" className={styles.label}>
          Apartment / Landmark <span className={styles.optional}>(optional)</span>
        </label>
        <input id="addr-line2" type="text" autoComplete="address-line2" className={styles.input}
          value={formData.line2} onChange={(e) => set("line2", e.target.value)}
          placeholder="Apartment, suite, landmark" disabled={isPending} />
      </div>

      {/* City + State */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="addr-city" className={styles.label}>City</label>
          <input id="addr-city" type="text" autoComplete="address-level2" className={styles.input}
            value={formData.city} onChange={(e) => set("city", e.target.value)}
            aria-required="true" aria-invalid={!!fieldErrors.city} disabled={isPending} />
          {fieldErrors.city && <span className={styles.error} role="alert">{fieldErrors.city}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="addr-state" className={styles.label}>State</label>
          <select id="addr-state" className={styles.select} value={formData.state}
            onChange={(e) => set("state", e.target.value)}
            aria-required="true" aria-invalid={!!fieldErrors.state} disabled={isPending}>
            <option value="">Select state…</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {fieldErrors.state && <span className={styles.error} role="alert">{fieldErrors.state}</span>}
        </div>
      </div>

      {/* PIN + Country */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="addr-pin" className={styles.label}>PIN Code</label>
          <input id="addr-pin" type="text" autoComplete="postal-code" className={styles.input}
            value={formData.postalCode} onChange={(e) => set("postalCode", e.target.value)}
            placeholder="6-digit PIN" maxLength={6}
            aria-required="true" aria-invalid={!!fieldErrors.postalCode} disabled={isPending} />
          {fieldErrors.postalCode && <span className={styles.error} role="alert">{fieldErrors.postalCode}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="addr-country" className={styles.label}>Country</label>
          <select id="addr-country" className={styles.select} value={formData.country}
            onChange={(e) => set("country", e.target.value)} disabled={isPending}>
            <option value="IN">India</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn}
          onClick={() => router.push("/account/addresses")} disabled={isPending}>
          Cancel
        </button>
        <button type="submit" className={styles.saveBtn} disabled={isPending} aria-busy={isPending}>
          {isPending ? "Saving..." : mode === "add" ? "SAVE ADDRESS" : "UPDATE ADDRESS"}
        </button>
      </div>
    </form>
  );
}
