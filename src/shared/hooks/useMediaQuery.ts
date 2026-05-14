/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useMediaQuery — Responsive breakpoint hook.
 *
 * Provides reactive breakpoint detection for responsive component logic
 * that can't be handled by CSS alone (e.g., column hiding, component swaps).
 *
 * Usage:
 *   const isMobile = useMediaQuery('(max-width: 639px)');
 *   const isDesktop = useMediaQuery('(min-width: 1024px)');
 *   const { isMobile, isTablet, isDesktop } = useBreakpoints();
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query.
 * Returns `true` when the query matches, `false` otherwise.
 * SSR-safe — returns `false` on initial server render.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mql.matches);

    // Modern API
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Convenience hook for standard breakpoints.
 * Maps to Tailwind breakpoints: sm(640), md(768), lg(1024), xl(1280).
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isWide = useMediaQuery("(min-width: 1280px)");

  return { isMobile, isTablet, isDesktop, isWide } as const;
}
