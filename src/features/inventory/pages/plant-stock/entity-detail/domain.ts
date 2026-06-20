// ═══════════════════════════════════════════════════════════════════════════
// PLANT STOCK DETAIL — Pure Domain Logic
// ═══════════════════════════════════════════════════════════════════════════

import { Leaf, Pencil, ArrowUpCircle, ArrowDownCircle, Bookmark, BookmarkMinus } from "lucide-react";
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
      label: "Restock",
      icon: ArrowUpCircle,
      variant: "outline",
      className: "gap-2 font-medium text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950",
      ariaLabel: "Restock plant stock",
    },
    {
      label: "Consume",
      icon: ArrowDownCircle,
      variant: "outline",
      className: "gap-2 font-medium text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950",
      ariaLabel: "Consume plant stock",
    },
    {
      label: "Reserve",
      icon: Bookmark,
      variant: "outline",
      className: "gap-2 font-medium text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950",
      ariaLabel: "Reserve plant stock",
    },
    {
      label: "Release",
      icon: BookmarkMinus,
      variant: "outline",
      className: "gap-2 font-medium text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950",
      ariaLabel: "Release plant stock",
    },
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
