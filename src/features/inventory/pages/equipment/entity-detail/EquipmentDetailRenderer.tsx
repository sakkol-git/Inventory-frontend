// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT DETAIL — Stateless Rendering Engine
// ═══════════════════════════════════════════════════════════════════════════

import {
  DetailLayout,
  createSectionDispatch,
} from "@/shared/components/detail/DetailLayout";
import { sectionRegistry } from "./sectionRegistry";
import type { EquipmentPageConfig, DetailSection, StatusAlert } from "./types";

const renderSection = createSectionDispatch<DetailSection>(sectionRegistry);

// ─── Alert Banner ────────────────────────────────────────────────────────

const AlertBanner = ({ alert }: { alert: StatusAlert }) => {
  const Icon = alert.icon;
  return (
    <div className={`flex items-center gap-3 p-4 border rounded-lg ${alert.borderClass} ${alert.bgClass}`}>
      <Icon className="h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-medium">{alert.title}</p>
        <p className="text-xs text-muted-foreground">{alert.subtitle}</p>
      </div>
    </div>
  );
};

// ─── Renderer ────────────────────────────────────────────────────────────

const EquipmentDetailRenderer = ({ config }: { config: EquipmentPageConfig }) => (
  <DetailLayout<DetailSection>
    header={config.header}
    actions={config.actions}
    heroImage={config.heroImage}
    kpiStrip={config.kpiStrip}
    alerts={
      <>
        {config.alerts.map((alert, i) => (
          <AlertBanner key={i} alert={alert} />
        ))}
      </>
    }
    mainSections={config.mainSections}
    sidebarSections={config.sidebarSections}
    renderSection={renderSection}
  />
);

export default EquipmentDetailRenderer;
