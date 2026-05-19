// ═══════════════════════════════════════════════════════════════════════════
// PLANT SAMPLE DETAIL — Section Registry
// ═══════════════════════════════════════════════════════════════════════════

import type { SectionRendererMap } from "./types";

import NotesSection from "./sections/NotesSection";
import OwnershipSection from "./sections/OwnershipSection";
import SampleInfoSection from "./sections/SampleInfoSection";
import StorageSection from "./sections/StorageSection";

export const sectionRegistry = {
  "sample-info": SampleInfoSection,
  ownership: OwnershipSection,
  storage: StorageSection,
  notes: NotesSection,
} satisfies SectionRendererMap;
