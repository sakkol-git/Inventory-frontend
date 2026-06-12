// ═══════════════════════════════════════════════════════════════════════════
// API Response Interfaces — Matching Laravel JSON Resources exactly
// ═══════════════════════════════════════════════════════════════════════════

import type {
    BorrowStatus,
    BorrowableType,
    ChemicalCategory,
    DangerLevel,
    EquipmentCategory,
    EquipmentCondition,
    EquipmentStatus,
    LabLocation,
    MaintenanceType,
    PlantGrowthType,
    SampleStatus,
    StockStatus,
    TransactionAction,
    UserRole,
} from "./enums";

// Re-export enums for convenience
export * from "./enums";

// ── Response Wrappers ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export type { PaginatedResponse } from "./pagination";

// ── User ──────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// ── Auth Responses ────────────────────────────────────────────────────────
export interface AuthTokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number; // seconds
}

export interface RegisterResponse extends AuthTokenResponse {
  message: string;
  user: User;
}

export interface AuthProfileResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  permissions: string[];
}

// ── Plant Species ─────────────────────────────────────────────────────────
export interface PlantSpecies {
  id: number;
  common_name: string;
  khmer_name: string | null;
  scientific_name: string;
  family: string | null;
  growth_type: PlantGrowthType;
  native_region: string | null;
  propagation_method: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ── Plant Variety ─────────────────────────────────────────────────────────
export interface PlantVariety {
  id: number;
  plant_species_id: number;
  name: string;
  variety_code: string;
  description: string | null;
  image_url: string | null;
  plant_species?: PlantSpecies;
  created_at: string;
  updated_at: string;
}

// ── Plant Sample ──────────────────────────────────────────────────────────
export interface PlantSample {
  id: number;
  identity: {
    name: string;
    code: string;
    status: SampleStatus;
  };
  relationships: {
    species?: PlantSpecies;
    variety?: PlantVariety;
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

// ── Plant Stock ───────────────────────────────────────────────────────────
export interface PlantStock {
  id: number;
  inventory: {
    total: number;
    reserved: number;
    net_available: number;
    status: StockStatus;
  };
  relations: {
    species?: PlantSpecies;
    variety?: PlantVariety;
    sample?: PlantSample;
  };
  created_at: string;
  updated_at: string;
}

// ── Chemical ──────────────────────────────────────────────────────────────
export interface Chemical {
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


// ── Chemical Usage Log ────────────────────────────────────────────────────
export interface ChemicalUsageLog {
  id: number;
  chemical_id: number;
  quantity_used: number;
  unit: string;
  purpose: string;
  experiment_name: string | null;
  used_at: string;
  notes: string | null;
  user: { id: number; name: string } | Record<string, never>;
  chemical?: Chemical;
  created_at: string;
}

// ── Equipment ─────────────────────────────────────────────────────────────
export interface Equipment {
  id: number;
  equipment_name: string;
  equipment_code: string | null;
  category: EquipmentCategory;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  location: string | null;
  manufacturer: string | null;
  model_name: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  description: string | null;
  image_url: string | null;
  is_borrowable: boolean;
  created_at: string;
  updated_at: string;
}

// ── Maintenance Record ────────────────────────────────────────────────────
export interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  maintenance_type: MaintenanceType;
  description: string;
  technician_name: string | null;
  technician_contact: string | null;
  cost: number | null;
  started_at: string;
  completed_at: string | null;
  next_service_date: string | null;
  is_completed: boolean;
  is_overdue: boolean;
  notes: string | null;
  equipment?: Equipment;
  performer: { id: number | null; name: string | null };
  created_at: string;
  updated_at: string;
}

// ── Borrow Record ─────────────────────────────────────────────────────────
export interface BorrowRecord {
  id: number;
  status: BorrowStatus;
  quantity: number;
  borrowed_at: string | null;
  due_at: string | null;
  returned_at: string | null;
  is_overdue: boolean;
  notes: string | null;
  user: { id: number; name: string } | Record<string, never>;
  item: {
    type: BorrowableType;
    id: number;
    data?: Equipment | Chemical | PlantSample;
  };
  created_at: string;
}

// ── Transaction ───────────────────────────────────────────────────────────
export interface Transaction {
  id: number;
  action: TransactionAction;
  quantity: number;
  note: string | null;
  user: { id: number; name: string } | Record<string, never>;
  item: {
    type: string;
    id: number;
    data?: unknown;
  };
  created_at: string;
}

// ── Achievement ───────────────────────────────────────────────────────────
export interface AchievementUser {
  id: number;
  name?: string;
  email?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string | null;
  criteria_type: string;
  criteria_value: number;
  icon: string | null;
  assigned_user_ids?: number[];
  users?: AchievementUser[];
  earned_at?: string;
  created_at: string;
  updated_at: string;
}

// ── User Document ─────────────────────────────────────────────────────────
export interface UserDocument {
  id: number;
  user_id: number;
  title: string;
  file_path?: string;
  download_url?: string;
  file_type: "pdf" | "doc" | "image" | "certificate" | "other";
  file_size: number;
  description: string | null;
  user: { id: number; name: string } | Record<string, never>;
  created_at: string;
  updated_at: string;
}

// ── Role & Permission ─────────────────────────────────────────────────────
export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

// ── Dashboard Response ────────────────────────────────────────────────────
export interface DashboardResponse {
  data: {
    counts: {
      plant_species: number;
      plant_varieties: number;
      plant_samples: number;
      plant_stocks: number;
      chemicals: number;
      chemical_batches: number;
      equipment: number;
      users: number;
      active_borrows: number;
      total_borrows: number;
    };
    alerts: {
      expiring_chemicals: number;
      expired_chemicals: number;
      overdue_borrows: number;
      pending_borrows: number;
      overdue_maintenance: number;
      low_stock_chemicals: number;
    };
    recent_activity: Array<{
      id: number;
      user: string | null;
      action: TransactionAction;
      item_type: string;
      item_id: number;
      quantity: number;
      note: string | null;
      created_at: string;
    }>;
    status_breakdown: {
      borrows_by_status: Record<string, number>;
      equipment_by_status: Record<string, number>;
      chemicals_by_category: Record<string, number>;
    };
  };
}

// ── Profile Response ──────────────────────────────────────────────────────
export interface ProfileShowResponse {
  data: {
    user: User;
    permissions: string[];
    summary: {
      total_borrows: number;
      active_borrows: number;
      overdue_borrows: number;
      total_transactions: number;
      chemical_usages: number;
      contributed_samples: number;
      achievements_earned: number;
      documents_uploaded: number;
    };
  };
}

// ── Error Responses ───────────────────────────────────────────────────────
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

export interface UnauthorizedResponse {
  error: string;
}

export interface ForbiddenResponse {
  message: string;
}

export interface NotFoundResponse {
  message: string;
}
