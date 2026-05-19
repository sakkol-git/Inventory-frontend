// ═══════════════════════════════════════════════════════════════════════════
// Plant Stock — API types (nested response)
// ═══════════════════════════════════════════════════════════════════════════

import type { StockStatus } from "@/shared/types/enums";
import type { PlantSampleApi } from "./plant-sample";

export interface PlantStockApi {
  id: number;
  inventory: {
    total: number;
    reserved: number;
    net_available: number;
    status: StockStatus;
  };
  relations: {
    sample: PlantSampleApi | null;
  };
  created_at: string;
  updated_at: string;
}

export interface PlantStockCreatePayload {
  plant_sample_id?: number | null;
  quantity: number;
  reserved_quantity: number;
  status: StockStatus;
}
