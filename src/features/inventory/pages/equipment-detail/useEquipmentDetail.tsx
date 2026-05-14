// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT DETAIL — Typed Custom Hook (Backend-Connected)
// ═══════════════════════════════════════════════════════════════════════════
//
// Fetches single equipment from Laravel backend via React Query.
// Returns a domain-ready view model — never raw API responses.
// ═══════════════════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { useEquipmentById } from "@/features/inventory/services/equipmentService";
import type { EquipmentApi } from "@/features/inventory/types";
import { cn } from "@/shared/lib/utils";
import {
  Activity,
  DollarSign,
  FileText,
  MapPin,
  Settings,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  buildActions,
  buildAlerts,
  buildLocationStatusFields,
  formatDate,
  statusBadgeClass,
  statusColor,
} from "./domain";
import type { EquipmentPageConfig } from "./types";

// ─── Return Type ─────────────────────────────────────────────────────────

interface UseEquipmentDetailResult {
  state: "loading" | "not-found" | "ready";
  id: string | undefined;
  config: EquipmentPageConfig | null;
  rawData?: EquipmentApi;
}

// ─── Config Assembly (pure transform) ────────────────────────────────────

function assembleConfig(data: EquipmentApi): EquipmentPageConfig {
  const color = statusColor(data.status);
  const badgeClass = statusBadgeClass(data.status);

  const subtitle = [data.manufacturer, data.model_name, data.category]
    .filter(Boolean)
    .join(" — ");

  return {
    header: {
      backTo: "/inventory/equipment",
      backLabel: "All Equipment",
      icon: Wrench,
      iconColor: color,
      title: data.equipment_name,
      subtitle: subtitle || "Equipment",
      id: String(data.id),
    },

    heroImage: data.image_url
      ? { url: data.image_url, alt: data.equipment_name, fallbackIcon: Wrench }
      : null,

    kpiStrip: [
      {
        label: "Status",
        value: (
          <Badge className={cn("text-xs", badgeClass)}>
            {data.status
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
        ),
        icon: Activity,
        color,
      },
      ...(data.location
        ? [
            {
              label: "Location",
              value: data.location,
              icon: MapPin,
              color: "hsl(210, 60%, 50%)",
            },
          ]
        : []),
      ...(data.purchase_price
        ? [
            {
              label: "Purchase Price",
              value: `$${Number(data.purchase_price).toLocaleString()}`,
              icon: DollarSign,
              color: "hsl(145, 63%, 32%)",
            },
          ]
        : []),
    ],

    alerts: buildAlerts(data),
    actions: buildActions(data.status, data.is_borrowable),

    mainSections: [
      {
        kind: "specifications",
        title: "Specifications",
        icon: Settings,
        coreFields: [
          ...(data.manufacturer
            ? [{ label: "Manufacturer", value: data.manufacturer }]
            : []),
          ...(data.model_name
            ? [{ label: "Model", value: data.model_name }]
            : []),
          ...(data.serial_number
            ? [
                {
                  label: "Serial Number",
                  value: data.serial_number,
                  mono: true,
                },
              ]
            : []),
          { label: "Category", value: data.category },
          ...(data.equipment_code
            ? [
                {
                  label: "Equipment Code",
                  value: data.equipment_code,
                  mono: true,
                },
              ]
            : []),
          { label: "Condition", value: data.condition },
          { label: "Borrowable", value: data.is_borrowable ? "Yes" : "No" },
        ],
        specifications: [],
      },
    ],

    sidebarSections: [
      ...(data.purchase_price || data.purchase_date
        ? [
            {
              kind: "financial" as const,
              title: "Financial",
              icon: DollarSign,
              fields: [
                ...(data.purchase_date
                  ? [
                      {
                        label: "Purchase Date",
                        value: formatDate(data.purchase_date),
                        mono: true,
                      },
                    ]
                  : []),
                ...(data.purchase_price
                  ? [
                      {
                        label: "Purchase Price",
                        value: `$${Number(data.purchase_price).toLocaleString()}`,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
      {
        kind: "location-status",
        title: "Location & Status",
        icon: MapPin,
        fields: [
          ...buildLocationStatusFields(data),
          {
            label: "Status",
            value: (
              <Badge className={cn("text-xs", badgeClass)}>
                {data.status
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
            ),
          },
        ],
      },
      ...(data.description
        ? [
            {
              kind: "notes" as const,
              title: "Description",
              icon: FileText,
              content: data.description,
            },
          ]
        : []),
    ],
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useEquipmentDetail(): UseEquipmentDetailResult {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  const safeId = numericId && !isNaN(numericId) ? numericId : undefined;

  const { data, isLoading, isError } = useEquipmentById(safeId);

  const config = useMemo(() => (data ? assembleConfig(data) : null), [data]);

  if (isLoading) return { state: "loading", id, config: null };
  if (isError || !data) return { state: "not-found", id, config: null };
  return { state: "ready", id, config, rawData: data };
}
