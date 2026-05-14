// ═══════════════════════════════════════════════════════════════════════════
// PLANT SPECIES DETAIL — Typed Custom Hook (Backend-Connected)
// ═══════════════════════════════════════════════════════════════════════════
//
// Fetches single species from Laravel backend via React Query.
// Returns a domain-ready view model — never raw API responses.
// ═══════════════════════════════════════════════════════════════════════════

import { usePlantSpeciesById } from "@/features/inventory/services/plantSpeciesService";
import type { PlantSpeciesApi } from "@/features/inventory/types";
import { Flower2, Layers, Leaf, Sprout } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { SPECIES_ICON_COLOR, buildActions } from "./domain";
import type { SpeciesPageConfig } from "./types";

// ─── Return Type ─────────────────────────────────────────────────────────

interface UseSpeciesDetailResult {
  state: "loading" | "not-found" | "ready";
  id: string | undefined;
  config: SpeciesPageConfig | null;
  rawData?: PlantSpeciesApi;
}

// ─── Config Assembly (pure transform) ────────────────────────────────────

function assembleConfig(data: PlantSpeciesApi): SpeciesPageConfig {
  const title = data.common_name
    ? data.common_name + (data.khmer_name ? ` (${data.khmer_name})` : "")
    : data.scientific_name || `Species #${data.id}`;

  return {
    header: {
      backTo: "/inventory/plant-species",
      backLabel: "All Species",
      icon: Leaf,
      iconColor: SPECIES_ICON_COLOR,
      title,
      subtitle: data.scientific_name || "",
      id: String(data.id),
    },

    heroImage: data.image_url
      ? { url: data.image_url, alt: data.common_name, fallbackIcon: Sprout }
      : null,

    kpiStrip: [
      {
        label: "Varieties",
        value: data.variety_count ?? 0,
        icon: Layers,
        color: "hsl(210, 60%, 50%)",
      },
      {
        label: "Samples",
        value: data.sample_count ?? 0,
        icon: Sprout,
        color: SPECIES_ICON_COLOR,
      },
    ],

    actions: buildActions(data.scientific_name),

    mainSections: [
      {
        kind: "botanical-description",
        title: "Botanical Description",
        icon: Flower2,
        description: data.description || "No description available.",
        fields: [
          { label: "Family", value: data.family || "—" },
          { label: "Growth Type", value: data.growth_type || "—" },
          { label: "Native Region", value: data.native_region || "—" },
          {
            label: "Propagation Method",
            value: data.propagation_method || "—",
          },
        ],
      },
    ],

    sidebarSections: [],
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useSpeciesDetail(): UseSpeciesDetailResult {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  const safeId = numericId && !isNaN(numericId) ? numericId : undefined;

  const { data, isLoading, isError } = usePlantSpeciesById(safeId);

  const config = useMemo(() => (data ? assembleConfig(data) : null), [data]);

  if (isLoading) return { state: "loading", id, config: null };
  if (isError || !data) return { state: "not-found", id, config: null };
  return { state: "ready", id, config, rawData: data };
}
