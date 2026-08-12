"use client";
/**
 * RFC Store — Newsletter Form (Client Component)
 * Phase 2: UI only — form submits are prevented.
 * Phase 5+: Wire to Supabase Edge Function or email provider API.
 */
import React from "react";
import styles from "./Footer.module.css";

export function NewsletterForm() {
  return (
    <form
      className={styles.newsletterForm}
      onSubmit={(e) => e.preventDefault()}
      aria-label="Newsletter subscription"
    >
      <input
        type="email"
        placeholder="Email Address"
        className={styles.emailInput}
        aria-label="Email address for newsletter"
        required
        autoComplete="email"
      />
      <button type="submit" className={styles.subscribeBtn}>
        SUBSCRIBE
      </button>
    </form>
  );
}
