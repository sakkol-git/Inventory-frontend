// ═══════════════════════════════════════════════════════════════════════════
// CHEMICAL DETAIL — Data Loading Hook (Backend-Connected)
// ═══════════════════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { useChemicalById } from "@/features/inventory/services/chemicalService";
import type { ChemicalApi } from "@/features/inventory/types";
import { cn } from "@/shared/lib/utils";
import {
  AlertTriangle,
  Beaker,
  Calendar,
  FlaskConical,
  MapPin,
  Package,
  Shield,
  Thermometer,
} from "lucide-react";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  CHEMICAL_FALLBACK_ICON,
  buildActions,
  formatDate,
  hazardBadgeClass,
  hazardColor,
} from "./domain";
import type { ChemicalPageConfig, DetailSection } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────

function expiryStatus(
  expiryDate: string | null,
  isExpired: boolean,
): { label: string; className: string } {
  if (isExpired || !expiryDate) {
    return {
      label: "Expired",
      className: "bg-destructive text-destructive-foreground",
    };
  }
  const days = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 14)
    return {
      label: `${days}d left`,
      className:
        "bg-destructive/10 text-destructive border border-destructive/30",
    };
  if (days <= 30)
    return {
      label: `${days}d left`,
      className: "bg-warning/10 text-warning border border-warning/30",
    };
  return { label: `${days}d left`, className: "bg-muted text-primary border" };
}

// ─── Config Assembly ─────────────────────────────────────────────────────

function assembleConfig(data: ChemicalApi): ChemicalPageConfig {
  const hazColor = hazardColor(data.danger_level);
  const expiry = expiryStatus(data.expiry_date, data.is_expired);

  const mainSections: DetailSection[] = [
    {
      kind: "chemical-properties" as const,
      title: "Chemical Properties",
      icon: Beaker,
      fields: [
        { label: "Product Name", value: data.common_name },
        ...(data.chemical_code
          ? [{ label: "Chemical Code", value: data.chemical_code, mono: true }]
          : []),
        { label: "Category", value: data.category },
        { label: "Quantity", value: data.quantity.toLocaleString() },
      ],
    },
    {
      kind: "safety-hazard" as const,
      title: "Safety & Hazard Information",
      icon: Shield,
      fields: [
        {
          label: "Danger Level",
          value: React.createElement(
            Badge,
            { className: cn("text-xs", hazardBadgeClass(data.danger_level)) },
            data.danger_level.toUpperCase(),
          ),
        },
      ],
      ghsTags: [],
      notes: data.safety_measures || null,
    },
  ];

  const sidebarSections: DetailSection[] = [
    ...(data.storage_location
      ? [
          {
            kind: "storage-requirements" as const,
            title: "Storage",
            icon: Thermometer,
            fields: [{ label: "Location", value: data.storage_location }],
          },
        ]
      : []),
    {
      kind: "dates" as const,
      title: "Dates",
      icon: Calendar,
      fields: [
        {
          label: "Expiry",
          value: data.expiry_date
            ? React.createElement(
                "span",
                { className: "flex items-center gap-2" },
                React.createElement(
                  "span",
                  { className: "font-mono text-sm" },
                  formatDate(data.expiry_date),
                ),
                React.createElement(
                  Badge,
                  { className: cn("text-xs", expiry.className) },
                  expiry.label,
                ),
              )
            : "—",
        },
        { label: "Created", value: formatDate(data.created_at), mono: true },
        {
          label: "Last Updated",
          value: formatDate(data.updated_at),
          mono: true,
        },
      ],
    },
  ];

  return {
    header: {
      backTo: "/inventory/chemicals",
      backLabel: "All Chemicals",
      icon: FlaskConical,
      iconColor: hazColor,
      title: data.common_name,
      subtitle: data.chemical_code
        ? `Code: ${data.chemical_code}`
        : data.category,
      id: String(data.id),
    },
    heroImage: data.image_url
      ? {
          url: data.image_url,
          alt: data.common_name,
          fallbackIcon: CHEMICAL_FALLBACK_ICON,
        }
      : null,
    kpiStrip: [
      {
        label: "Quantity",
        value: data.quantity.toLocaleString(),
        icon: Package,
        color: "hsl(210, 60%, 50%)",
      },
      {
        label: "Danger Level",
        value: React.createElement(
          Badge,
          { className: cn("text-xs", hazardBadgeClass(data.danger_level)) },
          data.danger_level.toUpperCase(),
        ),
        icon: AlertTriangle,
        color: hazColor,
      },
      {
        label: "Expiry",
        value: React.createElement(
          Badge,
          { className: cn("text-xs", expiry.className) },
          expiry.label,
        ),
        icon: Calendar,
        color: data.is_expired ? "hsl(0,72%,51%)" : "hsl(38,92%,50%)",
      },
      ...(data.storage_location
        ? [
            {
              label: "Location",
              value: data.storage_location,
              icon: MapPin,
              color: "hsl(175, 65%, 35%)",
            },
          ]
        : []),
    ],
    actions: buildActions(),
    mainSections,
    sidebarSections,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────

export type UseChemicalDetailResult =
  | { state: "loading"; id: string | undefined; config: null }
  | { state: "not-found"; id: string | undefined; config: null }
  | {
      state: "ready";
      id: string;
      config: ChemicalPageConfig;
      rawData: ChemicalApi;
    };

export function useChemicalDetail(): UseChemicalDetailResult {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  const safeId = numericId && !isNaN(numericId) ? numericId : undefined;

  const { data, isLoading, isError } = useChemicalById(safeId);

  const config = useMemo(() => (data ? assembleConfig(data) : null), [data]);

  if (isLoading) return { state: "loading", id, config: null };
  if (isError || !data || !config)
    return { state: "not-found", id, config: null };
  return { state: "ready", id: id!, config, rawData: data };
}
