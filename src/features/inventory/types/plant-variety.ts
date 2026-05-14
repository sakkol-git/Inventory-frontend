// ═══════════════════════════════════════════════════════════════════════════
// Plant Variety — API types
// ═══════════════════════════════════════════════════════════════════════════

import type { PlantSpeciesApi } from "./plant-species";

export interface PlantVarietyApi {
  id: number;
  plant_species_id: number;
  name: string;
  variety_code: string;
  description: string | null;
  image_url: string | null;
  plant_species: PlantSpeciesApi | null; // embedded when eager-loaded
  created_at: string;
  updated_at: string;
}

export interface PlantVarietyPayload {
  plant_species_id: number;
  name: string;
  variety_code: string;
  description?: string | null;
  image_url?: string | null;
  image?: File;
}
