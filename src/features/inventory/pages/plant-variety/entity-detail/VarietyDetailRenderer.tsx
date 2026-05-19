// ═══════════════════════════════════════════════════════════════════════════
// PLANT VARIETY DETAIL — Stateless Rendering Engine
// ═══════════════════════════════════════════════════════════════════════════

import {
    DetailLayout,
    createSectionDispatch,
} from "@/shared/components/detail/DetailLayout";
import { sectionRegistry } from "./sectionRegistry";
import type { DetailSection, VarietyPageConfig } from "./types";

const renderSection = createSectionDispatch<DetailSection>(sectionRegistry);

const VarietyDetailRenderer = ({ config }: { config: VarietyPageConfig }) => (
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

export default VarietyDetailRenderer;
