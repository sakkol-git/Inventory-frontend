// ═══════════════════════════════════════════════════════════════════════════
// PLANT STOCK DETAIL — Section Registry
// ═══════════════════════════════════════════════════════════════════════════

import type { SectionRendererMap } from "./types";

import BatchInfoSectionRenderer from "./sections/BatchInfoSectionRenderer";
import ParentSpeciesSectionRenderer from "./sections/ParentSpeciesSectionRenderer";
import QuickInfoSectionRenderer from "./sections/QuickInfoSectionRenderer";

export const sectionRegistry = {
  "batch-info": BatchInfoSectionRenderer,
  "parent-species": ParentSpeciesSectionRenderer,
  "quick-info": QuickInfoSectionRenderer,
} satisfies SectionRendererMap;
