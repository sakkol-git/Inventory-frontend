// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY MODULE — Frontend Display Models (offline / mock pages)
//
// ⚠️  These types are for the DEMO detail-pages only. They do NOT match
//     the API contract.  For API-matching types use `@/types` (index.ts)
//     and `@/shared/types/enums` (enums.ts).
// ═══════════════════════════════════════════════════════════════════════════

// ─── Shared Auditable Base ──────────────────────────────────────────────────
export interface Auditable {
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

// ─── Conservation Status ────────────────────────────────────────────────────
export type ConservationStatus = "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX";

// ─── Plant Variety Status ───────────────────────────────────────────────────
export type PlantVarietyStatus = "Active" | "Archived" | "Destroyed";

// ─── Plant Sample Status (distinct from variety) ────────────────────────────
export type PlantSampleStatus =
  | "Available"
  | "Reserved"
  | "In Testing"
  | "Consumed"
  | "Contaminated"
  | "Archived"
  | "Destroyed";

// ─── Viability Status ───────────────────────────────────────────────────────
export type ViabilityStatus = "High" | "Medium" | "Low" | "Unknown";

// ─── Source Type ────────────────────────────────────────────────────────────
export type SourceType = "Field" | "Lab" | "Purchase" | "Donation" | "Exchange";

// ═══════════════════════════════════════════════════════════════════════════
// HIERARCHICAL PLANT INVENTORY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

// ─── Plant Species (TOP LEVEL) ──────────────────────────────────────────────
export interface PlantSpecies extends Auditable {
  id: string;
  scientificName: string;
  commonName: string;
  khmerName?: string;

  // Classification Info (from migration)
  family?: string;
  growthType?: string; // 'annual' | 'perennial' | 'biennial'
  nativeRegion?: string;
  propagationMethod?: string;

  // Additional Info (from migration)
  description?: string;
  imageUrl?: string;

  // Computed / UI display fields (not stored in plant_species table)
  isActive?: boolean; // derived from deleted_at (softDeletes)
  varietyCount: number;
  sampleCount: number;
  totalQuantity?: number;
  quantityUnit?: string;

  // Relations (lazy-loaded)
  varieties?: PlantVariety[];
}

// ─── Plant Variety (MIDDLE LEVEL) ───────────────────────────────────────────
export interface PlantVariety extends Auditable {
  id: string;
  varietyCode: string; // VAR-0001, VAR-0002, etc.

  // Hierarchy (REQUIRED parent)
  speciesId: string;
  speciesName?: string; // Denormalized for display

  // Identification
  name: string;
  cultivarName?: string;
  uniqueCode?: string;

  // Ownership
  ownershipUserId?: string;
  ownershipUserName?: string;
  ownershipDepartment?: string;

  // Origin
  originLocation?: string;
  originCountry?: string;
  originRegion?: string;
  breeder?: string;
  breedingYear?: number;
  dateBrought?: string;

  // Genetic / trait metadata
  description?: string;
  traits?: string[];
  germinationRate?: number; // 0-100
  diseaseResistance?: string;
  maturityDaysMin?: number;
  maturityDaysMax?: number;
  growthHabit?: string; // determinate, indeterminate, bush, vine

  // Certification
  isCertified?: boolean;
  certificationBody?: string;

  // Status
  status: PlantVarietyStatus;
  images?: string[];
  notes?: string;

  // Quantity/Amount (aggregated from samples)
  totalQuantity?: number;
  availableQuantity?: number;
  quantityUnit?: string; // seeds, grams, plants, ml

  // Computed fields (read-only)
  sampleCount: number;

  // Relations (lazy-loaded)
  species?: PlantSpecies;
  samples?: PlantSample[];
}

// ─── Plant Sample (LOWEST LEVEL) ────────────────────────────────────────────
export interface PlantSample extends Auditable {
  id: string;
  sampleCode: string; // SMPL-0001, SMPL-0002, etc.

  // Hierarchy (REQUIRED parent)
  varietyId: string;
  varietyName?: string; // Denormalized for display
  speciesId: string; // Denormalized (auto-populated from variety)
  speciesName?: string; // Denormalized for display

  // Identification
  name: string;
  internalName?: string;
  uniqueCode?: string;
  description?: string;

  // Ownership
  ownershipUserId?: string;
  ownershipUserName?: string;
  ownershipDepartment?: string;

  // Physical quantity & storage (REQUIRED)
  quantity: number;
  quantityUnit: string; // seeds, grams, plants, ml, units, etc.
  storageLocation?: string;
  storageConditions?: string; // "4°C, 60% RH, dark"

  // Source & Provenance
  originLocation?: string;
  collectionDate?: string;
  dateBrought?: string;
  sourceType?: SourceType;
  sourceReference?: string; // PO number, donor name, field ID, etc.

  // Quality & Viability
  viabilityStatus?: ViabilityStatus;
  expiryDate?: string;
  lastTestedAt?: string;

  // Status & Reservation
  status: PlantSampleStatus;
  reservedById?: number;
  reservedAt?: string;

  // Media & Notes
  images?: string[];
  notes?: string;
  metadata?: Record<string, unknown>; // Flexible field for custom data

  // Relations (lazy-loaded)
  variety?: PlantVariety;
  species?: PlantSpecies;
}

// ─── Chemical Log ───────────────────────────────────────────────────────────
export type ChemicalActionType = "add" | "reduce";

export interface ChemicalLog extends Auditable {
  id: string;
  chemicalId: string;
  actionType: ChemicalActionType;
  amount: number;
  unit: string;
  previousQuantity: string;
  newQuantity: string;
  reason?: string;
  userId?: string;
  userName?: string;
}
