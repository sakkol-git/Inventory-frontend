/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useReducedMotion — Reactive hook for prefers-reduced-motion.
 *
 * Returns `true` when the user has enabled the "reduce motion" OS setting.
 * Components should:
 *   - Skip entrance animations
 *   - Replace slide/scale with instant opacity change
 *   - Keep functional transitions (progress bars, loading spinners)
 *
 * Usage:
 *   const reducedMotion = useReducedMotion();
 *   <div className={reducedMotion ? '' : 'animate-fade-in'}>
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}
