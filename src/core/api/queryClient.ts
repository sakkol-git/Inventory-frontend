// ═══════════════════════════════════════════════════════════════════════════
// TanStack Query Client Configuration
// ═══════════════════════════════════════════════════════════════════════════
// Closes AUDIT #8 — No retry logic with exponential backoff

import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

/**
 * Exponential backoff calculator with jitter
 * Prevents thundering herd on server recovery
 */
function getBackoffDelay(attemptIndex: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, capped at 30s
  const exponential = Math.min(1000 * Math.pow(2, attemptIndex), 30000);
  // Add jitter: ±10% to spread requests
  const jitter = exponential * 0.1 * (Math.random() * 2 - 1);
  return exponential + jitter;
}

/**
 * Parse Retry-After header if present (for 429/503 responses)
 */
function getRetryAfterDelay(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    const retryAfter = error.response?.headers["retry-after"];
    if (retryAfter) {
      // Retry-After can be in seconds or HTTP date
      const delaySeconds = parseInt(retryAfter, 10);
      if (!isNaN(delaySeconds)) {
        return delaySeconds * 1000;
      }
    }
  }
  return undefined;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: unknown) => {
        // ✅ Type-safe status extraction
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        // ❌ Do NOT retry on 4xx errors (client errors)
        // ✅ EXCEPT: 408 (timeout) — server wants us to retry
        // ✅ EXCEPT: 429 (rate limit) — server wants us to retry
        if (status && status >= 400 && status < 500) {
          if (status === 408 || status === 429) {
            // Retry up to 3 times on these transient errors
            return failureCount < 3;
          }
          // All other 4xx errors: don't retry
          return false;
        }

        // ✅ Retry on 5xx errors (server errors)
        // ✅ Retry on network errors (no status)
        // Max 3 attempts = initial + 2 retries
        return failureCount < 3;
      },
      retryDelay: (attemptIndex, error) => {
        // Check for Retry-After header first (respects server's preference)
        const retryAfterDelay = getRetryAfterDelay(error);
        if (retryAfterDelay !== undefined) {
          return retryAfterDelay;
        }
        // Otherwise use exponential backoff
        return getBackoffDelay(attemptIndex);
      },
    },
    mutations: {
      // ✅ Enable conservative retry for mutations (safe for network errors only)
      // Only retry on non-4xx errors; don't retry on client/validation errors
      retry: (failureCount, error: unknown) => {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        // ❌ Never retry 4xx client errors (risk of duplication)
        // Let user resubmit intentionally instead
        if (status && status >= 400 && status < 500) {
          return false;
        }

        // ✅ Only retry 5xx and network errors
        return failureCount < 1; // Retry once
      },
      retryDelay: (attemptIndex) => getBackoffDelay(attemptIndex),
    },
  },
});
