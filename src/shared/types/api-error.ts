// ═══════════════════════════════════════════════════════════════════════════
// API Error Types — Standard Laravel error shapes
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export interface ApiCustomError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Type guard: check if an Axios error response is a validation error (422)
 */
export function isValidationError(
  error: unknown,
): error is { response: { data: ApiValidationError; status: 422 } } {
  if (typeof error !== "object" || error === null) return false;
  const err = error as Record<string, unknown>;
  const response = err.response as Record<string, unknown> | undefined;
  return (
    response?.status === 422 &&
    typeof (response?.data as Record<string, unknown>)?.errors === "object"
  );
}

/**
 * Type guard: check if an Axios error response is a custom business error (400)
 */
export function isCustomError(
  error: unknown,
): error is { response: { data: ApiCustomError; status: number } } {
  if (typeof error !== "object" || error === null) return false;
  const err = error as Record<string, unknown>;
  const response = err.response as Record<string, unknown> | undefined;
  return typeof (response?.data as Record<string, unknown>)?.error === "string";
}

/**
 * Map backend validation errors to frontend form field errors.
 * Uses a field map to translate snake_case backend keys to camelCase form keys.
 */
export function mapBackendErrors<K extends string>(
  error: { response: { data: ApiValidationError } },
  fieldMap: Record<string, K>,
): Partial<Record<K, string>> {
  const result: Partial<Record<K, string>> = {};
  const errors = error.response.data.errors;
  for (const [backendKey, frontendKey] of Object.entries(fieldMap)) {
    if (errors[backendKey]?.length) {
      result[frontendKey] = errors[backendKey][0];
    }
  }
  return result;
}

/**
 * Extract a user-friendly message from any API error
 */
export function getErrorMessage(error: unknown): string {
  if (isCustomError(error)) {
    return error.response.data.message;
  }
  if (isValidationError(error)) {
    return error.response.data.message || "Validation failed";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
