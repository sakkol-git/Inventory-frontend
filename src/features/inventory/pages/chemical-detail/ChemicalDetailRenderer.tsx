// ═══════════════════════════════════════════════════════════════════════════
// CHEMICAL DETAIL — Stateless Rendering Engine
// ═══════════════════════════════════════════════════════════════════════════

import {
  DetailLayout,
  createSectionDispatch,
} from "@/shared/components/detail/DetailLayout";
import { sectionRegistry } from "./sectionRegistry";
import type { ChemicalPageConfig, DetailSection } from "./types";

const renderSection = createSectionDispatch<DetailSection>(sectionRegistry);

const ChemicalDetailRenderer = ({ config }: { config: ChemicalPageConfig }) => (
  <DetailLayout<DetailSection>
    header={config.header}
    actions={config.actions}
    heroImage={config.heroImage}
    kpiStrip={config.kpiStrip}
    mainSections={config.mainSections}
    sidebarSections={config.sidebarSections}
    renderSection={renderSection}
  />
);

export default ChemicalDetailRenderer;
