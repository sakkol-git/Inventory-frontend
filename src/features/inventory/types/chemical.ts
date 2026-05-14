// ═══════════════════════════════════════════════════════════════════════════
// Chemical — API types
// ═══════════════════════════════════════════════════════════════════════════

import type { ChemicalCategory, DangerLevel } from "@/shared/types/enums";

export interface ChemicalApi {
  id: number;
  common_name: string;
  chemical_code: string | null;
  category: ChemicalCategory;
  quantity: number;
  storage_location: string | null;
  expiry_date: string | null;
  danger_level: DangerLevel;
  safety_measures: string | null;
  description: string | null;
  image_url: string | null;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChemicalPayload {
  common_name: string;
  chemical_code?: string | null;
  category: ChemicalCategory;
  quantity: number;
  storage_location?: string | null;
  expiry_date?: string | null;
  danger_level: DangerLevel;
  safety_measures?: string | null;
  description?: string | null;
  image_url?: string | null;
  image?: File;
}
