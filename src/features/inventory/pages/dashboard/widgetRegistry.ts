// ═══════════════════════════════════════════════════════════════════════════
// WIDGET REGISTRY — Polymorphism Over Conditionals (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════
//
// Maps every InventoryWidget['type'] discriminant to its renderer component.
// TypeScript enforces exhaustiveness: adding a new union member without
// registering it here produces a compile-time error via `satisfies`.
// ═══════════════════════════════════════════════════════════════════════════

import type { ComponentType } from "react";
import type { InventoryWidget } from "./types";

import KpiRowRenderer from "./widgets/KpiRowRenderer";
import PlantHealthRenderer from "./widgets/PlantHealthRenderer";
import ChemicalExpiryRenderer from "./widgets/ChemicalExpiryRenderer";
import EquipmentAvailabilityRenderer from "./widgets/EquipmentAvailabilityRenderer";
import TransactionFeedRenderer from "./widgets/TransactionFeedRenderer";
import ActivityHeatmapRenderer from "./widgets/ActivityHeatmapRenderer";
import RecentActivityRenderer from "./widgets/RecentActivityRenderer";
import GrowthTrendsRenderer from "./widgets/GrowthTrendsRenderer";
import ChemicalUsageRenderer from "./widgets/ChemicalUsageRenderer";
import SpeciesHeatmapRenderer from "./widgets/SpeciesHeatmapRenderer";
import EquipmentAnalyticsRenderer from "./widgets/EquipmentAnalyticsRenderer";
import LabPerformanceRenderer from "./widgets/LabPerformanceRenderer";
import KpiTrackerRenderer from "./widgets/KpiTrackerRenderer";
import PredictiveOverlayRenderer from "./widgets/PredictiveOverlayRenderer";
import AiInsightsRenderer from "./widgets/AiInsightsRenderer";

// ─── Type-safe mapping: widget type → component expecting `{ config: T }` ──

type WidgetRendererMap = {
  [K in InventoryWidget["type"]]: ComponentType<{
    config: Extract<InventoryWidget, { type: K }>;
  }>;
};

/**
 * The single source of truth for widget → renderer mapping.
 *
 * Adding a new member to `InventoryWidget` without a corresponding
 * entry here will cause a TypeScript error on `satisfies`.
 */
export const WIDGET_REGISTRY: WidgetRendererMap = {
  "kpi-row": KpiRowRenderer,
  "plant-health": PlantHealthRenderer,
  "chemical-expiry": ChemicalExpiryRenderer,
  "equipment-availability": EquipmentAvailabilityRenderer,
  "transaction-feed": TransactionFeedRenderer,
  "activity-heatmap": ActivityHeatmapRenderer,
  "recent-activity": RecentActivityRenderer,
  "growth-trends": GrowthTrendsRenderer,
  "chemical-usage": ChemicalUsageRenderer,
  "species-heatmap": SpeciesHeatmapRenderer,
  "equipment-analytics": EquipmentAnalyticsRenderer,
  "lab-performance": LabPerformanceRenderer,
  "kpi-tracker": KpiTrackerRenderer,
  "predictive-overlay": PredictiveOverlayRenderer,
  "ai-insights": AiInsightsRenderer,
} satisfies WidgetRendererMap;
