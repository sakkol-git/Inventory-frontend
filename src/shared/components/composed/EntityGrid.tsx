/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EntityGrid — Responsive grid layout for entity cards.
 *
 * Eliminates the repeated grid class string:
 *   "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
 * that appears in 6+ pages.
 *
 * Supports:
 *   - Configurable column counts per breakpoint
 *   - Loading state with skeleton cards
 *   - Empty state integration
 *   - Staggered entrance animation
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CardSkeleton } from "@/shared/components/Skeletons";
import { cn } from "@/shared/lib/utils";
import { type ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface EntityGridProps<T> {
  /** Data items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Unique key extractor */
  keyExtractor: (item: T) => string | number;
  /** Grid column preset */
  columns?: "default" | "compact" | "wide";
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

interface EntityGridSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Grid column preset */
  columns?: "default" | "compact" | "wide";
  className?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const columnClasses = {
  default: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  compact: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  wide: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
} as const;

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
} as const;

// ─── Grid ──────────────────────────────────────────────────────────────────

export function EntityGrid<T>({
  items,
  renderItem,
  keyExtractor,
  columns = "default",
  gap = "md",
  className,
}: EntityGridProps<T>) {
  return (
    <div
      className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
    >
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// ─── Grid Skeleton ─────────────────────────────────────────────────────────

export function EntityGridSkeleton({
  count = 8,
  columns = "default",
  className,
}: EntityGridSkeletonProps) {
  return (
    <div
      className={cn("grid", columnClasses[columns], "gap-4", className)}
      role="status"
      aria-label="Loading items"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={`skeleton-${i}`} />
      ))}
      <span className="sr-only">Loading items</span>
    </div>
  );
}
