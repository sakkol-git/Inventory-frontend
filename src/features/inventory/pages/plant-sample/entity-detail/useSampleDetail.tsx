// ═══════════════════════════════════════════════════════════════════════════
// PLANT SAMPLE DETAIL — Typed Custom Hook (Backend-Connected)
// ═══════════════════════════════════════════════════════════════════════════
//
// Fetches single sample from Laravel backend via React Query.
// Returns a domain-ready view model — never raw API responses.
// ═══════════════════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { usePlantSampleById } from "@/features/inventory/services/plantSampleService";
import type { PlantSampleApi } from "@/features/inventory/types";
import { cn } from "@/shared/lib/utils";
import {
  Calendar,
  FileText,
  Info,
  MapPin,
  Package,
  TestTube,
  Thermometer,
  User,
} from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { buildActions, statusBadgeClass, statusColor } from "./domain";
import type { SamplePageConfig } from "./types";

// ─── Return Type ─────────────────────────────────────────────────────────

interface UseSampleDetailResult {
  state: "loading" | "not-found" | "ready";
  id: string | undefined;
  config: SamplePageConfig | null;
  rawData?: PlantSampleApi;
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

function assembleConfig(data: PlantSampleApi): SamplePageConfig {
  const status = data.identity.status;
  const color = statusColor(status);
  const badgeClass = statusBadgeClass(status);

  const speciesName =
    data.relationships.species?.common_name ||
    data.relationships.species?.scientific_name ||
    "—";

  const varietyName = data.relationships.variety?.name || null;

  return {
    header: {
      backTo: "/inventory/plant-samples",
      backLabel: "All Samples",
      icon: TestTube,
      iconColor: color,
      title: data.identity.name,
      subtitle: `${speciesName} — ${data.identity.code}`,
      id: String(data.id),
    },

    heroImage: data.meta.image
      ? {
          url: data.meta.image,
          alt: data.identity.name,
          fallbackIcon: TestTube,
        }
      : null,

    kpiStrip: [
      {
        label: "Status",
        value: status,
        icon: Info,
        color,
      },
      ...(data.details.origin
        ? [
            {
              label: "Origin",
              value: data.details.origin,
              icon: MapPin,
              color: "hsl(210, 60%, 50%)",
            },
          ]
        : []),
      {
        label: "Sample Code",
        value: data.identity.code,
        icon: TestTube,
        color: "hsl(145, 63%, 32%)",
      },
      {
        label: "Quantity",
        value: data.details.quantity.toLocaleString(),
        icon: Package,
        color: "hsl(38, 92%, 50%)",
      },
    ],

    actions: buildActions(
      data.relationships.species?.id ?? null,
      data.relationships.variety?.id ?? null,
    ),

    mainSections: [
      {
        kind: "sample-info" as const,
        title: "Sample Information",
        icon: TestTube,
        fields: [
          { label: "Name", value: data.identity.name },
          { label: "Sample Code", value: data.identity.code, mono: true },
          { label: "Species", value: speciesName },
          ...(varietyName ? [{ label: "Variety", value: varietyName }] : []),
          ...(data.details.origin
            ? [{ label: "Origin", value: data.details.origin }]
            : []),
          ...(data.lab_info.brought_at
            ? [
                {
                  label: "Date Brought",
                  value: formatDate(data.lab_info.brought_at),
                },
              ]
            : []),
        ],
        statusBadge: (
          <Badge className={cn(badgeClass, "font-medium")}>{status}</Badge>
        ),
      },

      ...(data.details.owner || data.details.department
        ? [
            {
              kind: "ownership" as const,
              title: "Ownership & Department",
              icon: User,
              fields: [
                ...(data.details.owner
                  ? [{ label: "Owner", value: data.details.owner }]
                  : []),
                ...(data.details.department
                  ? [{ label: "Department", value: data.details.department }]
                  : []),
              ],
            },
          ]
        : []),

      {
        kind: "storage" as const,
        title: "Storage & Inventory",
        icon: Thermometer,
        fields: [
          { label: "Quantity", value: data.details.quantity.toLocaleString() },
          ...(data.lab_info.location
            ? [{ label: "Lab Location", value: data.lab_info.location }]
            : []),
        ],
      },
    ],

    sidebarSections: [
      ...(data.meta.description
        ? [
            {
              kind: "notes" as const,
              title: "Description",
              icon: FileText,
              content: data.meta.description,
            },
          ]
        : []),
      {
        kind: "sample-info" as const,
        title: "Metadata",
        icon: Calendar,
        fields: [
          { label: "Created", value: formatDate(data.meta.created_at) },
          { label: "Last Updated", value: formatDate(data.meta.updated_at) },
        ],
        statusBadge: null,
      },
    ],
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useSampleDetail(): UseSampleDetailResult {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  const safeId = numericId && !isNaN(numericId) ? numericId : undefined;

  const { data, isLoading, isError } = usePlantSampleById(safeId);

  const config = useMemo(() => (data ? assembleConfig(data) : null), [data]);

  if (isLoading) return { state: "loading", id, config: null };
  if (isError || !data) return { state: "not-found", id, config: null };
  return { state: "ready", id, config, rawData: data };
}
