// ═══════════════════════════════════════════════════════════════════════════
// PLANT VARIETY DETAIL — Typed Custom Hook (Backend-Connected)
// ═══════════════════════════════════════════════════════════════════════════
//
// Fetches single variety from Laravel backend via React Query.
// Returns a domain-ready view model — never raw API responses.
// ═══════════════════════════════════════════════════════════════════════════

import { usePlantVarietyById } from "@/features/inventory/services/plantVarietyService";
import type { PlantVarietyApi } from "@/features/inventory/types";
import { Calendar, FileText, Info, Sprout } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { buildActions } from "./domain";
import type { VarietyPageConfig } from "./types";

// ─── Return Type ─────────────────────────────────────────────────────────

interface UseVarietyDetailResult {
  state: "loading" | "not-found" | "ready";
  id: string | undefined;
  config: VarietyPageConfig | null;
  rawData?: PlantVarietyApi;
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

function assembleConfig(data: PlantVarietyApi): VarietyPageConfig {
  const speciesName =
    data.plant_species?.common_name ||
    data.plant_species?.scientific_name ||
    "—";

  return {
    header: {
      backTo: "/inventory/plant-varieties",
      backLabel: "All Varieties",
      icon: Sprout,
      iconColor: "hsl(145, 63%, 32%)",
      title: data.name,
      subtitle: `${speciesName} — ${data.variety_code}`,
      id: String(data.id),
    },

    heroImage: data.image_url
      ? { url: data.image_url, alt: data.name, fallbackIcon: Sprout }
      : null,

    kpiStrip: [
      {
        label: "Variety Code",
        value: data.variety_code,
        icon: Info,
        color: "hsl(210, 60%, 50%)",
      },
      {
        label: "Species",
        value: speciesName,
        icon: Sprout,
        color: "hsl(145, 63%, 32%)",
      },
    ],

    actions: buildActions(data.plant_species_id),

    mainSections: [
      {
        kind: "variety-info" as const,
        title: "Variety Information",
        icon: Sprout,
        fields: [
          { label: "Name", value: data.name },
          { label: "Variety Code", value: data.variety_code, mono: true },
          { label: "Parent Species", value: speciesName },
          ...(data.plant_species?.scientific_name
            ? [
                {
                  label: "Scientific Name",
                  value: data.plant_species.scientific_name,
                },
              ]
            : []),
          ...(data.plant_species?.family
            ? [{ label: "Family", value: data.plant_species.family }]
            : []),
        ],
        statusBadge: null,
      },
    ],

    sidebarSections: [
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
      {
        kind: "variety-info" as const,
        title: "Metadata",
        icon: Calendar,
        fields: [
          { label: "Created", value: formatDate(data.created_at) },
          { label: "Last Updated", value: formatDate(data.updated_at) },
        ],
        statusBadge: null,
      },
    ],
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useVarietyDetail(): UseVarietyDetailResult {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  const safeId = numericId && !isNaN(numericId) ? numericId : undefined;

  const { data, isLoading, isError } = usePlantVarietyById(safeId);

  const config = useMemo(() => (data ? assembleConfig(data) : null), [data]);

  if (isLoading) return { state: "loading", id, config: null };
  if (isError || !data) return { state: "not-found", id, config: null };
  return { state: "ready", id, config, rawData: data };
}
