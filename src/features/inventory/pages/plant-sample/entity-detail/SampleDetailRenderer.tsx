// ═══════════════════════════════════════════════════════════════════════════
// PLANT SAMPLE DETAIL — Stateless Rendering Engine
// ═══════════════════════════════════════════════════════════════════════════

import {
    DetailLayout,
    createSectionDispatch,
} from "@/shared/components/detail/DetailLayout";
import { sectionRegistry } from "./sectionRegistry";
import type { DetailSection, SamplePageConfig } from "./types";

const renderSection = createSectionDispatch<DetailSection>(sectionRegistry);

const SampleDetailRenderer = ({ config }: { config: SamplePageConfig }) => (
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

export default SampleDetailRenderer;
