/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ResponsiveTable — Renders table on desktop, stacked cards on mobile.
 *
 * Phase 13.1 — Mobile & Responsive Excellence.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { ReactNode } from "react";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { cn } from "@/shared/lib/utils";

interface Column {
  label: string;
  key: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
  /** Only show in table, not in mobile cards */
  hideOnMobile?: boolean;
  /** Highlight this as the card title on mobile */
  isTitle?: boolean;
}

interface ResponsiveTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column[];
  /** Actions column renderer for each row */
  renderActions?: (row: T) => ReactNode;
  /** Desktop table component override */
  desktopTable?: ReactNode;
  /** Key field for React list rendering */
  keyField?: string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Additional CSS classes */
  className?: string;
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  renderActions,
  desktopTable,
  keyField = "id",
  onRowClick,
  className,
}: ResponsiveTableProps<T>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // On desktop, render the provided table or a default one
  if (isDesktop && desktopTable) {
    return <>{desktopTable}</>;
  }

  // Mobile card layout
  if (!isDesktop) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((row) => {
          const key = String(row[keyField] ?? Math.random());
          const titleCol = columns.find((c) => c.isTitle);

          return (
            <div
              key={key}
              className={cn(
                "minimal-card p-4 space-y-2",
                onRowClick && "cursor-pointer hover-lift",
              )}
              onClick={() => onRowClick?.(row)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {/* Card title */}
              {titleCol && (
                <h4 className="text-sm font-semibold">
                  {titleCol.render
                    ? titleCol.render(row[titleCol.key], row)
                    : String(row[titleCol.key] ?? "")}
                </h4>
              )}

              {/* Field list */}
              <div className="space-y-1.5">
                {columns
                  .filter((c) => !c.hideOnMobile && !c.isTitle)
                  .map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground text-xs">
                        {col.label}
                      </span>
                      <span className="font-medium">
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? "—")}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Actions */}
              {renderActions && (
                <div className="flex justify-end pt-2 border-t border-border/50">
                  {renderActions(row)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: basic table
  return (
    <div
      className={cn("rounded-xl border overflow-x-auto relative", className)}
    >
      {/* Scroll indicators */}
      <div className="absolute top-0 right-0 bottom-0 w-6 pointer-events-none bg-gradient-to-l from-background/80 to-transparent md:hidden z-10" />
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {renderActions && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const key = String(row[keyField] ?? Math.random());
            return (
              <tr
                key={key}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
                {renderActions && (
                  <td className="text-right">{renderActions(row)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
