// ═══════════════════════════════════════════════════════════════════════════
// PLANT SPECIES DETAIL — Pure Domain Logic (Phase 3.1 — Functional Core)
// ═══════════════════════════════════════════════════════════════════════════
//
// Zero React. Zero hooks. Zero side effects.
// Pure functions that transform raw SpeciesDetail into domain-ready shapes.
// ═══════════════════════════════════════════════════════════════════════════

import { Pencil, Sprout } from "lucide-react";
import type { ActionButton } from "./types";

// ─── Constants ───────────────────────────────────────────────────────────

export const SPECIES_ICON_COLOR = "hsl(145, 63%, 32%)";

// ─── Action Buttons ──────────────────────────────────────────────────────

export function buildActions(scientificName: string): ActionButton[] {
  return [
    {
      label: "Edit",
      icon: Pencil,
      variant: "outline",
      className: "gap-2 border font-medium",
      ariaLabel: "Edit species",
    },
    {
      label: "View Stock",
      icon: Sprout,
      variant: "default",
      className: "gap-2 font-medium border",
      ariaLabel: "View stock for this species",
      href: `/plant-stock?species=${encodeURIComponent(scientificName)}`,
    },
  ];
}
