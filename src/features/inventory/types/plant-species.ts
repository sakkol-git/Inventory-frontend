// ═══════════════════════════════════════════════════════════════════════════
// Plant Species — API types
// ═══════════════════════════════════════════════════════════════════════════

import type { PlantGrowthType } from "@/shared/types/enums";

export interface PlantSpeciesApi {
  id: number;
  common_name: string;
  khmer_name: string | null;
  scientific_name: string;
  family: string | null;
  growth_type: PlantGrowthType | null;
  native_region: string | null;
  propagation_method: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  // Appended counts (may be included by the backend)
  variety_count?: number;
  sample_count?: number;
  total_quantity?: number;
}

export interface PlantSpeciesPayload {
  common_name: string;
  khmer_name?: string | null;
  scientific_name: string;
  family?: string | null;
  growth_type: PlantGrowthType;
  native_region?: string | null;
  propagation_method?: string | null;
  description?: string | null;
  image_url?: string | null;
  image?: File;
}
