/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED STATUS STYLE SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for all status badge styles across the application.
 * Eliminates duplication (previously defined in 9+ separate files).
 *
 * Uses the minimalist design system: subtle colors, soft edges, lowercase.
 * All styles include dark mode variants for proper contrast.
 */

/* ─── Experiment Status ─────────────────────────────────────────────────── */

export const experimentStatusStyles: Record<string, string> = {
  // snake_case keys (API values)
  planning: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  paused: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  completed:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  failed: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  // PascalCase keys (legacy mock data)
  Planning: "bg-muted text-muted-foreground",
  Active: "bg-primary/10 text-primary",
  Paused: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Completed:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Failed: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

export const experimentStatusColors: Record<string, string> = {
  planning: "hsl(var(--muted-foreground))",
  active: "hsl(var(--primary))",
  paused: "#d97706",
  completed: "#059669",
  failed: "#dc2626",
  Planning: "hsl(var(--muted-foreground))",
  Active: "hsl(var(--primary))",
  Paused: "#d97706",
  Completed: "#059669",
  Failed: "#dc2626",
};

/* ─── Growth Stage ──────────────────────────────────────────────────────── */

export const growthStageStyles: Record<string, string> = {
  germination: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  seedling: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  vegetative:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  hardening: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  ready: "bg-muted text-primary",
  Germination: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  Seedling: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  Vegetative:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Hardening: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Ready: "bg-muted text-primary",
};

/* ─── Protocol Status ───────────────────────────────────────────────────── */

export const protocolStatusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  archived: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Draft: "bg-muted text-muted-foreground",
  Active: "bg-primary/10 text-primary",
  Archived: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
};

/* ─── Contract Status ───────────────────────────────────────────────────── */

export const contractStatusStyles: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Sent: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  Signed:
    "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  "In Production": "bg-primary/10 text-primary",
  Ready: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Delivered:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Cancelled: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

/* ─── Payment Status ────────────────────────────────────────────────────── */

export const paymentStatusStyles: Record<string, string> = {
  Received:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Pending: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Overdue: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  Cancelled: "bg-muted text-muted-foreground",
};

/* ─── Client Type ───────────────────────────────────────────────────────── */

export const clientTypeStyles: Record<string, string> = {
  "Farm Owner":
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Investor:
    "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  Government: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  NGO: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  "Research Partner": "bg-muted text-primary",
};

/* ─── Milestone Status ──────────────────────────────────────────────────── */

export const milestoneStatusStyles: Record<string, string> = {
  Completed:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  "On Track": "bg-muted text-primary",
  "At Risk": "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Pending: "bg-muted text-muted-foreground",
  Missed: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

/* ─── Equipment Status ──────────────────────────────────────────────────── */

export const equipmentStatusStyles: Record<string, string> = {
  available:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  in_use: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  borrowed: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  under_maintenance:
    "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  retired: "bg-muted text-muted-foreground",
};

/* ─── Borrow Record Status ──────────────────────────────────────────────── */

export const borrowStatusStyles: Record<string, string> = {
  borrowed: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  returned:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  overdue: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

/* ─── Plant Sample Status ───────────────────────────────────────────────── */

export const sampleStatusStyles: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  inactive: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  archived: "bg-muted text-muted-foreground",
  "In Testing": "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  Consumed:
    "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  Contaminated: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  Destroyed: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  Active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Inactive: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Archived: "bg-muted text-muted-foreground",
  Depleted: "bg-muted text-muted-foreground",
};

/* ─── Plant Variety Status ──────────────────────────────────────────────── */

export const varietyStatusStyles: Record<string, string> = {
  Active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Archived: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Destroyed: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  Inactive: "bg-muted text-muted-foreground",
};

/* ─── Plant Stock Status ────────────────────────────────────────────────── */

export const stockStatusStyles: Record<string, string> = {
  available:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  reserved: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  depleted: "bg-muted text-muted-foreground",
  expired: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

/* ─── Lab Service Status ────────────────────────────────────────────────── */

export const labServiceStatusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  "In Progress": "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  Completed:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Delivered: "bg-muted text-primary",
};

/* ─── Lab Service Payment Status ────────────────────────────────────────── */

export const labServicePaymentStyles: Record<string, string> = {
  Unpaid: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  Partial: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Paid: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
};

/* ─── Reusable Status Badge Component Helper ────────────────────────────── */

/**
 * Returns the full className for a status badge.
 * Usage: `<span className={cn(statusBadge(experimentStatusStyles, status))}>{status}</span>`
 */
export function statusBadge(
  styles: Record<string, string>,
  status: string,
  _withBorder = false,
): string {
  const base = "text-xs font-medium px-2.5 py-1 rounded-full";
  const variant = styles[status] ?? "bg-muted text-muted-foreground";
  return `${base} ${variant}`;
}

/* ─── Health Score Color ────────────────────────────────────────────────── */

export function healthScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 6) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

/* ─── Confidence Level ──────────────────────────────────────────────────── */

export function confidenceLevel(completedExperiments: number): {
  label: string;
  color: string;
  barColor: string;
  pct: number;
} {
  if (completedExperiments >= 3) {
    return {
      label: "HIGH",
      color: "text-emerald-600",
      barColor: "bg-emerald-500",
      pct: 100,
    };
  }
  if (completedExperiments >= 2) {
    return {
      label: "MEDIUM",
      color: "text-amber-600",
      barColor: "bg-amber-500",
      pct: 66,
    };
  }
  return {
    label: "LOW",
    color: "text-red-500",
    barColor: "bg-red-400",
    pct: 33,
  };
}
