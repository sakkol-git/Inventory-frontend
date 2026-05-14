/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACCESSIBILITY UTILITIES — WCAG 2.2 AA compliance helpers.
 *
 * Provides:
 *   - Keyboard navigation helpers for custom widgets (cards, grids)
 *   - Live region announcement utility
 *   - Focus management primitives
 *   - ARIA attribute builders
 *
 * These are NOT replacements for semantic HTML — they supplement it.
 * Always prefer <button>, <a>, <input> over divs with roles.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { KeyboardEvent } from "react";

// ─── Keyboard Navigation ───────────────────────────────────────────────────

/**
 * Arrow-key navigation handler for grid/list patterns.
 * Manages roving tabindex within a container.
 *
 * Usage:
 *   <div onKeyDown={(e) => handleGridKeyDown(e, items.length, currentIndex, setIndex)}>
 *     {items.map((item, i) => (
 *       <div tabIndex={i === currentIndex ? 0 : -1} ...>
 *     ))}
 *   </div>
 */
export function handleGridKeyDown(
  event: KeyboardEvent,
  itemCount: number,
  currentIndex: number,
  setIndex: (index: number) => void,
  columns = 1,
): void {
  let nextIndex = currentIndex;

  switch (event.key) {
    case "ArrowRight":
      nextIndex = Math.min(currentIndex + 1, itemCount - 1);
      break;
    case "ArrowLeft":
      nextIndex = Math.max(currentIndex - 1, 0);
      break;
    case "ArrowDown":
      nextIndex = Math.min(currentIndex + columns, itemCount - 1);
      break;
    case "ArrowUp":
      nextIndex = Math.max(currentIndex - columns, 0);
      break;
    case "Home":
      nextIndex = 0;
      break;
    case "End":
      nextIndex = itemCount - 1;
      break;
    default:
      return; // Don't prevent default for unhandled keys
  }

  if (nextIndex !== currentIndex) {
    event.preventDefault();
    setIndex(nextIndex);

    // Focus the element at the new index
    const container = event.currentTarget as HTMLElement;
    const focusable = container.querySelectorAll<HTMLElement>("[tabindex]");
    focusable[nextIndex]?.focus();
  }
}

/**
 * Enter/Space activation handler for custom clickable elements.
 * Prefer <button> over this whenever possible.
 */
export function handleActivateKeyDown(
  event: KeyboardEvent,
  onActivate: () => void,
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

// ─── Live Region Announcements ─────────────────────────────────────────────

let liveRegion: HTMLElement | null = null;

function getLiveRegion(): HTMLElement {
  if (liveRegion && document.body.contains(liveRegion)) {
    return liveRegion;
  }

  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-atomic", "true");
  el.className = "sr-only";
  el.id = "a11y-live-region";
  document.body.appendChild(el);
  liveRegion = el;
  return el;
}

/**
 * Announce a message to screen readers via a live region.
 * Use for async operation results, filter count changes, etc.
 *
 * Usage:
 *   announce('5 chemicals found');
 *   announce('Item deleted successfully', 'assertive');
 */
export function announce(
  message: string,
  politeness: "polite" | "assertive" = "polite",
): void {
  const region = getLiveRegion();
  region.setAttribute("aria-live", politeness);

  // Clear and re-set to ensure screen readers re-announce
  region.textContent = "";
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

// ─── ARIA Attribute Builders ───────────────────────────────────────────────

/**
 * Build aria-describedby from an array of element IDs, filtering out nulls.
 */
export function ariaDescribedBy(
  ...ids: (string | null | undefined)[]
): string | undefined {
  const filtered = ids.filter(Boolean).join(" ");
  return filtered || undefined;
}

/**
 * Build sort direction ARIA attributes for table column headers.
 */
export function ariaSortProps(
  currentSort: string | null,
  columnKey: string,
  direction: "asc" | "desc" | null,
): {
  "aria-sort"?: "ascending" | "descending" | "none";
  role: "columnheader";
} {
  if (currentSort !== columnKey || !direction) {
    return { role: "columnheader", "aria-sort": "none" };
  }
  return {
    role: "columnheader",
    "aria-sort": direction === "asc" ? "ascending" : "descending",
  };
}

// ─── Skip Navigation ───────────────────────────────────────────────────────

/**
 * Props for the "Skip to main content" link.
 * Should be the first focusable element in the app.
 *
 * Usage:
 *   <a {...skipNavProps}>Skip to main content</a>
 *   ...
 *   <main id="main-content">
 */
export const skipNavProps = {
  href: "#main-content",
  className: "skip-link",
} as const;

// ─── Constants ─────────────────────────────────────────────────────────────

/**
 * Minimum touch target size per WCAG 2.5.8 (AA).
 * Applied via CSS for pointer: coarse in index.css.
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Common ARIA landmark roles for reference.
 */
export const landmarks = {
  main: "main",
  navigation: "navigation",
  search: "search",
  banner: "banner",
  contentinfo: "contentinfo",
  complementary: "complementary",
  region: "region",
} as const;
