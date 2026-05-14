/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SecondaryPageShell — Layout wrapper for pages that need breadcrumb
 * navigation but aren't entity detail pages.
 *
 * Used by: MaintenanceRecords, ChemicalBatches, OverdueBorrows,
 *          PendingApprovals, all report pages, UserDocuments.
 *
 * Fixes: FLAW-21 (navigation dead-ends), FLAW-25, FLAW-26
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/shared/lib/utils";
import { ChevronRight } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SecondaryPageShellProps {
  /** Breadcrumb trail — last item is treated as current page */
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function SecondaryPageShell({
  breadcrumbs,
  children,
  className,
}: SecondaryPageShellProps) {
  return (
    <div className={cn("space-y-6 animate-fade-in", className)}>
      {/* Breadcrumb navigation */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {isLast || !crumb.href ? (
                  <span
                    className={cn(
                      isLast
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* Page content */}
      {children}
    </div>
  );
}
