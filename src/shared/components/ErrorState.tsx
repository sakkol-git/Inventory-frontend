/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ErrorState — Reusable error display with retry and go-back actions.
 *
 * Phase 6.2.1 — Loading, Error & Empty States.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ErrorStateProps {
  /** Custom error message */
  message?: string;
  /** Technical error details (collapsible) */
  details?: string;
  /** Retry callback — shows "Try Again" button */
  onRetry?: () => void;
  /** Go back callback — shows "Go Back" button */
  onGoBack?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function ErrorState({
  message = "Something went wrong",
  details,
  onRetry,
  onGoBack,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
      role="alert"
    >
      <div className="mb-4 p-4 bg-destructive/10 rounded-xl">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="text-subheading mb-1">{message}</h3>
      <p className="text-body-muted max-w-sm mb-6">
        An error occurred while loading the data. Please try again or contact
        support if the problem persists.
      </p>

      <div className="flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        )}
      </div>

      {details && (
        <div className="mt-6 w-full max-w-md">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-caption underline hover:text-foreground transition-colors"
          >
            {showDetails ? "Hide details" : "Show error details"}
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 bg-muted rounded-lg text-xs text-left overflow-auto max-h-40 font-mono">
              {details}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
