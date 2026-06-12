/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WidgetErrorBoundary — Per-widget error isolation
 *
 * Closes AUDIT #3 — Dashboard widget crashes, AUDIT #9 — Missing per-widget error boundaries
 *
 * Wraps individual dashboard/report widgets to prevent one failure from
 * crashing the entire page. Shows a compact error card with retry option.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { AlertTriangle, RotateCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { reportError } from "@/lib/errors/reportError";

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  /** Display name for the widget (shown in error messages) */
  widgetName?: string;
  /** Callback when error is caught (for analytics/logging) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom fallback render; if not provided, uses default compact card */
  fallback?: (props: {
    error: Error;
    reset: () => void;
    widgetName?: string;
  }) => ReactNode;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  resetCount: number;
}

/**
 * Error boundary for isolated widget failures.
 * Designed to be lightweight and composable.
 *
 * @example
 * <WidgetErrorBoundary widgetName="Chemical Usage">
 *   <ChemicalUsageChart />
 * </WidgetErrorBoundary>
 */
export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, resetCount: 0 };
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error, resetCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, {
      context: `WidgetErrorBoundary[${this.props.widgetName || "unknown"}]`,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      resetCount: prev.resetCount + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.resetError,
          widgetName: this.props.widgetName,
        });
      }

      // Default compact error card
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-destructive">
                  {this.props.widgetName || "Widget"} Failed
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {this.state.error.message ||
                    "An unexpected error occurred loading this section."}
                </p>
                {(() => {
                  const err = this.state.error;
                  if (axios.isAxiosError(err)) {
                    // Cast data to any or specific type since AxiosError defaults to generic 'any' data
                    const data = err.response?.data as { correlation_id?: string } | undefined;
                    const correlationId = data?.correlation_id;
                    if (correlationId) {
                      return (
                        <p className="text-xs text-muted-foreground font-mono mt-1 bg-muted/50 px-1.5 py-0.5 rounded-sm inline-block">
                          Ref: {correlationId}
                        </p>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={this.resetError}
                className="flex-shrink-0"
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Use resetCount as key to force remount on retry (triggers fresh fetch)
    return <div key={this.state.resetCount}>{this.props.children}</div>;
  }
}
