// ═══════════════════════════════════════════════════════════════════════════
// Equipment — API types
// ═══════════════════════════════════════════════════════════════════════════

import type {
    EquipmentCategory,
    EquipmentCondition,
    EquipmentStatus,
} from "@/shared/types/enums";

export interface EquipmentApi {
  id: number;
  equipment_name: string;
  equipment_code: string | null;
  category: EquipmentCategory;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  location: string | null;
  manufacturer: string | null;
  model_name: string | null; // ⚠️ model_name, NOT model
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: string | null; // decimal as string from backend
  description: string | null;
  image_url: string | null;
  is_borrowable: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentPayload {
  equipment_name: string;
  equipment_code?: string | null;
  category: EquipmentCategory;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  location?: string | null;
  manufacturer?: string | null;
  model_name?: string | null; // ⚠️ NOT model
  serial_number?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  description?: string | null;
  image_url?: string | null;
  image?: File;
}
