/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FilterBar — Composite filter toolbar component.
 *
 * Phase 2.4.3 — Shared component that bundles SearchFilter + status Select
 * + any page-specific filter controls into a consistent flex row.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { ReactNode } from "react";

import SearchFilter from "@/shared/components/SearchFilter";
import { ViewToggle, type ViewMode } from "@/shared/components/ViewToggle";
import { cn } from "@/shared/lib/utils";

interface FilterBarProps {
  /** Search query */
  query: string;
  /** Search change handler */
  onQueryChange: (value: string) => void;
  /** Search placeholder */
  placeholder?: string;
  /** Entity name for search (screen reader accessible) */
  entityName?: string;
  /** View toggle config */
  viewToggle?: {
    current: ViewMode;
    onChange: (mode: ViewMode) => void;
  };
  /** Additional filter controls (selects, date inputs, etc.) */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function FilterBar({
  query,
  onQueryChange,
  placeholder,
  entityName,
  viewToggle,
  children,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("filter-toolbar", className)}>
      <div className="flex-1 w-full sm:w-auto">
        <SearchFilter
          query={query}
          onQueryChange={onQueryChange}
          placeholder={placeholder}
          entityName={entityName}
        />
      </div>
      <div className="filter-toolbar-end">
        {children}
        {viewToggle && (
          <ViewToggle
            current={viewToggle.current}
            onChange={viewToggle.onChange}
          />
        )}
      </div>
    </div>
  );
}
