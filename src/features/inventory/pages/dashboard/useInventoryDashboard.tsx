// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY DASHBOARD — Custom Hook (Phase 3)
// ═══════════════════════════════════════════════════════════════════════════
//
// Owns ALL business logic: greeting computation, date formatting,
// KPI stat assembly, and full page configuration.
//
// The hook returns a memoized `InventoryDashboardConfig` — the single
// data structure consumed by the rendering engine.
// ═══════════════════════════════════════════════════════════════════════════

import type { DashboardData } from "@/features/inventory/services/dashboardService";
import { useDashboardData } from "@/features/inventory/services/dashboardService";
import {
    ArrowLeftRight,
    BarChart3,
    FlaskConical,
    LayoutGrid,
    Leaf,
    Lightbulb,
    Wrench,
} from "lucide-react";
import { useMemo } from "react";
import type { InventoryDashboardConfig, KpiStat } from "./types";

// ─── Pure Helpers ──────────────────────────────────────────────────────────

function buildDateLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildKpiStats(data: DashboardData | undefined): KpiStat[] {
  if (!data) {
    return [
      {
        title: "Plant Species",
        value: "—",
        subtitle: "Loading…",
        icon: <Leaf className="h-5 w-5 text-primary" />,
      },
      {
        title: "Chemical Stocks",
        value: "—",
        subtitle: "Loading…",
        icon: <FlaskConical className="h-5 w-5 text-primary" />,
      },
      {
        title: "Equipment Units",
        value: "—",
        subtitle: "Loading…",
        icon: <Wrench className="h-5 w-5 text-primary" />,
      },
      {
        title: "Overdue Borrows",
        value: "—",
        subtitle: "Loading…",
        icon: <ArrowLeftRight className="h-5 w-5 text-primary" />,
      },
    ];
  }

  const availableEquipment = data.equipment_by_status?.available ?? 0;
  const expiringSoon = data.chemicals_expiring_soon ?? 0;

  return [
    {
      title: "Plant Species",
      value: String(data.plant_species_count),
      subtitle: `${data.plant_samples_count} samples tracked`,
      icon: <Leaf className="h-5 w-5 text-primary" />,
    },
    {
      title: "Chemical Stocks",
      value: String(data.chemicals_count),
      subtitle:
        expiringSoon > 0 ? `${expiringSoon} near expiry` : "All in date",
      icon: <FlaskConical className="h-5 w-5 text-primary" />,
      trend:
        data.chemicals_expired > 0
          ? { value: data.chemicals_expired, label: "expired", positive: false }
          : undefined,
    },
    {
      title: "Equipment Units",
      value: String(data.equipment_count),
      subtitle: `${availableEquipment} available`,
      icon: <Wrench className="h-5 w-5 text-primary" />,
    },
    {
      title: "Overdue Borrows",
      value: String(data.overdue_borrows_count),
      subtitle:
        data.overdue_borrows_count > 0 ? "Items need attention" : "All clear",
      icon: <ArrowLeftRight className="h-5 w-5 text-primary" />,
      trend:
        data.overdue_borrows_count > 0
          ? {
              value: data.overdue_borrows_count,
              label: "overdue",
              positive: false,
            }
          : undefined,
    },
  ];
}

// ─── Return Type ───────────────────────────────────────────────────────────

export interface UseInventoryDashboardResult {
  config: InventoryDashboardConfig;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useInventoryDashboard(): UseInventoryDashboardResult {
  const { data: dashboardData } = useDashboardData();

  const config = useMemo<InventoryDashboardConfig>(() => {
    const dateLabel = buildDateLabel();
    const kpiStats = buildKpiStats(dashboardData);

    return {
      header: {
        icon: LayoutGrid,
        title: "Inventory Dashboard",
        subtitle:
          "Monitor plant stock, chemicals, equipment, and lab transactions.",
        dateLabel,
      },

      globalWidgets: [{ type: "kpi-row", stats: kpiStats }],

      tabs: [
        // ─── Overview Tab ────────────────────────────────
        {
          id: "overview",
          label: "Overview",
          icon: LayoutGrid,
          widgets: [
            { type: "plant-health" },
            { type: "chemical-expiry" },
            { type: "equipment-availability" },
            { type: "transaction-feed" },
            { type: "activity-heatmap" },
            { type: "recent-activity" },
          ],
        },
        // ─── Analytics Tab ───────────────────────────────
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
          widgets: [
            { type: "growth-trends" },
            { type: "chemical-usage" },
            { type: "species-heatmap" },
            { type: "equipment-analytics" },
            { type: "lab-performance" },
            { type: "kpi-tracker" },
            { type: "predictive-overlay" },
          ],
        },
        // ─── AI Insights Tab ─────────────────────────────
        {
          id: "insights",
          label: "AI Insights",
          icon: Lightbulb,
          widgets: [
            { type: "ai-insights" },
            { type: "kpi-tracker" },
            { type: "predictive-overlay" },
          ],
        },
      ],
    };
  }, [dashboardData]);

  return { config };
}
