// ═══════════════════════════════════════════════════════════════════════════
// PLANT SPECIES DETAIL — Compile-Time Component Registry (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════
//
// `satisfies SectionRendererMap` guarantees:
//  1. Every discriminator key in DetailSection has a renderer
//  2. Each renderer receives the correctly-narrowed props
//  3. Adding a new union member WITHOUT a renderer → compile error
// ═══════════════════════════════════════════════════════════════════════════

import type { SectionRendererMap } from "./types";

import AssociatedBatchesRenderer from "./sections/AssociatedBatchesRenderer";
import BotanicalDescriptionRenderer from "./sections/BotanicalDescriptionRenderer";
import { SamplesListRenderer } from "./sections/SamplesListRenderer";
import { VarietiesListRenderer } from "./sections/VarietiesListRenderer";

export const sectionRegistry = {
  "botanical-description": BotanicalDescriptionRenderer,
  "associated-batches": AssociatedBatchesRenderer,
  "varieties-list": VarietiesListRenderer,
  "samples-list": SamplesListRenderer,
} satisfies SectionRendererMap;
