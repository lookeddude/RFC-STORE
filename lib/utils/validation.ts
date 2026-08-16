/**
 * RFC Store — Shared Validation Utilities
 *
 * Server-safe. No external dependencies.
 * Used by: auth actions, API route handlers, address actions.
 */

// ── Redirect Safety ───────────────────────────────────────────

/**
 * Returns a safe internal redirect path from an untrusted input.
 *
 * Accepts only same-origin relative paths (e.g. "/shop", "/account/orders").
 * Rejects:
 *   - Protocol-relative URLs  (//evil.com)
 *   - Absolute external URLs  (https://evil.com)
 *   - javascript: URIs
 *   - Empty or null inputs
 *
 * Falls back to `fallback` (default: "/account") for anything invalid.
 *
 * Implementation: parses the input against a dummy origin using the
 * WHATWG URL API. If the parser assigns a host other than the dummy,
 * the input contained an external origin — reject it.
 */
export function safeRedirectPath(
  input: string | null | undefined,
  fallback = "/account"
): string {
  if (!input) return fallback;
  try {
    // Parse relative to a dummy origin to normalise the input
    const parsed = new URL(input, "http://n");
    // Reject if the URL parser assigned a different host
    // i.e. the input was an external URL, not a relative path
    if (parsed.host !== "n") return fallback;
    if (!parsed.pathname) return fallback;
    // Reconstruct path + search + hash — no protocol or host
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    // URL parsing failed (e.g. truly malformed input)
    return fallback;
  }
}

// ── UUID Validation ───────────────────────────────────────────

/**
 * UUID format regex.
 * Matches the standard 8-4-4-4-12 hexadecimal UUID format.
 * Not restricted to v4 — validates generic UUID format.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns true if the value is a valid UUID format string.
 * Returns false for null, undefined, empty string, or non-UUID strings.
 *
 * Use this before passing externally-controlled IDs to database queries.
 */
export function isValidUUID(value: string | null | undefined): boolean {
  if (!value) return false;
  return UUID_RE.test(value);
}
