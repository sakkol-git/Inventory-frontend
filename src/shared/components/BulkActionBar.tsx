/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BulkActionBar — Floating action bar when rows are selected.
 *
 * Phase 4.4 — Bulk Actions.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Download, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Total number of items */
  totalCount: number;
  /** Called when selection is cleared */
  onClear: () => void;
  /** Called when delete is triggered */
  onDelete?: () => void;
  /** Called when export is triggered */
  onExport?: () => void;
  /** Additional actions */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onClear,
  onDelete,
  onExport,
  children,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-card border shadow-lg",
        "animate-in slide-in-from-bottom-4 fade-in duration-200",
        className,
      )}
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="text-sm font-medium tabular-nums whitespace-nowrap">
        {selectedCount} of {totalCount} selected
      </span>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        )}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            onClick={onExport}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        )}
        {children}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 ml-1"
        onClick={onClear}
        aria-label="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
