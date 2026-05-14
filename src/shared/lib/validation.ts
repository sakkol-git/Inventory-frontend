/* ═══════════════════════════════════════════════════════════════════════════
 * validation — Comprehensive form & business rule validation utilities.
 *
 * Addresses: BL-001, BL-002, BL-009, BL-010, VS-001, VS-003, UI-003
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── Field-level errors map ─────────────────────────────────────────────────
export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

// ─── Generic Validators ─────────────────────────────────────────────────────

/** Returns error string or undefined if valid */
export function required(
  value: string | undefined | null,
  label = "Field",
): string | undefined {
  if (!value || value.trim() === "") return `${label} is required`;
  return undefined;
}

export function minLength(
  value: string,
  min: number,
  label = "Field",
): string | undefined {
  if (value.length < min) return `${label} must be at least ${min} characters`;
  return undefined;
}

export function maxLength(
  value: string,
  max: number,
  label = "Field",
): string | undefined {
  if (value.length > max) return `${label} must be at most ${max} characters`;
  return undefined;
}

export function positiveNumber(
  value: string | number,
  label = "Value",
): string | undefined {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n) || n <= 0) return `${label} must be a positive number`;
  return undefined;
}

export function nonNegativeNumber(
  value: string | number,
  label = "Value",
): string | undefined {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n) || n < 0) return `${label} cannot be negative`;
  return undefined;
}

export function validEmail(value: string, label = "Email"): string | undefined {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return `${label} is not a valid email`;
  return undefined;
}

export function validPhone(value: string, label = "Phone"): string | undefined {
  if (!/^\+?[\d\s\-()]{7,20}$/.test(value))
    return `${label} is not a valid phone number`;
  return undefined;
}

export function validUrl(value: string, label = "URL"): string | undefined {
  try {
    new URL(value);
    return undefined;
  } catch {
    return `${label} must be a valid URL (e.g., https://example.com/image.jpg)`;
  }
}

// ─── Date Validators (BL-009) ───────────────────────────────────────────────

export function dateAfter(
  start: string,
  end: string,
  startLabel = "Start date",
  endLabel = "End date",
): string | undefined {
  if (!start || !end) return undefined;
  if (new Date(end) < new Date(start)) {
    return `${endLabel} must be after ${startLabel}`;
  }
  return undefined;
}

export function dateNotInPast(
  value: string,
  label = "Date",
): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return `${label} cannot be in the past`;
  return undefined;
}

export function dateNotInFuture(
  value: string,
  label = "Date",
): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (d > today) return `${label} cannot be in the future`;
  return undefined;
}

// ─── Quantity Parsing (BL-001) ──────────────────────────────────────────────

/** Parses a quantity string like "2.5L", "500g", "1kg" into { value, unit } */
export function parseQuantity(
  qty: string,
): { value: number; unit: string } | null {
  if (!qty) return null;
  const match = qty.match(/^([\d.]+)\s*([a-zA-Z]*)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (isNaN(value)) return null;
  return { value, unit: match[2] || "" };
}

/** Validates that reducing by `amount` won't go below zero */
export function validateQuantityReduction(
  currentQuantity: string,
  reduceAmount: number,
): string | undefined {
  const parsed = parseQuantity(currentQuantity);
  if (!parsed)
    return "Cannot parse current quantity — please enter a valid amount";
  if (reduceAmount > parsed.value) {
    return `Cannot reduce by ${reduceAmount} — only ${parsed.value}${parsed.unit} available`;
  }
  return undefined;
}

/** Computes new quantity after adjustment */
export function computeNewQuantity(
  currentQuantity: string,
  amount: number,
  unit: string,
  action: "add" | "reduce",
): string {
  const parsed = parseQuantity(currentQuantity);
  if (!parsed) return currentQuantity; // fallback
  const newValue =
    action === "add" ? parsed.value + amount : parsed.value - amount;
  const displayUnit = unit || parsed.unit;
  return `${Math.max(0, newValue)}${displayUnit}`;
}

// ─── Duplicate Detection (BL-010) ──────────────────────────────────────────

export function checkDuplicate<T>(
  items: T[],
  field: keyof T,
  value: string,
  excludeId?: string,
  idField: keyof T = "id" as keyof T,
): string | undefined {
  const match = items.find(
    (item) =>
      String(item[field]).toLowerCase() === value.toLowerCase() &&
      String(item[idField]) !== excludeId,
  );
  if (match) {
    return `An item with this ${String(field)} already exists (${String(match[idField])})`;
  }
  return undefined;
}

// ─── Foreign Key Validation (BL-002) ────────────────────────────────────────

export function validateForeignKey<T extends { id: string }>(
  items: T[],
  foreignKeyValue: string,
  label = "Referenced item",
): string | undefined {
  if (!foreignKeyValue) return `${label} is required`;
  const exists = items.some((item) => item.id === foreignKeyValue);
  if (!exists) return `${label} does not exist (ID: ${foreignKeyValue})`;
  return undefined;
}

/** Check if entity is referenced by other entities (prevent delete) */
export function isEntityReferenced<T>(
  dependents: T[],
  foreignKeyField: keyof T,
  entityId: string,
): boolean {
  return dependents.some((d) => String(d[foreignKeyField]) === entityId);
}

// ─── Input Sanitization (VS-001) ────────────────────────────────────────────

/** Strips HTML tags and trims whitespace */
export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Sanitize all string fields in a form object */
export function sanitizeForm<T>(form: T): T {
  const cleaned = { ...form } as Record<string, unknown>;
  for (const key of Object.keys(cleaned)) {
    if (typeof cleaned[key] === "string") {
      cleaned[key] = sanitize(cleaned[key] as string);
    }
  }
  return cleaned as T;
}

// ─── File Upload Validation (VS-002) ────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE_MB = 5;

export function validateFileUpload(file: File): string | undefined {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: ${MAX_FILE_SIZE_MB}MB`;
  }
  return undefined;
}

// ─── Rate Limiting / Debounce Guard (VS-003) ────────────────────────────────

const submitTimestamps = new Map<string, number>();

/** Prevents rapid re-submission. Returns error if within cooldown. */
export function throttleSubmit(
  formId: string,
  cooldownMs = 1000,
): string | undefined {
  const last = submitTimestamps.get(formId) ?? 0;
  const now = Date.now();
  if (now - last < cooldownMs) {
    return "Please wait before submitting again";
  }
  submitTimestamps.set(formId, now);
  return undefined;
}

// ─── Composite Validators (convenience) ─────────────────────────────────────

/**
 * Run multiple validators on a value. Returns first error or undefined.
 */
export function validate(
  value: string,
  ...validators: ((v: string) => string | undefined)[]
): string | undefined {
  for (const v of validators) {
    const err = v(value);
    if (err) return err;
  }
  return undefined;
}

/**
 * Collect all errors from a map of {fieldName: errorOrUndefined}.
 * Returns only fields with errors.
 */
export function collectErrors<T extends string>(
  checks: Record<T, string | undefined>,
): FieldErrors<T> {
  const errors: FieldErrors<T> = {};
  for (const [key, value] of Object.entries(checks)) {
    if (value) {
      (errors as Record<string, string>)[key] = value as string;
    }
  }
  return errors;
}

/** Returns true if errors object has no entries */
export function isValid<T extends string>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length === 0;
}
