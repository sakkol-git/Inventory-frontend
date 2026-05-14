// ═══════════════════════════════════════════════════════════════════════════
// Enums — Exact string values matching the Laravel backend
// ═══════════════════════════════════════════════════════════════════════════

// ── Const objects (for runtime use) ──────────────────────────────────────

export const BorrowStatus = {
  PENDING: "pending",
  BORROWED: "borrowed",
  RETURNED: "returned",
  OVERDUE: "overdue",
  REJECTED: "rejected",
} as const;
export type BorrowStatus = (typeof BorrowStatus)[keyof typeof BorrowStatus];

export const ChemicalCategory = {
  ACID: "acid",
  BASE: "base",
  SOLVENT: "solvent",
  OXIDIZER: "oxidizer",
  REDUCER: "reducer",
  OTHER: "other",
} as const;
export type ChemicalCategory =
  (typeof ChemicalCategory)[keyof typeof ChemicalCategory];

export const DangerLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;
export type DangerLevel = (typeof DangerLevel)[keyof typeof DangerLevel];

export const EquipmentCategory = {
  MICROSCOPE: "microscope",
  CENTRIFUGE: "centrifuge",
  INCUBATOR: "incubator",
  SPECTROPHOTOMETER: "spectrophotometer",
  OTHER: "other",
} as const;
export type EquipmentCategory =
  (typeof EquipmentCategory)[keyof typeof EquipmentCategory];

export const EquipmentCondition = {
  GOOD: "good",
  NORMAL: "normal",
  BROKEN: "broken",
} as const;
export type EquipmentCondition =
  (typeof EquipmentCondition)[keyof typeof EquipmentCondition];

export const EquipmentStatus = {
  AVAILABLE: "available",
  BORROWED: "borrowed",
  IN_USE: "in_use",
  UNDER_MAINTENANCE: "under_maintenance",
} as const;
export type EquipmentStatus =
  (typeof EquipmentStatus)[keyof typeof EquipmentStatus];

export const LabLocation = {
  LAB_A: "lab_a",
  LAB_B: "lab_b",
  LAB_C: "lab_c",
} as const;
export type LabLocation = (typeof LabLocation)[keyof typeof LabLocation];

export const MaintenanceType = {
  PREVENTIVE: "preventive",
  CORRECTIVE: "corrective",
  CALIBRATION: "calibration",
  INSPECTION: "inspection",
} as const;
export type MaintenanceType =
  (typeof MaintenanceType)[keyof typeof MaintenanceType];

export const PlantGrowthType = {
  ANNUAL: "annual",
  PERENNIAL: "perennial",
  BIENNIAL: "biennial",
} as const;
export type PlantGrowthType =
  (typeof PlantGrowthType)[keyof typeof PlantGrowthType];

export const SampleStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;
export type SampleStatus = (typeof SampleStatus)[keyof typeof SampleStatus];

export const StockStatus = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  OUT_OF_STOCK: "out_of_stock",
} as const;
export type StockStatus = (typeof StockStatus)[keyof typeof StockStatus];

export const TransactionAction = {
  ADDED: "added",
  UPDATED: "updated",
  CONSUMED: "consumed",
  BORROWED: "borrowed",
  RETURNED: "returned",
  HARVESTED: "harvested",
  DISPOSED: "disposed",
} as const;
export type TransactionAction =
  (typeof TransactionAction)[keyof typeof TransactionAction];

export const UserRole = {
  ADMIN: "admin",
  LAB_MANAGER: "lab_manager",
  STUDENT: "student",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Borrowable item types
export type BorrowableType = "equipment" | "chemical" | "plant_sample";

// ── Option arrays for select dropdowns ───────────────────────────────────

export const PLANT_GROWTH_TYPES: PlantGrowthType[] = [
  "annual",
  "perennial",
  "biennial",
];
export const SAMPLE_STATUSES: SampleStatus[] = [
  "active",
  "inactive",
  "archived",
];
export const LAB_LOCATIONS: LabLocation[] = ["lab_a", "lab_b", "lab_c"];
export const STOCK_STATUSES: StockStatus[] = [
  "available",
  "reserved",
  "out_of_stock",
];
export const CHEMICAL_CATEGORIES: ChemicalCategory[] = [
  "acid",
  "base",
  "solvent",
  "oxidizer",
  "reducer",
  "other",
];
export const DANGER_LEVELS: DangerLevel[] = ["low", "medium", "high"];
export const EQUIPMENT_STATUSES: EquipmentStatus[] = [
  "available",
  "borrowed",
  "in_use",
  "under_maintenance",
];
export const EQUIPMENT_CONDITIONS: EquipmentCondition[] = [
  "good",
  "normal",
  "broken",
];
export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  "microscope",
  "centrifuge",
  "incubator",
  "spectrophotometer",
  "other",
];
export const BORROW_STATUSES: BorrowStatus[] = [
  "pending",
  "borrowed",
  "returned",
  "overdue",
  "rejected",
];
export const MAINTENANCE_TYPES: MaintenanceType[] = [
  "preventive",
  "corrective",
  "calibration",
  "inspection",
];
export const TRANSACTION_ACTIONS: TransactionAction[] = [
  "added",
  "updated",
  "consumed",
  "borrowed",
  "returned",
  "harvested",
  "disposed",
];
export const USER_ROLES: UserRole[] = ["admin", "lab_manager", "student"];
export const BORROWABLE_TYPES: BorrowableType[] = [
  "equipment",
  "chemical",
  "plant_sample",
];

// ── Label helpers ─────────────────────────────────────────────────────────

export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
