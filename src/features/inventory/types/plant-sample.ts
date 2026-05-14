// ═══════════════════════════════════════════════════════════════════════════
// Plant Sample — API types (nested response, flat payload)
// ═══════════════════════════════════════════════════════════════════════════

import type { LabLocation, SampleStatus } from "@/shared/types/enums";
import type { PlantSpeciesApi } from "./plant-species";
import type { PlantVarietyApi } from "./plant-variety";

export interface PlantSampleApi {
  id: number;
  identity: {
    name: string;
    code: string;
    status: SampleStatus;
  };
  relationships: {
    species: PlantSpeciesApi | null;
    variety: PlantVarietyApi | null;
  };
  details: {
    owner: string | null;
    department: string | null;
    origin: string | null;
    quantity: number;
  };
  lab_info: {
    brought_at: string | null;
    location: LabLocation | null;
  };
  meta: {
    description: string | null;
    image: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface PlantSamplePayload {
  sample_name: string;
  sample_code: string;
  plant_species_id: number;
  plant_variety_id?: number | null;
  owner_name?: string | null;
  department?: string | null;
  origin_location?: string | null;
  brought_at?: string | null;
  lab_location?: LabLocation | null;
  status: SampleStatus;
  quantity: number;
  description?: string | null;
  image_url?: string | null;
  image?: File;
}
