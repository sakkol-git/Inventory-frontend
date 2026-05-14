/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useAnnounce — Declarative screen reader announcements for React.
 *
 * Wraps the imperative `announce()` from a11y.ts into a reactive pattern
 * that announces on value change.
 *
 * Usage:
 *   // Manual announcements (e.g. after mutation)
 *   const { announce } = useAnnounce();
 *   announce('Chemical deleted successfully');
 *
 *   // Auto-announce on search result count change
 *   useAnnounceEffect(
 *     filteredItems.length > 0
 *       ? `${filteredItems.length} items found`
 *       : 'No results found',
 *     [filteredItems.length],
 *   );
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { announce as announceImpl } from "@/shared/lib/a11y";
import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable `announce` function for manual announcements.
 */
export function useAnnounce() {
  const announce = useCallback(
    (message: string, politeness: "polite" | "assertive" = "polite") => {
      announceImpl(message, politeness);
    },
    [],
  );

  return { announce };
}

/**
 * Auto-announce a message whenever dependencies change.
 * Skips the initial mount announcement to avoid noise on page load.
 */
export function useAnnounceEffect(
  message: string,
  deps: React.DependencyList,
  politeness: "polite" | "assertive" = "polite",
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (message) {
      announceImpl(message, politeness);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
