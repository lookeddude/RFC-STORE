/**
 * RFC Store — Announcement Bar
 *
 * Fixed at the very top of the page, above the navbar.
 * Dark Navy background, uppercase tracking text.
 * Content driven from homepage.content.ts.
 */
import React from "react";
import { ANNOUNCEMENT_TEXT } from "@/lib/content/homepage.content";

export function AnnouncementBar() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 110,
        backgroundColor: "var(--color-primary)",
        color: "var(--color-on-primary)",
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
      {ANNOUNCEMENT_TEXT}
    </div>
  );
}
