/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORMATTERS — Centralized data formatting for the entire application.
 *
 * Rules:
 *   1. No raw date strings in UI — always use formatDate() or formatDateTime().
 *   2. No raw enum strings in UI — always use formatEnumLabel().
 *   3. No per-hook formatting functions — import from here.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

// ─── Date Formatting ───────────────────────────────────────────────────────

/**
 * Format a date string or Date to human-readable date.
 * @example formatDate('2025-03-15T10:00:00.000000Z') → "Mar 15, 2025"
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "—";
  return format(date, "MMM d, yyyy");
}

/**
 * Format a date string or Date to human-readable date + time.
 * @example formatDateTime('2025-03-15T10:00:00Z') → "Mar 15, 2025 at 10:00 AM"
 */
export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "—";
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a date as relative time.
 * @example formatRelativeTime('2025-03-10T10:00:00Z') → "5 days ago"
 */
export function formatRelativeTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a date for table display — compact format.
 * @example formatCompactDate('2025-03-15') → "03/15/25"
 */
export function formatCompactDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "—";
  return format(date, "MM/dd/yy");
}

// ─── Enum / Label Formatting ───────────────────────────────────────────────

/**
 * Convert snake_case or SCREAMING_SNAKE_CASE to Title Case.
 * @example formatEnumLabel('transaction_count') → "Transaction Count"
 * @example formatEnumLabel('PENDING_APPROVAL') → "Pending Approval"
 */
export function formatEnumLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Convert camelCase to Title Case.
 * @example formatCamelCase('firstName') → "First Name"
 */
export function formatCamelCase(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

// ─── Number Formatting ─────────────────────────────────────────────────────

/**
 * Format a number with locale-aware thousands separators.
 * @example formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Format a number as currency.
 * @example formatCurrency(1234.5) → "$1,234.50"
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = "USD",
): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a quantity with units.
 * @example formatQuantity(500, 'mL') → "500 mL"
 * @example formatQuantity(0) → "0"
 */
export function formatQuantity(
  value: number | null | undefined,
  unit?: string,
): string {
  if (value == null) return "—";
  const formatted = formatNumber(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format a percentage.
 * @example formatPercentage(0.856) → "85.6%"
 * @example formatPercentage(85.6, false) → "85.6%"
 */
export function formatPercentage(
  value: number | null | undefined,
  isDecimal: boolean = true,
): string {
  if (value == null) return "—";
  const pct = isDecimal ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

// ─── String Formatting ─────────────────────────────────────────────────────

/**
 * Truncate a string to maxLength, appending "…" if truncated.
 */
export function truncate(value: string, maxLength: number = 50): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Format a file size in bytes to human-readable.
 * @example formatFileSize(1048576) → "1.0 MB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// ─── ID Formatting ─────────────────────────────────────────────────────────

/**
 * Format an entity ID for display.
 * @example formatId(42) → "#42"
 * @example formatId('CHM-001') → "CHM-001"
 */
export function formatId(id: string | number | null | undefined): string {
  if (id == null) return "—";
  if (typeof id === "number") return `#${id}`;
  return id;
}
