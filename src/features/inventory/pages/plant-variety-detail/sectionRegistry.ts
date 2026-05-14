// ═══════════════════════════════════════════════════════════════════════════
// PLANT VARIETY DETAIL — Section Registry
// ═══════════════════════════════════════════════════════════════════════════

import type { SectionRendererMap } from "./types";

import NotesSection from "./sections/NotesSection";
import VarietyInfoSection from "./sections/VarietyInfoSection";

export const sectionRegistry = {
  "variety-info": VarietyInfoSection,
  notes: NotesSection,
} satisfies SectionRendererMap;
