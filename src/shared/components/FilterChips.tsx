/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FilterChips — Active filter indicators with remove buttons.
 *
 * Phase 7.3.5 — Search & Filtering.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface FilterChip {
  id: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  /** Active filters */
  filters: FilterChip[];
  /** Called when a filter is removed */
  onRemove: (id: string) => void;
  /** Called when all filters are cleared */
  onClearAll?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div
      className={cn("flex items-center gap-2 flex-wrap", className)}
      role="group"
      aria-label="Active filters"
    >
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          {filter.value}
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-0.5 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {onClearAll && filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground"
          onClick={onClearAll}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
