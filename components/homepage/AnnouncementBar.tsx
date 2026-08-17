/**
 * RFC Store — Announcement Bar (Phase 9)
 *
 * Async Server Component — fetches announcement_text from store_settings.
 * Falls back to hardcoded constant if DB unavailable.
 * Fixed at the very top of the page, above the navbar.
 */
import React from "react";
import { ANNOUNCEMENT_TEXT } from "@/lib/content/homepage.content";
import { createClient } from "@/lib/supabase/server";

export async function AnnouncementBar() {
  // Fetch live announcement text from store_settings
  let text = ANNOUNCEMENT_TEXT;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "announcement_text")
      .maybeSingle();

    if (data?.value?.trim()) {
      text = data.value.trim();
    }
  } catch {
    // DB unavailable — use static fallback
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 110,
        backgroundColor: "var(--rfc-dark-promo)",
        color: "var(--rfc-text-inv)",
        fontFamily: "var(--font-label)",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: "8px 16px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      role="banner"
      aria-label="Store announcement"
    >
      {text}
    </div>
  );
}

