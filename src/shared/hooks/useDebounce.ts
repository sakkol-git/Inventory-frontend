/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useDebounce — Debounce any value for search/filter inputs.
 *
 * Prevents excessive API calls or filter operations during rapid typing.
 *
 * Usage:
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *   // Use debouncedQuery for API calls
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from "react";

/**
 * Returns a debounced version of the value that only updates
 * after the specified delay has passed without changes.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
