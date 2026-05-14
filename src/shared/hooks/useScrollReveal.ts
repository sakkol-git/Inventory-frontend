import { useEffect, useRef, useState, type RefObject } from "react";

interface UseScrollRevealOptions {
  /** Threshold: fraction of element visible before triggering (0–1) */
  threshold?: number;
  /** Root margin — offset around root before triggering */
  rootMargin?: string;
  /** Only fire once? */
  once?: boolean;
}

/**
 * Hook that returns a ref and a boolean `isVisible`.
 * Attach the ref to any element — it becomes `true` when the element
 * scrolls into view, based on IntersectionObserver.
 *
 * @example
 * const { ref, isVisible } = useScrollReveal();
 * <div ref={ref} className={isVisible ? "scroll-reveal" : "opacity-0"}>
 */
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): { ref: RefObject<T | null>; isVisible: boolean } => {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
};
