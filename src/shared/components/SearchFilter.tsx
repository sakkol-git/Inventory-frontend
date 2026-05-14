/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SearchFilter — Accessible search bar + optional filter children.
 *
 * Every listing page uses this for search + filter controls.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFilterProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  /** Entity type for ARIA — e.g. "equipment", "chemicals" */
  entityName?: string;
  children?: React.ReactNode;
}

const SearchFilter = ({
  query,
  onQueryChange,
  placeholder = "Search...",
  entityName,
  children,
}: SearchFilterProps) => (
  <div
    className="flex flex-col sm:flex-row sm:flex-wrap gap-3"
    role="search"
    aria-label={entityName ? `Search ${entityName}` : "Search"}
  >
    <div className="relative sm:flex-1 sm:min-w-[200px]">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="pl-10"
        role="searchbox"
        aria-label={entityName ? `Search ${entityName}` : placeholder}
      />
    </div>
    {children && (
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    )}
  </div>
);

export default SearchFilter;
