// ═══════════════════════════════════════════════════════════════════════════
// CHEMICAL DETAIL — Pure Domain Functions (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════
//
// Zero React imports. Zero side effects. Pure functions only.
// ═══════════════════════════════════════════════════════════════════════════

import {
    ArrowDownCircle,
    ArrowUpCircle,
    FileText,
    FlaskConical,
    Pencil,
    Printer,
} from "lucide-react";
import type { ActionButton } from "./types";

// ─── Color / Badge Logic ─────────────────────────────────────────────────

export const hazardColor = (hazard: string): string => {
  switch (hazard) {
    case "high":
      return "hsl(0, 72%, 51%)";
    case "medium":
      return "hsl(38, 92%, 50%)";
    case "low":
      return "hsl(145, 63%, 32%)";
    default:
      return "hsl(210, 20%, 50%)";
  }
};

export const hazardBadgeClass = (hazard: string): string => {
  switch (hazard) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-primary text-primary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const expiryBadge = (
  daysLeft: number,
): { label: string; className: string } => {
  if (daysLeft < 0)
    return {
      label: "Expired",
      className: "bg-destructive text-destructive-foreground",
    };
  if (daysLeft <= 14)
    return {
      label: `${daysLeft}d left`,
      className:
        "bg-destructive/10 text-destructive border border-destructive/30",
    };
  if (daysLeft <= 30)
    return {
      label: `${daysLeft}d left`,
      className: "bg-warning/10 text-warning border border-warning/30",
    };
  return {
    label: `${daysLeft}d left`,
    className: "bg-muted text-primary border",
  };
};

export const expiryColor = (daysLeft: number): string =>
  daysLeft < 0 ? "hsl(0,72%,51%)" : "hsl(38,92%,50%)";

// ─── Date Formatting ─────────────────────────────────────────────────────

export const formatDate = (iso: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Icon Color ──────────────────────────────────────────────────────────

export const CHEMICAL_FALLBACK_ICON = FlaskConical;

// ─── Action Buttons ──────────────────────────────────────────────────────

export const buildActions = (): ActionButton[] => [
  {
    label: "Increase Qty",
    icon: ArrowUpCircle,
    variant: "outline",
    className: "gap-2 border font-medium text-primary",
    ariaLabel: "Increase chemical quantity",
  },
  {
    label: "Reduce Qty",
    icon: ArrowDownCircle,
    variant: "outline",
    className: "gap-2 border font-medium text-destructive",
    ariaLabel: "Reduce chemical quantity",
  },
  {
    label: "Edit",
    icon: Pencil,
    variant: "outline",
    className: "gap-2 border font-medium",
    ariaLabel: "Edit chemical",
  },
  {
    label: "View SDS",
    icon: FileText,
    variant: "outline",
    className: "gap-2 border font-medium",
    ariaLabel: "View Safety Data Sheet",
  },
  {
    label: "Print Label",
    icon: Printer,
    variant: "outline",
    className: "gap-2 border font-medium",
    ariaLabel: "Print chemical label",
  },
];
