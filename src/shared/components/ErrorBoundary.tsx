/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ErrorBoundary — Production React error boundary.
 *
 * Catches render errors in the component tree and shows a recovery UI
 * instead of a white screen.
 *
 * Usage:
 *   <ErrorBoundary fallback={<ErrorPage />}>
 *     <App />
 *   </ErrorBoundary>
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI — receives error and reset function */
  fallback?:
    | ReactNode
    | ((props: { error: Error; reset: () => void }) => ReactNode);
  /** Called when an error is caught — use for logging */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─── Default Fallback ──────────────────────────────────────────────────────

function DefaultErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
      role="alert"
    >
      <div className="p-4 bg-destructive/10 rounded-xl mb-4">
        <AlertTriangle
          className="h-10 w-10 text-destructive"
          aria-hidden="true"
        />
      </div>
      <h2 className="text-lg font-medium text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground mb-1 max-w-md">
        An unexpected error occurred. Try refreshing the page or contact support
        if the problem persists.
      </p>
      {import.meta.env.DEV && (
        <pre className="text-xs text-destructive bg-destructive/5 rounded-lg p-3 mt-3 max-w-lg overflow-auto text-left">
          {error.message}
        </pre>
      )}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>
        <Button
          variant="default"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}

// ─── Error Boundary Class ──────────────────────────────────────────────────

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);

    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === "function") {
        return fallback({ error: this.state.error, reset: this.handleReset });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
