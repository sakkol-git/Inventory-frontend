import { useState, useCallback, useMemo } from "react";

/**
 * A single filter option with display label
 */
export interface FilterOption {
  value: string | number;
  label: string;
}

/**
 * Options for useEntityFilter hook
 */
export interface UseEntityFilterOptions {
  /** Default filter values */
  defaultFilters: Record<string, string | number>;

  /** Available options per dimension */
  availableOptions: Record<string, FilterOption[]>;

  /** Dimension display names */
  dimensionLabels?: Record<string, string>;
}

/**
 * Result from useEntityFilter hook
 */
export interface UseEntityFilterResult {
  /** Current filter values */
  filters: Record<string, string | number>;

  /** Update a single filter dimension */
  updateFilter: (dimension: string, value: string | number) => void;

  /** Update multiple filters at once */
  updateFilters: (updates: Record<string, string | number>) => void;

  /** Reset to default filters */
  resetFilters: () => void;

  /** Check if any filters are active (non-default) */
  hasActiveFilters: boolean;

  /** Get query params suitable for API calls */
  asQueryParams: () => Record<string, unknown>;

  /** Get display label for a filter dimension */
  getDimensionLabel: (dimension: string) => string;

  /** Get label for a specific filter value */
  getOptionLabel: (dimension: string, value: string | number) => string;
}

/**
 * Generic hook for managing entity filters
 * Standardizes filter state across all entities
 *
 * @example
 * const filters = useEntityFilter({
 *   defaultFilters: { status: "all", hazard: "all" },
 *   availableOptions: {
 *     status: [
 *       { value: "all", label: "All Chemicals" },
 *       { value: "active", label: "Active" },
 *     ],
 *     hazard: [
 *       { value: "all", label: "All Hazard Levels" },
 *       { value: "high", label: "High" },
 *     ],
 *   },
 * });
 *
 * // Use filters.filters.status to get current value
 * // Use filters.updateFilter("status", "active") to update
 * // Use filters.asQueryParams() to send to API
 */
export function useEntityFilter(
  options: UseEntityFilterOptions
): UseEntityFilterResult {
  const [filters, setFilters] = useState<Record<string, string | number>>(
    options.defaultFilters
  );

  const updateFilter = useCallback(
    (dimension: string, value: string | number) => {
      setFilters((prev) => ({
        ...prev,
        [dimension]: value,
      }));
    },
    []
  );

  const updateFilters = useCallback((updates: Record<string, string | number>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(options.defaultFilters);
  }, [options.defaultFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(
      ([key, value]) => options.defaultFilters[key] !== value
    );
  }, [filters, options.defaultFilters]);

  const asQueryParams = useCallback((): Record<string, unknown> => {
    const params: Record<string, unknown> = {};

    Object.entries(filters).forEach(([key, value]) => {
      // Don't include filters that match defaults
      if (value !== options.defaultFilters[key]) {
        params[key] = value;
      }
    });

    return params;
  }, [filters, options.defaultFilters]);

  const getDimensionLabel = useCallback(
    (dimension: string) => {
      return options.dimensionLabels?.[dimension] ?? dimension;
    },
    [options.dimensionLabels]
  );

  const getOptionLabel = useCallback(
    (dimension: string, value: string | number) => {
      const options_list = options.availableOptions[dimension] ?? [];
      return options_list.find((opt) => opt.value === value)?.label ?? String(value);
    },
    [options.availableOptions]
  );

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    asQueryParams,
    getDimensionLabel,
    getOptionLabel,
  };
}
