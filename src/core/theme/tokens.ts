/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DESIGN TOKENS — Single source of truth for the Plant Lab design system.
 *
 * These tokens are consumed by Tailwind config, component variants, and
 * any runtime logic that needs design-system awareness. CSS custom properties
 * live in index.css; this file provides TypeScript constants for use in code.
 *
 * Rules:
 *   1. Never hardcode a spacing/color/radius value in a component.
 *   2. If you need a new token, add it here FIRST and reference it.
 *   3. Every token category has a corresponding Tailwind extension.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── Breakpoints ───────────────────────────────────────────────────────────

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1400,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// ─── Spacing ───────────────────────────────────────────────────────────────

export const spacing = {
  /** Main content horizontal padding */
  "page-x": "1.5rem", // 24px
  /** Main content vertical padding */
  "page-y": "1.5rem", // 24px
  /** Gap between page sections (PageHeader → QuickStats → Table) */
  section: "1.5rem", // 24px
  /** Card internal padding */
  card: "1.25rem", // 20px
  /** Compact card padding (data-heavy contexts) */
  "card-compact": "1rem", // 16px
  /** Table cell horizontal padding */
  "cell-x": "1rem", // 16px
  /** Table cell vertical padding */
  "cell-y": "0.75rem", // 12px
} as const;

// ─── Typography ────────────────────────────────────────────────────────────

export const typography = {
  display: {
    size: "30px",
    lineHeight: "38px",
    weight: 600,
    tracking: "-0.02em",
  },
  h1: { size: "20px", lineHeight: "30px", weight: 500, tracking: "-0.02em" },
  h2: { size: "18px", lineHeight: "28px", weight: 600, tracking: "-0.015em" },
  h3: { size: "16px", lineHeight: "24px", weight: 500, tracking: "-0.01em" },
  h4: { size: "14px", lineHeight: "22px", weight: 500, tracking: "0em" },
  body: { size: "14px", lineHeight: "22px", weight: 400, tracking: "-0.006em" },
  "body-sm": { size: "13px", lineHeight: "20px", weight: 400, tracking: "0em" },
  caption: { size: "12px", lineHeight: "18px", weight: 400, tracking: "0em" },
  mono: { size: "12px", lineHeight: "18px", weight: 400, tracking: "0em" },
} as const;

export type TypographyLevel = keyof typeof typography;

// ─── Border Radius ─────────────────────────────────────────────────────────

export const radius = {
  none: "0",
  sm: "4px",
  DEFAULT: "8px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  full: "9999px",
} as const;

/** Semantic radius assignments */
export const radiusMapping = {
  input: "lg",
  card: "xl",
  badge: "full",
  button: "lg",
  modal: "xl",
  tooltip: "lg",
} as const;

// ─── Shadows ───────────────────────────────────────────────────────────────

export const shadows = {
  /** Flat — inline elements, table cells */
  flat: "none",
  /** Raised — input fields, small badges */
  raised: "var(--shadow-sm)",
  /** Card — cards, stat boxes */
  card: "var(--shadow-md)",
  /** Card hover */
  "card-hover": "var(--shadow-lg)",
  /** Dropdown — popovers, select menus */
  dropdown: "var(--shadow-lg)",
  /** Modal — dialogs, sheets */
  modal: "var(--shadow-xl)",
  /** Toast — notifications */
  toast: "var(--shadow-2xl)",
} as const;

export type ShadowLevel = keyof typeof shadows;

// ─── Z-Index ───────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 50,
  sticky: 60,
  modal: 100,
  toast: 200,
  overlay: 300,
  max: 9999,
} as const;

export type ZLayer = keyof typeof zIndex;

// ─── Transitions ───────────────────────────────────────────────────────────

export const transitions = {
  fast: { duration: "100ms", easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  default: { duration: "150ms", easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  slow: { duration: "300ms", easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  spring: { duration: "500ms", easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
} as const;

export type TransitionSpeed = keyof typeof transitions;

// ─── Semantic Color Roles ──────────────────────────────────────────────────

export const statusColors = {
  active: "default" as const,
  inactive: "secondary" as const,
  pending: "warning" as const,
  approved: "success" as const,
  rejected: "destructive" as const,
  expired: "destructive" as const,
  overdue: "destructive" as const,
  draft: "secondary" as const,
  archived: "outline" as const,
  info: "default" as const,
} as const;

export type StatusKey = keyof typeof statusColors;

// ─── Grid Layouts ──────────────────────────────────────────────────────────

export const gridColumns = {
  /** Entity card grid */
  cards: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  /** Dashboard widget grid */
  dashboard: "grid-cols-1 lg:grid-cols-2",
  /** Stat cards */
  stats: "grid-cols-2 lg:grid-cols-4",
  /** Form fields (2-col) */
  form: "grid-cols-1 md:grid-cols-2",
} as const;

export type GridLayout = keyof typeof gridColumns;

// ─── Density ───────────────────────────────────────────────────────────────

export const density = {
  comfortable: {
    cardPadding: "p-5",
    cellY: "py-3",
    sectionGap: "space-y-6",
    gap: "gap-4",
  },
  compact: {
    cardPadding: "p-4",
    cellY: "py-2",
    sectionGap: "space-y-4",
    gap: "gap-3",
  },
} as const;

export type Density = keyof typeof density;

// ─── Component Size Scale ──────────────────────────────────────────────────

export const iconButtonSize = {
  /** Dense contexts — table rows (28px) */
  "icon-sm": "h-7 w-7",
  /** Standard contexts — cards, toolbars (36px) */
  icon: "h-9 w-9",
} as const;
