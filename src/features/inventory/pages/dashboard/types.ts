// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY DASHBOARD — Type Contracts (Phase 1)
// ═══════════════════════════════════════════════════════════════════════════
//
// Every UI block on the Inventory Dashboard is described by a discriminated
// union member. The rendering engine reads the `type` discriminant and
// delegates to the registry — zero knowledge of implementations.
//
// Most inventory widgets are self-contained (zero-prop) components that
// own their own data. The configuration layer describes *which* widgets
// appear and *where* — not *what data they display*.
// ═══════════════════════════════════════════════════════════════════════════

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// ─── Atomic Data Shapes ────────────────────────────────────────────────────

export interface KpiStat {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  trend?: { value: number; label: string; positive: boolean };
}

// ─── Widget Configurations (Discriminated Union) ───────────────────────────

/** KPI summary row rendered above the tabs */
export interface KpiRowWidget {
  type: "kpi-row";
  stats: KpiStat[];
}

/** Plant inventory health overview (circular progress + stats) */
export interface PlantHealthWidget {
  type: "plant-health";
}

/** Chemical expiry alerts list */
export interface ChemicalExpiryWidget {
  type: "chemical-expiry";
}

/** Equipment availability breakdown (stacked bar + legend) */
export interface EquipmentAvailabilityWidget {
  type: "equipment-availability";
}

/** Live transaction feed */
export interface TransactionFeedWidget {
  type: "transaction-feed";
}

/** Activity heatmap (6-week grid) */
export interface ActivityHeatmapWidget {
  type: "activity-heatmap";
}

/** Recent activity list with user avatars */
export interface RecentActivityWidget {
  type: "recent-activity";
}

/** Growth trends area chart (weekly/monthly toggle) */
export interface GrowthTrendsWidget {
  type: "growth-trends";
}

/** Chemical usage stacked bar chart */
export interface ChemicalUsageWidget {
  type: "chemical-usage";
}

/** Species heatmap (health + population bars) */
export interface SpeciesHeatmapWidget {
  type: "species-heatmap";
}

/** Equipment analytics (donut chart + utilization sparklines) */
export interface EquipmentAnalyticsWidget {
  type: "equipment-analytics";
}

/** Lab performance radar chart */
export interface LabPerformanceWidget {
  type: "lab-performance";
}

/** KPI tracker with progress bars */
export interface KpiTrackerWidget {
  type: "kpi-tracker";
}

/** Predictive forecast line chart */
export interface PredictiveOverlayWidget {
  type: "predictive-overlay";
}

/** AI-powered insights panel */
export interface AiInsightsWidget {
  type: "ai-insights";
}

// ─── The Union ─────────────────────────────────────────────────────────────

export type InventoryWidget =
  | KpiRowWidget
  | PlantHealthWidget
  | ChemicalExpiryWidget
  | EquipmentAvailabilityWidget
  | TransactionFeedWidget
  | ActivityHeatmapWidget
  | RecentActivityWidget
  | GrowthTrendsWidget
  | ChemicalUsageWidget
  | SpeciesHeatmapWidget
  | EquipmentAnalyticsWidget
  | LabPerformanceWidget
  | KpiTrackerWidget
  | PredictiveOverlayWidget
  | AiInsightsWidget;

// ─── Tab Layout ────────────────────────────────────────────────────────────

export interface DashboardTab {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Widgets rendered in document order within the tab */
  widgets: InventoryWidget[];
}

// ─── Page Header ───────────────────────────────────────────────────────────

export interface DashboardHeader {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  dateLabel: string;
}

// ─── Full Page Configuration ───────────────────────────────────────────────

export interface InventoryDashboardConfig {
  header: DashboardHeader;
  s;
  /** Widgets rendered above the tabs (e.g. KPI row) */
  globalWidgets: InventoryWidget[];
  tabs: DashboardTab[];
}
