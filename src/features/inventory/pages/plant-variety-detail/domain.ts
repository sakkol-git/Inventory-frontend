// ═══════════════════════════════════════════════════════════════════════════
// PLANT VARIETY DETAIL — Pure Domain Logic
// ═══════════════════════════════════════════════════════════════════════════

import { Leaf, Pencil } from "lucide-react";
import type { ActionButton } from "./types";

// ─── Status Colors ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Active: "hsl(145, 63%, 32%)",
  Archived: "hsl(210, 20%, 50%)",
  Destroyed: "hsl(0, 72%, 51%)",
};

const FALLBACK_STATUS_COLOR = "hsl(210, 20%, 50%)";

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? FALLBACK_STATUS_COLOR;
}

// ─── Status Badge Classes ────────────────────────────────────────────────

const STATUS_BADGE_CLASSES: Record<string, string> = {
  Active: "bg-primary text-primary-foreground",
  Archived: "bg-muted text-muted-foreground",
  Destroyed: "bg-destructive text-destructive-foreground",
};

const FALLBACK_BADGE_CLASS = "bg-muted text-muted-foreground";

export function statusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASSES[status] ?? FALLBACK_BADGE_CLASS;
}

// ─── Action Buttons ──────────────────────────────────────────────────────

export function buildActions(
  speciesId: number | null,
  canEdit: boolean = true,
): ActionButton[] {
  const actions: ActionButton[] = [];

  if (canEdit) {
    actions.push({
      label: "Edit",
      icon: Pencil,
      variant: "outline",
      className: "gap-2 border font-medium",
      ariaLabel: "Edit variety entry",
    });
  }

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
