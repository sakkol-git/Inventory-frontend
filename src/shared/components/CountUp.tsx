/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CountUp — Animated number counter for KPIs and statistics.
 *
 * Phase 14.3.2 — Micro-Interactions & Animation.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Target value */
  end: number;
  /** Start value (default 0) */
  start?: number;
  /** Animation duration in ms (default 1000) */
  duration?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%") */
  suffix?: string;
  /** Separator for thousands */
  separator?: string;
  /** CSS class */
  className?: string;
  /** Whether to use locale formatting */
  useLocale?: boolean;
}

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export function CountUp({
  end,
  start = 0,
  duration = 1000,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className,
  useLocale = true,
}: CountUpProps) {
  const [current, setCurrent] = useState(start);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const prevEndRef = useRef(end);

  useEffect(() => {
    const startValue = prevEndRef.current !== end ? prevEndRef.current : start;
    prevEndRef.current = end;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuint(progress);
      const value = startValue + (end - startValue) * easedProgress;

      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, start, duration]);

  const formatValue = (value: number): string => {
    if (useLocale) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }

    const fixed = value.toFixed(decimals);
    if (!separator) return fixed;

    const [intPart, decPart] = fixed.split(".");
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart ? `${formatted}.${decPart}` : formatted;
  };

  return (
    <span className={className}>
      {prefix}
      {formatValue(current)}
      {suffix}
    </span>
  );
}
