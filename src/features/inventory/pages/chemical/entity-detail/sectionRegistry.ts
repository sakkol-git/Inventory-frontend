// ═══════════════════════════════════════════════════════════════════════════
// CHEMICAL DETAIL — Section Registry
// ═══════════════════════════════════════════════════════════════════════════

import ChemicalPropertiesRenderer from "./sections/ChemicalPropertiesRenderer";
import DatesRenderer from "./sections/DatesRenderer";
import SafetyHazardRenderer from "./sections/SafetyHazardRenderer";
import StorageRequirementsRenderer from "./sections/StorageRequirementsRenderer";
import type { SectionRendererMap } from "./types";

export const sectionRegistry = {
  "chemical-properties": ChemicalPropertiesRenderer,
  "safety-hazard": SafetyHazardRenderer,
  "storage-requirements": StorageRequirementsRenderer,
  dates: DatesRenderer,
} satisfies SectionRendererMap;
