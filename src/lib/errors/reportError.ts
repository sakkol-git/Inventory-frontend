/**
 * ═══════════════════════════════════════════════════════════════════════════
 * reportError — Error tracking and logging integration point
 *
 * Closes AUDIT #7 — Unhandled promise rejections (auth failures logged nowhere)
 *
 * Centralized error reporting. Currently logs to console; ready for Sentry/
 * LogRocket integration by changing this one file.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Context information to attach to error reports
 */
export interface ErrorContext {
  context?: string;
  userId?: string | number;
  url?: string;
  [key: string]: unknown;
}

/**
 * Report an error through the error tracking system.
 * Currently routes to console.error; can be extended to Sentry, LogRocket, etc.
 *
 * @param error - The error to report
 * @param context - Optional context information
 *
 * @example
 * try {
 *   await fetchProfile();
 * } catch (err) {
 *   reportError(err, { context: 'fetchProfile', userId: user.id });
 * }
 */
export function reportError(error: unknown, context?: ErrorContext): void {
  // TODO: Integrate with Sentry/LogRocket
  // Sentry.captureException(error, { tags: context });

  // For now, log to console in development
  if (import.meta.env.DEV) {
    console.error("[ERROR_REPORT]", error, context);
  }

  // In production, could send to an error logging service
  // This is a hook point for future integration
}

/**
 * Report a warning (non-fatal issue)
 */
export function reportWarning(message: string, context?: ErrorContext): void {
  if (import.meta.env.DEV) {
    console.warn("[WARNING_REPORT]", message, context);
  }
}

/**
 * Report an info message (for tracking important events)
 */
export function reportInfo(message: string, context?: ErrorContext): void {
  if (import.meta.env.DEV) {
    console.info("[INFO_REPORT]", message, context);
  }
}
