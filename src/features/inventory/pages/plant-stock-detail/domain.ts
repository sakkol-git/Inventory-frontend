// ═══════════════════════════════════════════════════════════════════════════
// PLANT STOCK DETAIL — Pure Domain Logic
// ═══════════════════════════════════════════════════════════════════════════

import { Leaf, Pencil } from "lucide-react";
import type { ActionButton } from "./types";

// ─── Status Colors ───────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  available: "hsl(145, 63%, 32%)",
  reserved: "hsl(38, 92%, 50%)",
  depleted: "hsl(0, 72%, 51%)",
  expired: "hsl(210, 20%, 50%)",
};

const FALLBACK_STATUS_COLOR = "hsl(210, 20%, 50%)";

export function statusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] ?? FALLBACK_STATUS_COLOR;
}

// ─── Status Badge Classes ────────────────────────────────────────────────

const STATUS_BADGE_CLASSES: Record<string, string> = {
  available: "bg-primary text-primary-foreground",
  reserved: "bg-warning text-warning-foreground",
  depleted: "bg-destructive text-destructive-foreground",
  expired: "bg-muted text-muted-foreground",
};

const FALLBACK_BADGE_CLASS = "bg-muted text-muted-foreground";

export function statusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASSES[status.toLowerCase()] ?? FALLBACK_BADGE_CLASS;
}

// ─── Action Buttons ──────────────────────────────────────────────────────

export function buildActions(speciesId: number | null): ActionButton[] {
  const actions: ActionButton[] = [
    {
      label: "Edit",
      icon: Pencil,
      variant: "outline",
      className: "gap-2 border font-medium",
      ariaLabel: "Edit stock entry",
    },
  ];

  if (speciesId) {
    actions.push({
      label: "View Species",
      icon: Leaf,
      variant: "default",
      className: "gap-2 font-medium border",
      ariaLabel: "View parent species",
      href: `/inventory/products/species/${speciesId}`,
    });
  }

  return actions;
}
