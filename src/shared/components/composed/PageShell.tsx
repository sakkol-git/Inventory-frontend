/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PageShell — Root wrapper for every page within AppLayout.
 *
 * Provides:
 *   - Consistent vertical rhythm (space-y-6)
 *   - Entrance animation
 *   - Max-width constraint
 *   - aria-live region for async content announcements
 *
 * Every page MUST use <PageShell> as its outermost element.
 * AppLayout provides horizontal padding; PageShell provides vertical rhythm.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/shared/lib/utils";
import { type ReactNode } from "react";

interface PageShellProps {
  /** Page content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Unique page identifier for aria landmark */
  "aria-label"?: string;
}

export function PageShell({
  children,
  className,
  "aria-label": ariaLabel,
}: PageShellProps) {
  return (
    <div
      className={cn("space-y-6 animate-fade-in", className)}
      role="region"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
