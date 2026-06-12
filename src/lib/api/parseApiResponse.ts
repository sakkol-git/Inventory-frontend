/**
 * ═══════════════════════════════════════════════════════════════════════════
 * parseApiResponse — Runtime API response validation
 *
 * Closes AUDIT #4 — Unsafe API response handling
 *
 * Wraps Zod schema parsing with developer-friendly error handling.
 * Replaces all `data as any` patterns with type-safe parsing.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { z, type ZodSchema } from "zod";
import { reportError } from "@/lib/errors/reportError";

/**
 * Custom error for API response shape mismatches
 */
export class ApiShapeError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[],
    public readonly receivedData: unknown,
  ) {
    super(message);
    this.name = "ApiShapeError";
  }
}

/**
 * Safely parse and validate an API response against a Zod schema.
 *
 * @param schema - The Zod schema to validate against
 * @param data - The raw data from the API
 * @returns Parsed and typed data
 * @throws {ApiShapeError} If the data doesn't match the schema
 *
 * @example
 * // Before (unsafe):
 * const raw = data as any;
 * const chemicals = raw?.data?.expired_chemicals ?? [];
 * chemicals.map(...) // ❌ Can crash if shape changed
 *
 * // After (safe):
 * const report = parseApiResponse(expiredItemsReportSchema, data);
 * report.data.expired_chemicals.map(...) // ✅ Fully typed, validated
 */
export function parseApiResponse<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessage = `API response shape mismatch: ${formatZodErrors(
      result.error.issues,
    )}`;

    // Log detailed error for debugging
    reportError(new Error(errorMessage), {
      context: "parseApiResponse",
      issues: result.error.issues,
      received: JSON.stringify(data).slice(0, 500), // First 500 chars
    });

    // Throw user-friendly error
    throw new ApiShapeError(
      "The server response format was unexpected. Please contact support if this persists.",
      result.error.issues,
      data,
    );
  }

  return result.data;
}

/**
 * Format Zod validation issues into a readable error message
 */
function formatZodErrors(issues: z.ZodIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.join(".");
      return `${path || "root"}: ${issue.message}`;
    })
    .join("; ");
}
