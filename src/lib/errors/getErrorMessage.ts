/**
 * ═══════════════════════════════════════════════════════════════════════════
 * getErrorMessage — Type-safe error message extraction
 *
 * Closes AUDIT #10 — Unsafe type assertions in catch blocks
 *
 * Replaces all `err as { response?: {...} }` patterns with safe narrowing.
 * Handles AxiosError, Error, and unknown types gracefully.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import axios, { type AxiosError } from "axios";

/**
 * Extract a user-friendly error message from any thrown value.
 * Prioritizes backend-provided error messages over generic fallback.
 *
 * @param err - The caught error (can be AxiosError, Error, or any unknown value)
 * @param fallback - Fallback message if no specific error can be determined
 * @returns A human-readable error message
 */
export function getErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred",
): string {
  // ✅ Safe narrowing: use axios.isAxiosError for type guard
  if (axios.isAxiosError(err)) {
    // Try backend-provided message first
    const data = err.response?.data as
      | Record<string, unknown>
      | string
      | undefined;

    if (typeof data === "object" && data !== null) {
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
      if ("error" in data && typeof data.error === "string") {
        return data.error;
      }
    }

    // Fall back to axios message
    return err.message || fallback;
  }

  // ✅ Safe narrowing: instanceof Error
  if (err instanceof Error) {
    return err.message;
  }

  // ✅ Safe default for unknown
  return fallback;
}

/**
 * Check if an error is an axios error (type guard).
 * Useful for conditional logic that needs to access response/status.
 *
 * @param err - The error to check
 * @returns true if err is an AxiosError
 */
export function isAxiosError(err: unknown): err is AxiosError {
  return axios.isAxiosError(err);
}

/**
 * Extract HTTP status from an error, or undefined if not available.
 *
 * @param err - The error to extract from
 * @returns The HTTP status code or undefined
 */
export function getErrorStatus(err: unknown): number | undefined {
  if (axios.isAxiosError(err)) {
    return err.response?.status;
  }
  return undefined;
}
