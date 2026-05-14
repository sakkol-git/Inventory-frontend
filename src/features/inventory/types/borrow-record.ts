// ═══════════════════════════════════════════════════════════════════════════
// Borrow Record — API types
// ═══════════════════════════════════════════════════════════════════════════

import type { ChemicalApi } from "./chemical";
import type { BorrowableType, BorrowStatus } from '@/shared/types/enums';
import type { EquipmentApi } from "./equipment";
import type { PlantSampleApi } from "./plant-sample";

export interface BorrowRecordApi {
  id: number;
  status: BorrowStatus;
  quantity: number;
  borrowed_at: string;
  due_at: string | null;
  returned_at: string | null;
  is_overdue: boolean;
  notes: string | null;
  user: { id: number; name: string } | null;
  item: {
    type: BorrowableType;
    id: number;
    data: EquipmentApi | ChemicalApi | PlantSampleApi | null;
  };
  created_at: string;
}

export interface BorrowPayload {
  user_id: number;
  borrowable_type: BorrowableType;
  borrowable_id: number;
  quantity: number;
  due_at?: string | null;
  notes?: string | null;
}

export interface ReturnPayload {
  notes?: string | null;
}
