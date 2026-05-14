/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useFocusTrap — Trap keyboard focus within a container.
 *
 * Used for custom modals, popovers, or any overlay that needs focus trapping.
 * Note: Radix-based dialogs (Dialog, AlertDialog, Sheet) handle this
 * automatically. Only use this for custom non-Radix overlays.
 *
 * Usage:
 *   const trapRef = useFocusTrap(isOpen);
 *   return <div ref={trapRef}>...focusable content...</div>
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "[contenteditable]",
].join(", ");

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
    ).filter((el) => !el.hasAttribute("aria-hidden"));
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Store currently focused element for restoration
    previousFocusRef.current = document.activeElement;

    // Focus the first focusable element
    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        focusables[0].focus();
      });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: wrap from first to last
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus to previously focused element
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, getFocusableElements]);

  return containerRef;
}
