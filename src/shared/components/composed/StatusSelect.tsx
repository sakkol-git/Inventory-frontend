/**
 * ═══════════════════════════════════════════════════════════════════════════
 * StatusSelect — Reusable status filter dropdown.
 *
 * Eliminates the repeated <Select>...<SelectItem> pattern for status
 * filtering that appears across 5+ inventory pages.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface StatusOption {
  value: string;
  label: string;
}

interface StatusSelectProps {
  /** Available status options */
  options: StatusOption[];
  /** Currently selected value — 'all' means no filter */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Label for "all" option — defaults to "All" */
  allLabel?: string;
  /** Whether to show the "all" option — defaults to true */
  showAll?: boolean;
  /** Width class */
  className?: string;
  /** aria-label for the select */
  "aria-label"?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function StatusSelect({
  options,
  value,
  onChange,
  placeholder = "Filter by status",
  allLabel = "All",
  showAll = true,
  className,
  "aria-label": ariaLabel,
}: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn("w-[160px]", className)}
        aria-label={ariaLabel ?? placeholder}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value="all">{allLabel}</SelectItem>}
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
