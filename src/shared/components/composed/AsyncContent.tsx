/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AsyncContent — Universal loading/error/empty state boundary.
 *
 * Wraps any async data region and handles the state machine:
 *   loading → error → empty → data
 *
 * Fixes: FLAW-11 (3 loading patterns), FLAW-12 (4 error patterns),
 *        FLAW-13 (3 empty patterns), FLAW-22 (missing states),
 *        FLAW-23 (premature empty state during loading)
 *
 * Rules:
 *   1. Every page with async data MUST use AsyncContent.
 *   2. Never hand-code loading/error/empty conditional chains.
 *   3. Skeleton is preferred over spinner for page-level loading.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { type ReactNode, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface AsyncContentProps {
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Whether the loaded data set is empty (only checked when !isLoading && !isError) */
  isEmpty?: boolean;
  /** Skeleton or loading UI to show during load */
  skeleton?: ReactNode;
  /** Fallback text for loading when no skeleton provided */
  loadingText?: string;
  /** Custom error UI */
  errorFallback?: ReactNode;
  /** Error message from API (shown in default error UI) */
  errorMessage?: string;
  /** Retry function for error state */
  onRetry?: () => void;
  /** Custom empty state UI */
  emptyFallback?: ReactNode;
  /** Data content — only rendered when !loading && !error && !empty */
  children: ReactNode;
  /** Additional class names for the wrapper */
  className?: string;
  /** aria-label for the content region */
  "aria-label"?: string;
}

// ─── Default Loading ───────────────────────────────────────────────────────

function DefaultLoading({ text }: { text?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      role="status"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary" />
      {text && <p className="text-sm text-muted-foreground mt-3">{text}</p>}
      <span className="sr-only">Loading content</span>
    </div>
  );
}

// ─── Default Error ─────────────────────────────────────────────────────────

function DefaultError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-destructive/10 rounded-xl mb-4">
        <AlertTriangle
          className="h-8 w-8 text-destructive"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        Failed to load data
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {message || "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function AsyncContent({
  isLoading,
  isError,
  isEmpty = false,
  skeleton,
  loadingText,
  errorFallback,
  errorMessage,
  onRetry,
  emptyFallback,
  children,
  className,
  "aria-label": ariaLabel,
}: AsyncContentProps) {
  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  // State machine: loading → error → empty → data
  // Order matters. Never show empty during loading.
  const content = (() => {
    if (isLoading) {
      return skeleton ?? <DefaultLoading text={loadingText} />;
    }

    if (isError) {
      return (
        errorFallback ?? (
          <DefaultError message={errorMessage} onRetry={handleRetry} />
        )
      );
    }

    if (isEmpty) {
      return emptyFallback ?? null;
    }

    return children;
  })();

  return (
    <div
      className={cn(className)}
      role="region"
      aria-label={ariaLabel}
      aria-live="polite"
      aria-busy={isLoading}
    >
      {content}
    </div>
  );
}
