/**
 * RFC Store — Formatting Utilities
 *
 * Centralised formatting for currency, dates, and other display values.
 * Keep all locale/currency configuration here — never scattered through components.
 */

// ── Currency ──────────────────────────────────────────────

const DEFAULT_CURRENCY = "INR";
const DEFAULT_LOCALE = "en-IN";

/**
 * Formats a numeric value as a currency string.
 *
 * @param amount  - The price in base currency units (e.g. 1299.99)
 * @param currency - ISO 4217 currency code (defaults to INR)
 * @param locale   - BCP 47 locale string (defaults to en-IN)
 *
 * @example
 *   formatPrice(1299) // → "₹1,299.00"
 *   formatPrice(1299, 'USD', 'en-US') // → "$1,299.00"
 */
export function formatPrice(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a discount percentage.
 *
 * @example
 *   formatDiscount(25) // → "25% OFF"
 */
export function formatDiscount(percentage: number): string {
  return `${Math.round(percentage)}% OFF`;
}

// ── Dates ──────────────────────────────────────────────────

/**
 * Formats a date string or Date object for display.
 *
 * @example
 *   formatDate('2024-01-15') // → "15 Jan 2024"
 */
export function formatDate(
  date: string | Date,
  locale: string = DEFAULT_LOCALE
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a date as a relative time string (e.g. "2 days ago").
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ── Text ───────────────────────────────────────────────────

/**
 * Truncates a string to the given max length, appending "…".
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Converts a slug string to a title-case display name.
 *
 * @example
 *   slugToTitle('boxing-gloves') // → "Boxing Gloves"
 */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
