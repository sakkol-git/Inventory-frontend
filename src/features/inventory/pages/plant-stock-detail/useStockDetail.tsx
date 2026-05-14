// ═══════════════════════════════════════════════════════════════════════════
// PLANT STOCK DETAIL — Typed Custom Hook (Backend-Connected)
// ═══════════════════════════════════════════════════════════════════════════
//
// Fetches single stock from Laravel backend via React Query.
// Returns a domain-ready view model — never raw API responses.
// ═══════════════════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { usePlantStockById } from "@/features/inventory/services/plantStockService";
import type { PlantStockApi } from "@/features/inventory/types";
import { cn } from "@/shared/lib/utils";
import { Clock, Leaf, Package, Sprout } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { buildActions, statusBadgeClass, statusColor } from "./domain";
import type { StockPageConfig } from "./types";

// ─── Return Type ─────────────────────────────────────────────────────────

interface UseStockDetailResult {
  state: "loading" | "not-found" | "ready";
  id: string | undefined;
  config: StockPageConfig | null;
  rawData?: PlantStockApi;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Config Assembly (pure transform) ──────────────────────────────────────

function assembleConfig(data: PlantStockApi): StockPageConfig {
  const status = data.inventory.status;
  const color = statusColor(status);
  const badgeClass = statusBadgeClass(status);

  const speciesName =
    data.relations.species?.common_name ||
    data.relations.species?.scientific_name ||
    "—";

  const varietyName = data.relations.variety?.name || null;
  const sampleName = data.relations.sample?.identity?.name || null;

  return {
    header: {
      backTo: "/inventory/plant-stock",
      backLabel: "All Stock",
      icon: Sprout,
      iconColor: color,
      title: `${speciesName} Stock`,
      subtitle: varietyName ? `${varietyName} — ${status}` : status,
      id: String(data.id),
    },

    heroImage: null,

    kpiStrip: [
      {
        label: "Total",
        value: data.inventory.total.toLocaleString(),
        icon: Package,
        color: "hsl(145, 63%, 32%)",
      },
      {
        label: "Reserved",
        value: data.inventory.reserved.toLocaleString(),
        icon: Package,
        color: "hsl(38, 92%, 50%)",
      },
      {
        label: "Net Available",
        value: data.inventory.net_available.toLocaleString(),
        icon: Sprout,
        color: "hsl(210, 60%, 50%)",
      },
    ],

    actions: buildActions(data.relations.species?.id ?? null),

    mainSections: [
      {
        kind: "batch-info",
        title: "Stock Information",
        icon: Sprout,
        fields: [
          { label: "Species", value: speciesName },
          ...(varietyName ? [{ label: "Variety", value: varietyName }] : []),
          ...(sampleName ? [{ label: "Sample", value: sampleName }] : []),
          {
            label: "Total Quantity",
            value: data.inventory.total.toLocaleString(),
          },
          {
            label: "Reserved",
            value: data.inventory.reserved.toLocaleString(),
          },
          {
            label: "Net Available",
            value: data.inventory.net_available.toLocaleString(),
          },
        ],
        statusBadge: (
          <Badge className={cn("text-xs", badgeClass)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        ),
        notes: null,
      },
    ],

    sidebarSections: [
      ...(data.relations.species
        ? [
            {
              kind: "parent-species" as const,
              title: "Parent Species",
              icon: Leaf,
              commonName: data.relations.species.common_name || "—",
              scientificName: data.relations.species.scientific_name || "—",
              href: `/inventory/products/species/${data.relations.species.id}`,
            },
          ]
        : []),
      {
        kind: "quick-info",
        title: "Quick Info",
        icon: Clock,
        fields: [
          { label: "Stock ID", value: String(data.id), mono: true },
          { label: "Created", value: formatDate(data.created_at), mono: true },
          {
            label: "Last Updated",
            value: formatDate(data.updated_at),
            mono: true,
          },
        ],
      },
    ],
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useStockDetail(): UseStockDetailResult {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  const safeId = numericId && !isNaN(numericId) ? numericId : undefined;

  const { data, isLoading, isError } = usePlantStockById(safeId);

  const config = useMemo(() => (data ? assembleConfig(data) : null), [data]);

  if (isLoading) return { state: "loading", id, config: null };
  if (isError || !data) return { state: "not-found", id, config: null };
  return { state: "ready", id, config, rawData: data };
}
