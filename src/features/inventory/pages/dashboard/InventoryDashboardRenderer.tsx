// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY DASHBOARD RENDERER — Dynamic Rendering Engine (Phase 4)
// ═══════════════════════════════════════════════════════════════════════════
//
// This component has ZERO knowledge of individual widget implementations.
// It receives a config, looks up each widget's renderer from the registry,
// and delegates rendering via the `WidgetSlot` abstraction.
//
// Each tab has its own layout strategy to preserve intentional grid
// arrangements (e.g. 2-column pairs, full-width rows, 3-column sidebar).
// ═══════════════════════════════════════════════════════════════════════════

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/core/auth/useAuth";
import { getGreeting } from "@/shared/lib/greeting";
import { Clock } from "lucide-react";
import type {
    DashboardHeader,
    DashboardTab,
    InventoryDashboardConfig,
    InventoryWidget,
} from "./types";
import { WIDGET_REGISTRY } from "./widgetRegistry";

// ─── Exhaustiveness Guard ──────────────────────────────────────────────────

function assertNever(value: never): never {
  throw new Error(`Unhandled widget type: ${JSON.stringify(value)}`);
}

// ─── Single Widget Renderer ────────────────────────────────────────────────

interface WidgetSlotProps {
  widget: InventoryWidget;
}

/**
 * Resolves the correct renderer for a widget config via the registry.
 * The `assertNever` call guarantees compile-time exhaustiveness when
 * the union grows.
 */
const WidgetSlot = ({ widget }: WidgetSlotProps) => {
  const type = widget.type;

  if (type in WIDGET_REGISTRY) {
    const Renderer = WIDGET_REGISTRY[type] as React.ComponentType<{
      config: typeof widget;
    }>;
    return <Renderer config={widget} />;
  }

  return assertNever(type as never);
};

// ─── Page Header ───────────────────────────────────────────────────────────

interface PageHeaderProps {
  header: DashboardHeader;
}

const PageHeader = ({ header }: PageHeaderProps) => {
  const Icon = header.icon;
  const { user } = useAuth();
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between border-b border-border pb-6 gap-4">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {getGreeting(user?.name)}
        </p>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-medium text-foreground">
            {header.title}
          </h1>
        </div>
        <p className="text-muted-foreground font-medium">{header.subtitle}</p>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{header.dateLabel}</span>
      </div>
    </div>
  );
};

// ─── Tab Content Layout Strategies ─────────────────────────────────────────

/**
 * Overview: 3 rows of 2-column pairs.
 *
 * Row 1: PlantHealth + ChemicalExpiry
 * Row 2: EquipmentAvailability + TransactionFeed
 * Row 3: ActivityHeatmap + RecentActivity
 */
function renderOverviewLayout(widgets: InventoryWidget[]) {
  const pairs: [string, string][] = [
    ["plant-health", "chemical-expiry"],
    ["equipment-availability", "transaction-feed"],
    ["activity-heatmap", "recent-activity"],
  ];

  return pairs.map(([leftType, rightType]) => {
    const left = widgets.find((w) => w.type === leftType);
    const right = widgets.find((w) => w.type === rightType);
    if (!left && !right) return null;

    return (
      <div
        key={`${leftType}-${rightType}`}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        {left && <WidgetSlot widget={left} />}
        {right && <WidgetSlot widget={right} />}
      </div>
    );
  });
}

/**
 * Analytics: GrowthTrends full-width, then 3 rows of 2-column pairs.
 *
 * Row 1: GrowthTrends (full width)
 * Row 2: ChemicalUsage + SpeciesHeatmap
 * Row 3: EquipmentAnalytics + LabPerformance
 * Row 4: KpiTracker + PredictiveOverlay
 */
function renderAnalyticsLayout(widgets: InventoryWidget[]) {
  const growthTrends = widgets.find((w) => w.type === "growth-trends");

  const pairs: [string, string][] = [
    ["chemical-usage", "species-heatmap"],
    ["equipment-analytics", "lab-performance"],
    ["kpi-tracker", "predictive-overlay"],
  ];

  return (
    <>
      {growthTrends && <WidgetSlot widget={growthTrends} />}
      {pairs.map(([leftType, rightType]) => {
        const left = widgets.find((w) => w.type === leftType);
        const right = widgets.find((w) => w.type === rightType);
        if (!left && !right) return null;

        return (
          <div
            key={`${leftType}-${rightType}`}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {left && <WidgetSlot widget={left} />}
            {right && <WidgetSlot widget={right} />}
          </div>
        );
      })}
    </>
  );
}

/**
 * AI Insights: 3-column grid.
 *
 * AiInsights spans 2 columns, KpiTracker + PredictiveOverlay in sidebar.
 */
function renderInsightsLayout(widgets: InventoryWidget[]) {
  const aiInsights = widgets.find((w) => w.type === "ai-insights");
  const sidebarWidgets = widgets.filter(
    (w) => w.type === "kpi-tracker" || w.type === "predictive-overlay",
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        {aiInsights && <WidgetSlot widget={aiInsights} />}
      </div>
      <div className="space-y-6">
        {sidebarWidgets.map((widget, index) => (
          <WidgetSlot key={`${widget.type}-${index}`} widget={widget} />
        ))}
      </div>
    </div>
  );
}

const TAB_LAYOUT_STRATEGY: Record<
  string,
  (widgets: InventoryWidget[]) => React.ReactNode
> = {
  overview: renderOverviewLayout,
  analytics: renderAnalyticsLayout,
  insights: renderInsightsLayout,
};

function renderTabContent(tab: DashboardTab) {
  const strategy = TAB_LAYOUT_STRATEGY[tab.id];
  if (strategy) return strategy(tab.widgets);

  // Fallback: render widgets sequentially (safe default for new tabs)
  return tab.widgets.map((widget, index) => (
    <WidgetSlot key={`${widget.type}-${index}`} widget={widget} />
  ));
}

// ─── Main Dashboard Renderer ───────────────────────────────────────────────

interface DashboardRendererProps {
  config: InventoryDashboardConfig;
}

const InventoryDashboardRenderer = ({ config }: DashboardRendererProps) => (
  <div className="space-y-6 stagger-children">
    <PageHeader header={config.header} />

    {config.globalWidgets.map((widget, index) => (
      <WidgetSlot key={`global-${widget.type}-${index}`} widget={widget} />
    ))}

    <Tabs defaultValue={config.tabs[0]?.id} className="space-y-6">
      <TabsList className="bg-card p-1 h-auto rounded-lg">
        {config.tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg"
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {config.tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-0">
          {renderTabContent(tab)}
        </TabsContent>
      ))}
    </Tabs>
  </div>
);

export default InventoryDashboardRenderer;
