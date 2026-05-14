// ═══════════════════════════════════════════════════════════════════════════
// Zod Validation Schemas — Mirroring Laravel FormRequest rules exactly
// Use with react-hook-form + zodResolver
// ═══════════════════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6),
});
export type LoginPayload = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.string().email().max(255),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6),
    phone: z.string().max(20).nullable().optional(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords must match",
    path: ["password_confirmation"],
  });
export type RegisterPayload = z.infer<typeof registerSchema>;

// ── Profile ───────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).nullable().optional(),
});
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

// ── Plant Species ─────────────────────────────────────────────────────────
export const storePlantSpeciesSchema = z.object({
  common_name: z.string().min(1, "Common name is required").max(255),
  khmer_name: z.string().max(255).nullable().optional(),
  scientific_name: z.string().min(1, "Scientific name is required").max(255),
  family: z.string().max(255).nullable().optional(),
  growth_type: z.enum(["annual", "perennial", "biennial"]),
  native_region: z.string().max(255).nullable().optional(),
  propagation_method: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .max(2048)
    .nullable()
    .optional()
    .or(z.literal("")),
});
export type StorePlantSpeciesPayload = z.infer<typeof storePlantSpeciesSchema>;

export const updatePlantSpeciesSchema = storePlantSpeciesSchema.partial();
export type UpdatePlantSpeciesPayload = z.infer<
  typeof updatePlantSpeciesSchema
>;

// ── Plant Variety ─────────────────────────────────────────────────────────
export const storePlantVarietySchema = z.object({
  plant_species_id: z
    .number({ required_error: "Species is required" })
    .int()
    .positive(),
  name: z.string().min(1, "Variety name is required").max(255),
  variety_code: z.string().min(1, "Variety code is required").max(100),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .max(2048)
    .nullable()
    .optional()
    .or(z.literal("")),
});
export type StorePlantVarietyPayload = z.infer<typeof storePlantVarietySchema>;

export const updatePlantVarietySchema = storePlantVarietySchema.partial();
export type UpdatePlantVarietyPayload = z.infer<
  typeof updatePlantVarietySchema
>;

// ── Plant Sample ──────────────────────────────────────────────────────────
export const storePlantSampleSchema = z.object({
  sample_name: z.string().min(1, "Sample name is required").max(255),
  sample_code: z.string().min(1, "Sample code is required").max(100),
  plant_species_id: z
    .number({ required_error: "Species is required" })
    .int()
    .positive(),
  plant_variety_id: z.number().int().positive().nullable().optional(),
  owner_name: z.string().max(255).nullable().optional(),
  department: z.string().max(255).nullable().optional(),
  origin_location: z.string().max(255).nullable().optional(),
  brought_at: z.string().nullable().optional(),
  lab_location: z.enum(["lab_a", "lab_b", "lab_c"]).nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]),
  quantity: z.number().int().min(0),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .max(2048)
    .nullable()
    .optional()
    .or(z.literal("")),
});
export type StorePlantSamplePayload = z.infer<typeof storePlantSampleSchema>;

export const updatePlantSampleSchema = storePlantSampleSchema.partial();
export type UpdatePlantSamplePayload = z.infer<typeof updatePlantSampleSchema>;

// ── Plant Stock ───────────────────────────────────────────────────────────
export const storePlantStockSchema = z
  .object({
    plant_species_id: z.number().int().positive(),
    plant_variety_id: z.number().int().positive().nullable().optional(),
    plant_sample_id: z.number().int().positive().nullable().optional(),
    quantity: z.number().int().min(0),
    reserved_quantity: z.number().int().min(0),
    status: z.enum(["available", "reserved", "out_of_stock"]),
  })
  .refine((d) => d.reserved_quantity <= d.quantity, {
    message: "Reserved quantity cannot exceed the total quantity",
    path: ["reserved_quantity"],
  });
export type StorePlantStockPayload = z.infer<typeof storePlantStockSchema>;

export const updatePlantStockSchema = z.object({
  plant_species_id: z.number().int().positive().optional(),
  plant_variety_id: z.number().int().positive().nullable().optional(),
  plant_sample_id: z.number().int().positive().nullable().optional(),
  quantity: z.number().int().min(0).optional(),
  reserved_quantity: z.number().int().min(0).optional(),
  status: z.enum(["available", "reserved", "out_of_stock"]).optional(),
});
export type UpdatePlantStockPayload = z.infer<typeof updatePlantStockSchema>;

// ── Chemical ──────────────────────────────────────────────────────────────
export const storeChemicalSchema = z.object({
  common_name: z.string().min(1, "Name is required").max(255),
  chemical_code: z.string().max(100).nullable().optional(),
  category: z.enum(["acid", "base", "solvent", "oxidizer", "reducer", "other"]),
  quantity: z.number().int().min(0),
  storage_location: z.string().max(255).nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  danger_level: z.enum(["low", "medium", "high"]),
  safety_measures: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .max(2048)
    .nullable()
    .optional()
    .or(z.literal("")),
});
export type StoreChemicalPayload = z.infer<typeof storeChemicalSchema>;

export const updateChemicalSchema = storeChemicalSchema.partial();
export type UpdateChemicalPayload = z.infer<typeof updateChemicalSchema>;

// ── Chemical Batch ────────────────────────────────────────────────────────
export const storeChemicalBatchSchema = z.object({
  chemical_id: z.number().int().positive(),
  batch_number: z.string().min(1, "Batch number is required").max(100),
  quantity: z.number().int().min(0),
  unit: z.string().min(1, "Unit is required").max(20),
  expiry_date: z.string().nullable().optional(),
  supplier_name: z.string().max(255).nullable().optional(),
  supplier_contact: z.string().max(255).nullable().optional(),
  received_at: z.string().nullable().optional(),
  cost_per_unit: z.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type StoreChemicalBatchPayload = z.infer<
  typeof storeChemicalBatchSchema
>;

export const updateChemicalBatchSchema = storeChemicalBatchSchema
  .omit({ chemical_id: true })
  .partial();
export type UpdateChemicalBatchPayload = z.infer<
  typeof updateChemicalBatchSchema
>;

// ── Chemical Usage Log ────────────────────────────────────────────────────
export const storeChemicalUsageLogSchema = z.object({
  chemical_id: z.number().int().positive(),
  chemical_batch_id: z.number().int().positive().nullable().optional(),
  quantity_used: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required").max(20),
  purpose: z.string().min(1, "Purpose is required").max(255),
  experiment_name: z.string().max(255).nullable().optional(),
  used_at: z.string().min(1, "Date is required"),
  notes: z.string().nullable().optional(),
});
export type StoreChemicalUsageLogPayload = z.infer<
  typeof storeChemicalUsageLogSchema
>;

// ── Equipment ─────────────────────────────────────────────────────────────
export const storeEquipmentSchema = z.object({
  equipment_name: z.string().min(1, "Equipment name is required").max(255),
  equipment_code: z.string().max(100).nullable().optional(),
  category: z.enum([
    "microscope",
    "centrifuge",
    "incubator",
    "spectrophotometer",
    "other",
  ]),
  status: z.enum(["available", "borrowed", "in_use", "under_maintenance"]),
  condition: z.enum(["good", "normal", "broken"]),
  location: z.string().max(255).nullable().optional(),
  manufacturer: z.string().max(255).nullable().optional(),
  model_name: z.string().max(255).nullable().optional(),
  serial_number: z.string().max(255).nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  purchase_price: z.number().min(0).nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .max(2048)
    .nullable()
    .optional()
    .or(z.literal("")),
});
export type StoreEquipmentPayload = z.infer<typeof storeEquipmentSchema>;

export const updateEquipmentSchema = storeEquipmentSchema.partial();
export type UpdateEquipmentPayload = z.infer<typeof updateEquipmentSchema>;

// ── Maintenance Record ────────────────────────────────────────────────────
export const storeMaintenanceRecordSchema = z.object({
  equipment_id: z.number().int().positive(),
  performed_by: z.number().int().positive().nullable().optional(),
  maintenance_type: z.enum([
    "preventive",
    "corrective",
    "calibration",
    "inspection",
  ]),
  description: z.string().min(1, "Description is required"),
  technician_name: z.string().max(255).nullable().optional(),
  technician_contact: z.string().max(255).nullable().optional(),
  cost: z.number().min(0).nullable().optional(),
  started_at: z.string().min(1, "Start date is required"),
  completed_at: z.string().nullable().optional(),
  next_service_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type StoreMaintenanceRecordPayload = z.infer<
  typeof storeMaintenanceRecordSchema
>;

export const updateMaintenanceRecordSchema = storeMaintenanceRecordSchema
  .omit({ equipment_id: true })
  .partial();
export type UpdateMaintenanceRecordPayload = z.infer<
  typeof updateMaintenanceRecordSchema
>;

// ── Borrow Record ─────────────────────────────────────────────────────────
export const storeBorrowRecordSchema = z.object({
  user_id: z.number().int().positive(),
  borrowable_type: z.enum(["equipment", "chemical", "plant_sample"]),
  borrowable_id: z.number().int().positive(),
  quantity: z.number().int().min(1),
  due_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type StoreBorrowRecordPayload = z.infer<typeof storeBorrowRecordSchema>;

export const approveBorrowSchema = z.object({
  notes: z.string().nullable().optional(),
});
export type ApproveBorrowPayload = z.infer<typeof approveBorrowSchema>;

export const rejectBorrowSchema = z.object({
  rejected_reason: z.string().min(1, "Reason is required").max(500),
});
export type RejectBorrowPayload = z.infer<typeof rejectBorrowSchema>;

export const returnBorrowSchema = z.object({
  notes: z.string().nullable().optional(),
});
export type ReturnBorrowPayload = z.infer<typeof returnBorrowSchema>;

// ── Achievement ───────────────────────────────────────────────────────────
export const storeAchievementSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().nullable().optional(),
  criteria_type: z.string().min(1, "Criteria type is required").max(100),
  criteria_value: z.number().int().min(1),
  icon: z.string().max(255).nullable().optional(),
});
export type StoreAchievementPayload = z.infer<typeof storeAchievementSchema>;

export const updateAchievementSchema = storeAchievementSchema.partial();
export type UpdateAchievementPayload = z.infer<typeof updateAchievementSchema>;

// ── User Document ─────────────────────────────────────────────────────────
export const storeUserDocumentSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 10 * 1024 * 1024, "File max 10MB"),
  title: z.string().min(1, "Title is required").max(255),
  file_type: z.enum(["pdf", "doc", "image", "certificate", "other"]),
  description: z.string().nullable().optional(),
});
export type StoreUserDocumentPayload = z.infer<typeof storeUserDocumentSchema>;

// ── User (Admin CRUD) ─────────────────────────────────────────────────────
export const storeUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.string().email().max(255),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8),
    phone: z.string().max(20).nullable().optional(),
    role: z.enum(["admin", "lab_manager", "student"]),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords must match",
    path: ["password_confirmation"],
  });
export type StoreUserPayload = z.infer<typeof storeUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(8).optional(),
  password_confirmation: z.string().min(8).optional(),
  phone: z.string().max(20).nullable().optional(),
  role: z.enum(["admin", "lab_manager", "student"]).optional(),
});
export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
