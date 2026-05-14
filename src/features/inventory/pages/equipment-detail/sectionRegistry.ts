// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT DETAIL — Section Registry
// ═══════════════════════════════════════════════════════════════════════════

import type { SectionRendererMap } from "./types";

import FinancialSectionRenderer from "./sections/FinancialSectionRenderer";
import LocationStatusSectionRenderer from "./sections/LocationStatusSectionRenderer";
import NotesSectionRenderer from "./sections/NotesSectionRenderer";
import SpecificationsSectionRenderer from "./sections/SpecificationsSectionRenderer";

export const sectionRegistry = {
  specifications: SpecificationsSectionRenderer,
  financial: FinancialSectionRenderer,
  "location-status": LocationStatusSectionRenderer,
  notes: NotesSectionRenderer,
} satisfies SectionRendererMap;
