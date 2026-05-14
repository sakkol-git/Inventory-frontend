// ═══════════════════════════════════════════════════════════════════════════
// Zod Schemas — Client-side validation mirroring Laravel backend rules
// ═══════════════════════════════════════════════════════════════════════════

import { z } from "zod";

// ─── Plant Species ──────────────────────────────────────────────────────

export const plantSpeciesSchema = z.object({
  common_name: z.string().min(1, "Common name is required").max(255),
  khmer_name: z.string().max(255).nullable().optional(),
  scientific_name: z.string().min(1, "Scientific name is required").max(255),
  family: z.string().max(255).nullable().optional(),
  growth_type: z.enum([
    "herb",
    "shrub",
    "tree",
    "vine",
    "grass",
    "aquatic",
    "other",
  ]),
  native_region: z.string().max(255).nullable().optional(),
  propagation_method: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
});

// ─── Plant Variety ──────────────────────────────────────────────────────

export const plantVarietySchema = z.object({
  plant_species_id: z
    .number({ required_error: "Species is required" })
    .int()
    .positive("Species is required"),
  name: z.string().min(1, "Variety name is required").max(255),
  variety_code: z.string().min(1, "Variety code is required").max(100),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
});

// ─── Plant Sample ───────────────────────────────────────────────────────

export const plantSampleSchema = z.object({
  sample_name: z.string().min(1, "Sample name is required"),
  sample_code: z.string().min(1, "Sample code is required"),
  plant_species_id: z
    .number({ required_error: "Species is required" })
    .int()
    .positive(),
  plant_variety_id: z.number().int().positive().nullable().optional(),
  owner_name: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  origin_location: z.string().nullable().optional(),
  brought_at: z.string().nullable().optional(),
  lab_location: z
    .enum(["lab_a", "lab_b", "greenhouse", "storage", "external"])
    .nullable()
    .optional(),
  status: z.enum(["active", "inactive", "archived"]),
  quantity: z.number({ required_error: "Quantity is required" }).int().min(0),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
});

// ─── Plant Stock ────────────────────────────────────────────────────────

export const plantStockSchema = z
  .object({
    plant_species_id: z
      .number({ required_error: "Species is required" })
      .int()
      .positive(),
    plant_variety_id: z.number().int().positive().nullable().optional(),
    plant_sample_id: z.number().int().positive().nullable().optional(),
    quantity: z.number({ required_error: "Quantity is required" }).int().min(0),
    reserved_quantity: z
      .number({ required_error: "Reserved quantity is required" })
      .int()
      .min(0),
    status: z.enum(["available", "reserved", "out_of_stock"]),
  })
  .refine((d) => d.reserved_quantity <= d.quantity, {
    message: "Reserved quantity cannot exceed total quantity",
    path: ["reserved_quantity"],
  });

// ─── Chemical ───────────────────────────────────────────────────────────

export const chemicalSchema = z.object({
  common_name: z.string().min(1, "Chemical name is required").max(255),
  chemical_code: z.string().max(100).nullable().optional(),
  category: z.enum(["acid", "base", "solvent", "oxidizer", "reducer", "other"]),
  quantity: z.number({ required_error: "Quantity is required" }).int().min(0),
  storage_location: z.string().max(255).nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  danger_level: z.enum(["low", "medium", "high"]),
  safety_measures: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
});

// ─── Equipment ──────────────────────────────────────────────────────────

export const equipmentSchema = z.object({
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
    .nullable()
    .optional()
    .or(z.literal("")),
});

// ─── Borrow Record ─────────────────────────────────────────────────────

export const borrowSchema = z.object({
  user_id: z.number({ required_error: "User is required" }).int().positive(),
  borrowable_type: z.enum(["equipment", "chemical", "plant_sample"]),
  borrowable_id: z
    .number({ required_error: "Item is required" })
    .int()
    .positive(),
  quantity: z.number({ required_error: "Quantity is required" }).int().min(1),
  due_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ─── User Create ────────────────────────────────────────────────────────

export const userCreateSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.string().email("Invalid email").max(255),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8),
    phone: z.string().max(20).nullable().optional(),
    role: z.enum(["admin", "lab_manager", "student"]),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// ─── User Update ────────────────────────────────────────────────────────

export const userUpdateSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
    password: z.string().min(8).optional(),
    password_confirmation: z.string().min(8).optional(),
    phone: z.string().max(20).nullable().optional(),
    role: z.enum(["admin", "lab_manager", "student"]).optional(),
  })
  .refine(
    (d) => {
      if (d.password && d.password !== d.password_confirmation) return false;
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["password_confirmation"],
    },
  );
