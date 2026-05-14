// ═══════════════════════════════════════════════════════════════════════════
// Plant Stock — API types (nested response)
// ═══════════════════════════════════════════════════════════════════════════

import type { StockStatus } from "@/shared/types/enums";
import type { PlantSampleApi } from "./plant-sample";
import type { PlantSpeciesApi } from "./plant-species";
import type { PlantVarietyApi } from "./plant-variety";

export interface PlantStockApi {
  id: number;
  inventory: {
    total: number;
    reserved: number;
    net_available: number;
    status: StockStatus;
  };
  relations: {
    species: PlantSpeciesApi | null;
    variety: PlantVarietyApi | null;
    sample: PlantSampleApi | null;
  };
  created_at: string;
  updated_at: string;
}

export interface PlantStockCreatePayload {
  plant_species_id: number;
  plant_variety_id?: number | null;
  plant_sample_id?: number | null;
  quantity: number;
  reserved_quantity: number;
  status: StockStatus;
}
