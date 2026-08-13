"use client";
/**
 * RFC Store — Admin Settings Page (Phase 8)
 * Server-fetches all settings, client form for editing.
 * Uses updateAllSettingsAction with ALLOWED_KEYS whitelist server-side.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAllSettingsAction } from "@/lib/actions/admin/settings";
import styles from "./settings.module.css";
import adminStyles from "@/components/admin/admin-page.module.css";

interface Setting {
  key: string;
  value: string | null;
  label: string | null;
}

interface SettingsPageClientProps {
  settings: Setting[];
}

// This is the full page — it's a client component that receives settings as props
// from the server wrapper below
export function SettingsPageClient({ settings }: SettingsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Build editable map from settings
  const initialValues = Object.fromEntries(
    settings.map((s) => [s.key, s.value ?? ""])
  );
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    setError("");
    setSuccessMsg("");
    startTransition(async () => {
      const result = await updateAllSettingsAction(values);
      if (result.success) {
        setSuccessMsg("Settings saved successfully.");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to save settings.");
      }
    });
  };

  // Group settings by category
  const groups = [
    {
      title: "Store Identity",
      keys: ["store_name", "contact_email", "contact_phone", "whatsapp_number"],
    },
    {
      title: "Social Media",
      keys: ["instagram_url", "facebook_url"],
    },
    {
      title: "Storefront Content",
      keys: ["hero_title", "hero_subtitle", "announcement_text"],
    },
  ];

  const getLabel = (key: string) => {
    const s = settings.find((s) => s.key === key);
    return s?.label ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isTextarea = (key: string) =>
    ["hero_subtitle", "announcement_text"].includes(key);

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <div className={adminStyles.pageTitleBlock}>
          <h1 className={adminStyles.pageTitle}>Store Settings</h1>
          <p className={adminStyles.pageSub}>Global configuration for the RFC Store</p>
        </div>
        <button
          className={adminStyles.primaryBtn}
          onClick={handleSave}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Saving…" : "Save All Settings"}
        </button>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}
      {successMsg && <div className={styles.successBanner} role="status">{successMsg}</div>}

      <div className={styles.sections}>
        {groups.map((group) => {
          const groupSettings = group.keys.filter((k) => values[k] !== undefined || settings.find((s) => s.key === k));
          if (groupSettings.length === 0) return null;

          return (
            <div key={group.title} className={styles.card}>
              <h2 className={styles.cardTitle}>{group.title}</h2>
              <div className={styles.fields}>
                {group.keys.map((key) => {
                  const exists = settings.find((s) => s.key === key);
                  if (!exists) return null;
                  return (
                    <div key={key} className={styles.field}>
                      <label className={styles.label} htmlFor={`setting-${key}`}>
                        {getLabel(key)}
                      </label>
                      {isTextarea(key) ? (
                        <textarea
                          id={`setting-${key}`}
                          className={`${styles.input} ${styles.textarea}`}
                          value={values[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <input
                          id={`setting-${key}`}
                          type={key.includes("email") ? "email" : key.includes("url") ? "url" : "text"}
                          className={styles.input}
                          value={values[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button
          className={adminStyles.primaryBtn}
          onClick={handleSave}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
