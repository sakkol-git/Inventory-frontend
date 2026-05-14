/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SkipToContent — Accessibility skip link for keyboard navigation.
 *
 * Phase 15.1 — Screen reader / keyboard support.
 *
 * Rendered at the very top of the page, becomes visible on Tab focus,
 * allowing keyboard users to skip directly to main content.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-2
        focus:bg-primary focus:text-primary-foreground
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        text-sm font-medium
        transition-all
      "
    >
      Skip to content
    </a>
  );
}
