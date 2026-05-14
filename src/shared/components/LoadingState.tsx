import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  /**
   * The variant of loading indicator to display
   * - skeleton: Placeholder boxes (best for content loading)
   * - spinner: Rotating loader icon (best for actions/processes)
   * - text: Simple "Loading..." text (lightweight option)
   */
  variant?: "skeleton" | "spinner" | "text";
  
  /**
   * Size of the loading indicator
   */
  size?: "sm" | "md" | "lg";
  
  /**
   * Optional custom text to display
   */
  text?: string;
  
  /**
   * Number of skeleton rows to show (only for skeleton variant)
   */
  rows?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Standardized loading state component
 * 
 * @example
 * // Skeleton loader for content
 * <LoadingState variant="skeleton" rows={3} />
 * 
 * // Spinner for actions
 * <LoadingState variant="spinner" size="md" text="Saving..." />
 * 
 * // Simple text loader
 * <LoadingState variant="text" />
 */
export function LoadingState({
  variant = "spinner",
  size = "md",
  text,
  rows = 3,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className={cn("w-full rounded-lg", sizeClasses[size])} />
        ))}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <p className={cn("text-muted-foreground animate-pulse", textSizes[size], className)}>
        {text || "Loading..."}
      </p>
    );
  }

  // Default: spinner variant
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", iconSizes[size])} />
      {text && (
        <p className={cn("text-muted-foreground", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  );
}
