/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOTION SYSTEM — Centralized animation constants & utilities.
 *
 * All motion values are designed for "Professional Clarity" — subtle,
 * functional, never distracting. Animations serve UX purpose: orientation,
 * feedback, hierarchy, or state change communication.
 *
 * Principles:
 *   1. Motion duration ≤ 400ms — never theatrical
 *   2. Respect prefers-reduced-motion (handled by CSS + hook)
 *   3. Entrance animations only — no exit animations (React DOM removal is instant)
 *   4. Stagger delay capped at 400ms total spread
 *   5. Use CSS transitions for hover/focus; CSS animations for entrance
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── Durations (ms) ────────────────────────────────────────────────────────

export const duration = {
  /** Micro-feedback: focus ring, checkbox, toggle */
  instant: 100,
  /** Default transition: hover, color change */
  fast: 150,
  /** Standard motion: slide, fade, scale */
  normal: 200,
  /** Page entrance, modal open */
  moderate: 300,
  /** Staggered children entrance spread */
  entrance: 400,
} as const;

// ─── Easing curves ─────────────────────────────────────────────────────────

export const easing = {
  /** Standard deceleration (enter) — elements arriving */
  decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
  /** Standard acceleration (exit) — elements leaving */
  accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
  /** Standard emphasis — snap into place (default for most transitions) */
  snap: "cubic-bezier(0.25, 1, 0.5, 1)",
  /** Spring overshoot — playful but controlled (tooltip bounce, FAB) */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  /** Linear — only for progress bars */
  linear: "linear",
} as const;

// ─── Tailwind class presets ────────────────────────────────────────────────
// Pre-composed className strings for common motion patterns.

export const motion = {
  /** Hover lift for cards — translateY(-2px) + shadow increase */
  hoverLift:
    "transition-all duration-200 ease-snap hover:-translate-y-0.5 hover:shadow-lg",

  /** Hover glow for primary-action cards */
  hoverGlow:
    "transition-shadow duration-200 ease-snap hover:shadow-[0_0_20px_2px_hsl(152_65%_38%/0.15)]",

  /** Subtle scale on press for buttons and clickable cards */
  pressScale:
    "active:scale-[0.97] transition-transform duration-fast ease-snap",

  /** Fade-in entrance animation (page content) */
  fadeIn: "animate-fade-in",

  /** Scale-in entrance (modals, popovers) */
  scaleIn: "animate-scale-in",

  /** Slide-up entrance (bottom sheets, toasts) */
  slideUp: "animate-slide-up",

  /** Slide-in from left (sidebar items) */
  slideIn: "animate-slide-in",

  /** Focus ring — consistent across all interactive elements */
  focusRing:
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",

  /** Table row hover */
  rowHover: "transition-colors duration-fast ease-snap hover:bg-muted/50",

  /** Badge/pill hover (for clickable badges) */
  badgeHover: "transition-colors duration-fast ease-snap hover:opacity-80",

  /** Button transition */
  button: "transition-colors duration-fast ease-snap",

  /** Input transition */
  input: "transition-[border-color,box-shadow] duration-fast ease-snap",
} as const;

// ─── Stagger utilities ─────────────────────────────────────────────────────

/**
 * Returns an inline style for staggered entrance animations.
 * Delay is capped at `maxDelay` to avoid sluggish page loads.
 *
 * Usage:
 *   <div style={staggerDelay(index)}>...</div>
 */
export function staggerDelay(
  index: number,
  baseDelay = 50,
  maxDelay = 400,
): React.CSSProperties {
  return {
    animationDelay: `${Math.min(index * baseDelay, maxDelay)}ms`,
    animationFillMode: "both",
  };
}

/**
 * Returns transition-delay style for staggered CSS transitions.
 */
export function transitionDelay(
  index: number,
  baseDelay = 30,
  maxDelay = 300,
): React.CSSProperties {
  return {
    transitionDelay: `${Math.min(index * baseDelay, maxDelay)}ms`,
  };
}

// ─── Reduced motion ────────────────────────────────────────────────────────

/**
 * Returns true if the user prefers reduced motion.
 * For use in imperative code (event handlers, effects).
 * Prefer the CSS `prefers-reduced-motion` media query for styling.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
