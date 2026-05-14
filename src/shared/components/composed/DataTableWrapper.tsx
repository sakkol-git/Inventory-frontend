/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DataTableWrapper — Universal table container.
 *
 * Provides:
 *   - Consistent border, radius, overflow handling
 *   - overflow-x-auto for mobile table scrolling
 *   - ARIA region labeling
 *
 * Fixes: FLAW-05 (missing overflow-x-auto), FLAW-14 (3 table wrapper patterns)
 *
 * Rules:
 *   1. Every table MUST be wrapped in DataTableWrapper.
 *   2. No inline border/radius/overflow on table containers.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/shared/lib/utils";
import { type ReactNode, forwardRef } from "react";

interface DataTableWrapperProps {
  children: ReactNode;
  className?: string;
  /** ARIA label for the table region, e.g. "Equipment list" */
  "aria-label"?: string;
}

export const DataTableWrapper = forwardRef<
  HTMLDivElement,
  DataTableWrapperProps
>(({ children, className, "aria-label": ariaLabel }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border/40 overflow-x-auto",
      className,
    )}
    role="region"
    aria-label={ariaLabel}
    tabIndex={0}
  >
    {children}
  </div>
));

DataTableWrapper.displayName = "DataTableWrapper";
