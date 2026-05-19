// ═══════════════════════════════════════════════════════════════════════════
// PLANT STOCK DETAIL — Stateless Rendering Engine
// ═══════════════════════════════════════════════════════════════════════════

import {
    DetailLayout,
    createSectionDispatch,
} from "@/shared/components/detail/DetailLayout";
import { sectionRegistry } from "./sectionRegistry";
import type { DetailSection, StockPageConfig } from "./types";

const renderSection = createSectionDispatch<DetailSection>(sectionRegistry);

const StockDetailRenderer = ({ config }: { config: StockPageConfig }) => (
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

export default StockDetailRenderer;
