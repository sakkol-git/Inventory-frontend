# Frontend Integration Prompt — Plant Lab Laboratory

> **Generated from:** Complete Laravel backend analysis (Routes, Controllers, FormRequests, JSON Resources, Enums)
> **Purpose:** Copy the PROMPT section below and paste it into an AI agent working on the Frontend React codebase.

---

## Analysis Summary

- **103 API routes** across 13 modules (Auth, Dashboard, Profile, Plant, Chemical, Equipment, Borrow, Operations, Achievements, User Documents, Reports, User Management, Roles & Permissions)
- **29 FormRequest** classes with full validation rules across 13 directories
- **14 JSON Resources** defining exact API response shapes
- **13 PHP Enums** (string-backed) to mirror as TypeScript union types
- **JWT Bearer token auth** via `php-open-source-saver/jwt-auth`
- **3 roles** (`admin`, `lab_manager`, `student`) with **44 granular permissions** via Spatie
- **Soft deletes** on all major models — unique constraints scoped to non-deleted records
- **Polymorphic relationships** for borrows (`equipment`, `chemical`, `plant_sample`) and transactions

---

## THE PROMPT

````markdown
# Plant Lab Laboratory — Frontend Integration Specification

You are building a React frontend (Vite + TypeScript) for the Plant Lab Laboratory Management System.
The backend is a fully-implemented Laravel 12 REST API with JWT authentication.

Use this document as the **single source of truth** for all API integration.

## Tech Stack Requirements

| Layer               | Technology                    | Version        |
| ------------------- | ----------------------------- | -------------- |
| Build               | Vite                          | latest         |
| UI                  | React                         | 18+            |
| Language            | TypeScript                    | 5+ strict mode |
| HTTP                | Axios                         | latest         |
| Server State        | TanStack Query                | v5             |
| Forms               | react-hook-form               | latest         |
| Validation          | Zod + @hookform/resolvers/zod | latest         |
| Routing             | React Router                  | v7             |
| Styling             | Tailwind CSS                  | v4             |
| Icons               | Lucide React                  | latest         |
| Toast/Notifications | Sonner or react-hot-toast     | latest         |

---

## 1. AUTHENTICATION

### Base URL

```
VITE_API_BASE_URL=http://localhost:8000/api
```

### JWT Flow

- All tokens are **Bearer tokens** sent via `Authorization: Bearer <token>`
- Token TTL = 60 minutes (3600 seconds)
- Refresh before expiry by calling `POST /auth/refresh`
- Store `access_token` in memory (React state/context) — NOT localStorage for security
- On 401 response, attempt silent refresh → if that fails, redirect to login

### Auth Endpoints

| Method | Endpoint         | Body              | Auth | Response                                                        |
| ------ | ---------------- | ----------------- | ---- | --------------------------------------------------------------- |
| POST   | `/auth/register` | `RegisterPayload` | No   | `{ message, user: User, access_token, token_type, expires_in }` |
| POST   | `/auth/login`    | `LoginPayload`    | No   | `{ access_token, token_type, expires_in }`                      |
| GET    | `/auth/profile`  | —                 | Yes  | `{ id, name, email, phone, role, permissions: string[] }`       |
| POST   | `/auth/logout`   | —                 | Yes  | `{ message }`                                                   |
| POST   | `/auth/refresh`  | —                 | Yes  | `{ access_token, token_type, expires_in }`                      |

**Rate limits:** Register = 5/min, Login = 10/min

---

## 2. ENUMS — TypeScript Union Types

Every enum below is a string-backed PHP enum. Mirror them as TypeScript `const` + union type:

```typescript
// ── Enums ────────────────────────────────────────────────────────────────────

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
```

---

## 3. TYPESCRIPT INTERFACES — API Response Shapes

These match the Laravel JSON Resources exactly. Every list endpoint wraps in `{ data: T[] }`, every show endpoint wraps in `{ data: T }`.

```typescript
// ── Response Wrapper ─────────────────────────────────────────────────────────
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
}

// ── User ─────────────────────────────────────────────────────────────────────
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    created_at: string; // ISO 8601
    updated_at: string;
}

// ── Auth Responses ───────────────────────────────────────────────────────────
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

// ── Plant Species ────────────────────────────────────────────────────────────
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

// ── Plant Variety ────────────────────────────────────────────────────────────
export interface PlantVariety {
    id: number;
    plant_specy_id: number;
    name: string;
    variety_code: string;
    description: string | null;
    image_url: string | null;
    plant_species?: PlantSpecies; // when eager-loaded
    created_at: string;
    updated_at: string;
}

// ── Plant Sample ─────────────────────────────────────────────────────────────
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
        brought_at: string | null; // YYYY-MM-DD
        location: LabLocation | null;
    };
    meta: {
        description: string | null;
        image: string | null;
        created_at: string;
        updated_at: string;
    };
}

// ── Plant Stock ──────────────────────────────────────────────────────────────
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

// ── Chemical ─────────────────────────────────────────────────────────────────
export interface Chemical {
    id: number;
    common_name: string;
    chemical_code: string | null;
    category: ChemicalCategory;
    quantity: number;
    storage_location: string | null;
    expiry_date: string | null; // YYYY-MM-DD
    danger_level: DangerLevel;
    safety_measures: string | null;
    description: string | null;
    image_url: string | null;
    is_expired: boolean;
    created_at: string;
    updated_at: string;
}

// ── Chemical Batch ───────────────────────────────────────────────────────────
export interface ChemicalBatch {
    id: number;
    chemical_id: number;
    batch_number: string;
    quantity: number;
    remaining_quantity: number;
    unit: string;
    expiry_date: string | null; // YYYY-MM-DD
    is_expired: boolean;
    supplier_name: string | null;
    supplier_contact: string | null;
    received_at: string | null; // YYYY-MM-DD
    cost_per_unit: number | null;
    notes: string | null;
    chemical?: Chemical; // when eager-loaded
    created_at: string;
    updated_at: string;
}

// ── Chemical Usage Log ───────────────────────────────────────────────────────
export interface ChemicalUsageLog {
    id: number;
    chemical_id: number;
    quantity_used: number;
    unit: string;
    purpose: string;
    experiment_name: string | null;
    used_at: string; // ISO 8601
    notes: string | null;
    user: { id: number; name: string } | Record<string, never>;
    chemical?: Chemical;
    batch?: ChemicalBatch;
    created_at: string;
}

// ── Equipment ────────────────────────────────────────────────────────────────
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
    purchase_date: string | null; // YYYY-MM-DD
    purchase_price: number | null;
    description: string | null;
    image_url: string | null;
    is_borrowable: boolean;
    created_at: string;
    updated_at: string;
}

// ── Maintenance Record ───────────────────────────────────────────────────────
export interface MaintenanceRecord {
    id: number;
    equipment_id: number;
    maintenance_type: MaintenanceType;
    description: string;
    technician_name: string | null;
    technician_contact: string | null;
    cost: number | null;
    started_at: string; // YYYY-MM-DD
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

// ── Borrow Record ────────────────────────────────────────────────────────────
export interface BorrowRecord {
    id: number;
    status: BorrowStatus;
    quantity: number;
    borrowed_at: string | null; // ISO 8601
    due_at: string | null;
    returned_at: string | null;
    is_overdue: boolean;
    notes: string | null;
    user: { id: number; name: string } | Record<string, never>;
    item: {
        type: "equipment" | "chemical" | "plant_sample";
        id: number;
        data?: Equipment | Chemical | PlantSample;
    };
    created_at: string;
}

// ── Transaction ──────────────────────────────────────────────────────────────
export interface Transaction {
    id: number;
    action: TransactionAction;
    quantity: number;
    note: string | null;
    user: { id: number; name: string } | Record<string, never>;
    item: {
        type: string; // morph alias
        id: number;
        data?: unknown;
    };
    created_at: string;
}

// ── Achievement ──────────────────────────────────────────────────────────────
export interface Achievement {
    id: number;
    name: string;
    description: string | null;
    criteria_type: string;
    criteria_value: number;
    icon: string | null;
    earned_at?: string; // only when loaded via pivot
    created_at: string;
    updated_at: string;
}

// ── User Document ────────────────────────────────────────────────────────────
export interface UserDocument {
    id: number;
    user_id: number;
    title: string;
    file_path: string;
    file_type: "pdf" | "doc" | "image" | "certificate" | "other";
    file_size: number;
    description: string | null;
    user: { id: number; name: string } | Record<string, never>;
    created_at: string;
    updated_at: string;
}
```

---

## 4. ZOD VALIDATION SCHEMAS

These mirror the Laravel FormRequest rules exactly. Use with `react-hook-form` + `zodResolver`.

```typescript
import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(6),
});
export type LoginPayload = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(255),
        password: z.string().min(6),
        password_confirmation: z.string().min(6),
        phone: z.string().max(20).nullable().optional(),
    })
    .refine((d) => d.password === d.password_confirmation, {
        message: "Passwords must match",
        path: ["password_confirmation"],
    });
export type RegisterPayload = z.infer<typeof registerSchema>;

// ── Profile ──────────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(20).nullable().optional(),
});
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

// ── Plant Species ────────────────────────────────────────────────────────────
export const storePlantSpeciesSchema = z.object({
    common_name: z.string().min(1).max(255),
    khmer_name: z.string().max(255).nullable().optional(),
    scientific_name: z.string().min(1).max(255),
    family: z.string().max(255).nullable().optional(),
    growth_type: z.enum(["annual", "perennial", "biennial"]),
    native_region: z.string().max(255).nullable().optional(),
    propagation_method: z.string().max(255).nullable().optional(),
    description: z.string().nullable().optional(),
    image_url: z.string().url().max(2048).nullable().optional(),
});
export type StorePlantSpeciesPayload = z.infer<typeof storePlantSpeciesSchema>;

export const updatePlantSpeciesSchema = storePlantSpeciesSchema.partial();
export type UpdatePlantSpeciesPayload = z.infer<
    typeof updatePlantSpeciesSchema
>;

// ── Plant Variety ────────────────────────────────────────────────────────────
export const storePlantVarietySchema = z.object({
    plant_specy_id: z.number().int().positive(),
    name: z.string().min(1).max(255),
    variety_code: z.string().min(1).max(100),
    description: z.string().nullable().optional(),
    image_url: z.string().url().max(2048).nullable().optional(),
});
export type StorePlantVarietyPayload = z.infer<typeof storePlantVarietySchema>;

export const updatePlantVarietySchema = storePlantVarietySchema.partial();
export type UpdatePlantVarietyPayload = z.infer<
    typeof updatePlantVarietySchema
>;

// ── Plant Sample ─────────────────────────────────────────────────────────────
export const storePlantSampleSchema = z.object({
    sample_name: z.string().min(1).max(255),
    sample_code: z.string().min(1).max(100),
    plant_specy_id: z.number().int().positive(),
    plant_variety_id: z.number().int().positive().nullable().optional(),
    owner_name: z.string().max(255).nullable().optional(),
    department: z.string().max(255).nullable().optional(),
    origin_location: z.string().max(255).nullable().optional(),
    brought_at: z.string().nullable().optional(), // YYYY-MM-DD
    lab_location: z.enum(["lab_a", "lab_b", "lab_c"]).nullable().optional(),
    status: z.enum(["active", "inactive", "archived"]),
    quantity: z.number().int().min(0),
    description: z.string().nullable().optional(),
    image_url: z.string().url().max(2048).nullable().optional(),
});
export type StorePlantSamplePayload = z.infer<typeof storePlantSampleSchema>;

export const updatePlantSampleSchema = storePlantSampleSchema.partial();
export type UpdatePlantSamplePayload = z.infer<typeof updatePlantSampleSchema>;

// ── Plant Stock ──────────────────────────────────────────────────────────────
export const storePlantStockSchema = z
    .object({
        plant_specy_id: z.number().int().positive(),
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
    plant_specy_id: z.number().int().positive().optional(),
    plant_variety_id: z.number().int().positive().nullable().optional(),
    plant_sample_id: z.number().int().positive().nullable().optional(),
    quantity: z.number().int().min(0).optional(),
    reserved_quantity: z.number().int().min(0).optional(),
    status: z.enum(["available", "reserved", "out_of_stock"]).optional(),
});
export type UpdatePlantStockPayload = z.infer<typeof updatePlantStockSchema>;

// ── Chemical ─────────────────────────────────────────────────────────────────
export const storeChemicalSchema = z.object({
    common_name: z.string().min(1).max(255),
    chemical_code: z.string().max(100).nullable().optional(),
    category: z.enum([
        "acid",
        "base",
        "solvent",
        "oxidizer",
        "reducer",
        "other",
    ]),
    quantity: z.number().int().min(0),
    storage_location: z.string().max(255).nullable().optional(),
    expiry_date: z.string().nullable().optional(), // YYYY-MM-DD
    danger_level: z.enum(["low", "medium", "high"]),
    safety_measures: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    image_url: z.string().url().max(2048).nullable().optional(),
});
export type StoreChemicalPayload = z.infer<typeof storeChemicalSchema>;

export const updateChemicalSchema = storeChemicalSchema.partial();
export type UpdateChemicalPayload = z.infer<typeof updateChemicalSchema>;

// ── Chemical Batch ───────────────────────────────────────────────────────────
export const storeChemicalBatchSchema = z.object({
    chemical_id: z.number().int().positive(),
    batch_number: z.string().min(1).max(100),
    quantity: z.number().int().min(0),
    unit: z.string().min(1).max(20),
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

// ── Chemical Usage Log ───────────────────────────────────────────────────────
export const storeChemicalUsageLogSchema = z.object({
    chemical_id: z.number().int().positive(),
    chemical_batch_id: z.number().int().positive().nullable().optional(),
    quantity_used: z.number().min(0.01),
    unit: z.string().min(1).max(20),
    purpose: z.string().min(1).max(255),
    experiment_name: z.string().max(255).nullable().optional(),
    used_at: z.string().min(1), // ISO date
    notes: z.string().nullable().optional(),
});
export type StoreChemicalUsageLogPayload = z.infer<
    typeof storeChemicalUsageLogSchema
>;

// ── Equipment ────────────────────────────────────────────────────────────────
export const storeEquipmentSchema = z.object({
    equipment_name: z.string().min(1).max(255),
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
    image_url: z.string().url().max(2048).nullable().optional(),
});
export type StoreEquipmentPayload = z.infer<typeof storeEquipmentSchema>;

export const updateEquipmentSchema = storeEquipmentSchema.partial();
export type UpdateEquipmentPayload = z.infer<typeof updateEquipmentSchema>;

// ── Maintenance Record ───────────────────────────────────────────────────────
export const storeMaintenanceRecordSchema = z.object({
    equipment_id: z.number().int().positive(),
    performed_by: z.number().int().positive().nullable().optional(),
    maintenance_type: z.enum([
        "preventive",
        "corrective",
        "calibration",
        "inspection",
    ]),
    description: z.string().min(1),
    technician_name: z.string().max(255).nullable().optional(),
    technician_contact: z.string().max(255).nullable().optional(),
    cost: z.number().min(0).nullable().optional(),
    started_at: z.string().min(1), // date
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

// ── Borrow Record ────────────────────────────────────────────────────────────
export const storeBorrowRecordSchema = z.object({
    user_id: z.number().int().positive(),
    borrowable_type: z.enum(["equipment", "chemical", "plant_sample"]),
    borrowable_id: z.number().int().positive(),
    quantity: z.number().int().min(1),
    due_at: z.string().nullable().optional(), // future date
    notes: z.string().nullable().optional(),
});
export type StoreBorrowRecordPayload = z.infer<typeof storeBorrowRecordSchema>;

export const approveBorrowSchema = z.object({
    notes: z.string().nullable().optional(),
});
export type ApproveBorrowPayload = z.infer<typeof approveBorrowSchema>;

export const rejectBorrowSchema = z.object({
    rejected_reason: z.string().min(1).max(500),
});
export type RejectBorrowPayload = z.infer<typeof rejectBorrowSchema>;

export const returnBorrowSchema = z.object({
    notes: z.string().nullable().optional(),
});
export type ReturnBorrowPayload = z.infer<typeof returnBorrowSchema>;

// ── Achievement ──────────────────────────────────────────────────────────────
export const storeAchievementSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().nullable().optional(),
    criteria_type: z.string().min(1).max(100),
    criteria_value: z.number().int().min(1),
    icon: z.string().max(255).nullable().optional(),
});
export type StoreAchievementPayload = z.infer<typeof storeAchievementSchema>;

export const updateAchievementSchema = storeAchievementSchema.partial();
export type UpdateAchievementPayload = z.infer<typeof updateAchievementSchema>;

// ── User Document ────────────────────────────────────────────────────────────
// NOTE: This uses FormData (multipart/form-data), not JSON
export const storeUserDocumentSchema = z.object({
    file: z
        .instanceof(File)
        .refine((f) => f.size <= 10 * 1024 * 1024, "File max 10MB"),
    title: z.string().min(1).max(255),
    file_type: z.enum(["pdf", "doc", "image", "certificate", "other"]),
    description: z.string().nullable().optional(),
});
export type StoreUserDocumentPayload = z.infer<typeof storeUserDocumentSchema>;

// ── User (Admin CRUD) ────────────────────────────────────────────────────────
export const storeUserSchema = z
    .object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(255),
        password: z.string().min(8), // Password::defaults()
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
```

---

## 5. COMPLETE API ENDPOINT MAP

### 5.1 Plant Species (Full CRUD)

| Method | Endpoint              | Request                     | Response                   |
| ------ | --------------------- | --------------------------- | -------------------------- |
| GET    | `/plant-species`      | —                           | `{ data: PlantSpecies[] }` |
| POST   | `/plant-species`      | `StorePlantSpeciesPayload`  | `{ data: PlantSpecies }`   |
| GET    | `/plant-species/{id}` | —                           | `{ data: PlantSpecies }`   |
| PUT    | `/plant-species/{id}` | `UpdatePlantSpeciesPayload` | `{ data: PlantSpecies }`   |
| DELETE | `/plant-species/{id}` | —                           | `204 No Content`           |

### 5.2 Plant Varieties (Full CRUD)

| Method | Endpoint                | Request                     | Response                   |
| ------ | ----------------------- | --------------------------- | -------------------------- |
| GET    | `/plant-varieties`      | —                           | `{ data: PlantVariety[] }` |
| POST   | `/plant-varieties`      | `StorePlantVarietyPayload`  | `{ data: PlantVariety }`   |
| GET    | `/plant-varieties/{id}` | —                           | `{ data: PlantVariety }`   |
| PUT    | `/plant-varieties/{id}` | `UpdatePlantVarietyPayload` | `{ data: PlantVariety }`   |
| DELETE | `/plant-varieties/{id}` | —                           | `204 No Content`           |

### 5.3 Plant Samples (Full CRUD)

| Method | Endpoint              | Request                    | Response                  |
| ------ | --------------------- | -------------------------- | ------------------------- |
| GET    | `/plant-samples`      | —                          | `{ data: PlantSample[] }` |
| POST   | `/plant-samples`      | `StorePlantSamplePayload`  | `{ data: PlantSample }`   |
| GET    | `/plant-samples/{id}` | —                          | `{ data: PlantSample }`   |
| PUT    | `/plant-samples/{id}` | `UpdatePlantSamplePayload` | `{ data: PlantSample }`   |
| DELETE | `/plant-samples/{id}` | —                          | `204 No Content`          |

### 5.4 Plant Stocks (Full CRUD)

| Method | Endpoint             | Request                   | Response                 |
| ------ | -------------------- | ------------------------- | ------------------------ |
| GET    | `/plant-stocks`      | —                         | `{ data: PlantStock[] }` |
| POST   | `/plant-stocks`      | `StorePlantStockPayload`  | `{ data: PlantStock }`   |
| GET    | `/plant-stocks/{id}` | —                         | `{ data: PlantStock }`   |
| PUT    | `/plant-stocks/{id}` | `UpdatePlantStockPayload` | `{ data: PlantStock }`   |
| DELETE | `/plant-stocks/{id}` | —                         | `204 No Content`         |

### 5.5 Chemicals (Full CRUD)

| Method | Endpoint          | Request                 | Response               |
| ------ | ----------------- | ----------------------- | ---------------------- |
| GET    | `/chemicals`      | —                       | `{ data: Chemical[] }` |
| POST   | `/chemicals`      | `StoreChemicalPayload`  | `{ data: Chemical }`   |
| GET    | `/chemicals/{id}` | —                       | `{ data: Chemical }`   |
| PUT    | `/chemicals/{id}` | `UpdateChemicalPayload` | `{ data: Chemical }`   |
| DELETE | `/chemicals/{id}` | —                       | `204 No Content`       |

### 5.6 Chemical Batches (Full CRUD)

| Method | Endpoint                 | Request                      | Response                    |
| ------ | ------------------------ | ---------------------------- | --------------------------- |
| GET    | `/chemical-batches`      | —                            | `{ data: ChemicalBatch[] }` |
| POST   | `/chemical-batches`      | `StoreChemicalBatchPayload`  | `{ data: ChemicalBatch }`   |
| GET    | `/chemical-batches/{id}` | —                            | `{ data: ChemicalBatch }`   |
| PUT    | `/chemical-batches/{id}` | `UpdateChemicalBatchPayload` | `{ data: ChemicalBatch }`   |
| DELETE | `/chemical-batches/{id}` | —                            | `204 No Content`            |

### 5.7 Chemical Usage Logs (Index + Store + Show only)

| Method | Endpoint                    | Request                        | Response                       |
| ------ | --------------------------- | ------------------------------ | ------------------------------ |
| GET    | `/chemical-usage-logs`      | —                              | `{ data: ChemicalUsageLog[] }` |
| POST   | `/chemical-usage-logs`      | `StoreChemicalUsageLogPayload` | `{ data: ChemicalUsageLog }`   |
| GET    | `/chemical-usage-logs/{id}` | —                              | `{ data: ChemicalUsageLog }`   |

### 5.8 Equipment (Full CRUD)

| Method | Endpoint          | Request                  | Response                |
| ------ | ----------------- | ------------------------ | ----------------------- |
| GET    | `/equipment`      | —                        | `{ data: Equipment[] }` |
| POST   | `/equipment`      | `StoreEquipmentPayload`  | `{ data: Equipment }`   |
| GET    | `/equipment/{id}` | —                        | `{ data: Equipment }`   |
| PUT    | `/equipment/{id}` | `UpdateEquipmentPayload` | `{ data: Equipment }`   |
| DELETE | `/equipment/{id}` | —                        | `204 No Content`        |

### 5.9 Maintenance Records (Full CRUD)

| Method | Endpoint                    | Request                          | Response                        |
| ------ | --------------------------- | -------------------------------- | ------------------------------- |
| GET    | `/maintenance-records`      | —                                | `{ data: MaintenanceRecord[] }` |
| POST   | `/maintenance-records`      | `StoreMaintenanceRecordPayload`  | `{ data: MaintenanceRecord }`   |
| GET    | `/maintenance-records/{id}` | —                                | `{ data: MaintenanceRecord }`   |
| PUT    | `/maintenance-records/{id}` | `UpdateMaintenanceRecordPayload` | `{ data: MaintenanceRecord }`   |
| DELETE | `/maintenance-records/{id}` | —                                | `204 No Content`                |

### 5.10 Borrow Records (Index + Store + Show + Custom Actions)

| Method | Endpoint                       | Request                    | Response                          |
| ------ | ------------------------------ | -------------------------- | --------------------------------- |
| GET    | `/borrow-records`              | —                          | `{ data: BorrowRecord[] }`        |
| POST   | `/borrow-records`              | `StoreBorrowRecordPayload` | `{ data: BorrowRecord }`          |
| GET    | `/borrow-records/{id}`         | —                          | `{ data: BorrowRecord }`          |
| GET    | `/borrow-records/overdue`      | —                          | `{ data: BorrowRecord[] }`        |
| GET    | `/borrow-records/pending`      | —                          | `{ data: BorrowRecord[] }`        |
| POST   | `/borrow-records/{id}/approve` | `ApproveBorrowPayload`     | `{ data: BorrowRecord, message }` |
| POST   | `/borrow-records/{id}/reject`  | `RejectBorrowPayload`      | `{ data: BorrowRecord, message }` |
| POST   | `/borrow-records/{id}/return`  | `ReturnBorrowPayload`      | `{ data: BorrowRecord, message }` |

### 5.11 Transactions (Read-only)

| Method | Endpoint             | Request | Response                  |
| ------ | -------------------- | ------- | ------------------------- |
| GET    | `/transactions`      | —       | `{ data: Transaction[] }` |
| GET    | `/transactions/{id}` | —       | `{ data: Transaction }`   |

### 5.12 Achievements (Full CRUD + Assign/Revoke)

| Method | Endpoint                                        | Request                    | Response                  |
| ------ | ----------------------------------------------- | -------------------------- | ------------------------- |
| GET    | `/achievements`                                 | —                          | `{ data: Achievement[] }` |
| POST   | `/achievements`                                 | `StoreAchievementPayload`  | `{ data: Achievement }`   |
| GET    | `/achievements/{id}`                            | —                          | `{ data: Achievement }`   |
| PUT    | `/achievements/{id}`                            | `UpdateAchievementPayload` | `{ data: Achievement }`   |
| DELETE | `/achievements/{id}`                            | —                          | `204 No Content`          |
| POST   | `/achievements/{achievementId}/assign/{userId}` | —                          | `{ message }`             |
| DELETE | `/achievements/{achievementId}/revoke/{userId}` | —                          | `{ message }`             |

### 5.13 User Documents (Index + Store + Show + Destroy + Download)

| Method | Endpoint                        | Request                | Response                   |
| ------ | ------------------------------- | ---------------------- | -------------------------- |
| GET    | `/user-documents`               | —                      | `{ data: UserDocument[] }` |
| POST   | `/user-documents`               | `FormData` (multipart) | `{ data: UserDocument }`   |
| GET    | `/user-documents/{id}`          | —                      | `{ data: UserDocument }`   |
| DELETE | `/user-documents/{id}`          | —                      | `204 No Content`           |
| GET    | `/user-documents/{id}/download` | —                      | Binary file stream         |

### 5.14 Dashboard (Invokable)

| Method | Endpoint     | Request | Response                      |
| ------ | ------------ | ------- | ----------------------------- |
| GET    | `/dashboard` | —       | See `DashboardResponse` below |

```typescript
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
```

### 5.15 Profile

| Method | Endpoint                      | Request                          | Response                                                                 |
| ------ | ----------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/profile`                    | —                                | See `ProfileShowResponse` below                                          |
| PUT    | `/profile`                    | `UpdateProfilePayload`           | `{ message, data: User }`                                                |
| GET    | `/profile/contributions`      | —                                | `{ data: { contributed_samples, recent_transactions, chemical_usage } }` |
| GET    | `/profile/achievements`       | —                                | `{ data: Achievement[] }`                                                |
| GET    | `/profile/activity?from=&to=` | `?from=YYYY-MM-DD&to=YYYY-MM-DD` | `{ data: { period, transactions, borrows } }`                            |

```typescript
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
```

### 5.16 Reports

| Method | Endpoint                            | Query Params          | Response                       |
| ------ | ----------------------------------- | --------------------- | ------------------------------ |
| GET    | `/reports/inventory`                | —                     | Full inventory data            |
| GET    | `/reports/chemical-usage`           | `?from=&to=`          | Usage grouped by chemical      |
| GET    | `/reports/expired-items`            | —                     | Expired chemicals + batches    |
| GET    | `/reports/borrowed-items`           | —                     | Active/pending/overdue borrows |
| GET    | `/reports/user-activity`            | `?from=&to=`          | Per-user activity stats        |
| GET    | `/reports/{type}/export?format=csv` | `type` = one of above | CSV file download              |

### 5.17 User Management (Admin only)

| Method | Endpoint      | Request             | Response           |
| ------ | ------------- | ------------------- | ------------------ |
| GET    | `/users`      | —                   | `{ data: User[] }` |
| POST   | `/users`      | `StoreUserPayload`  | `{ data: User }`   |
| GET    | `/users/{id}` | —                   | `{ data: User }`   |
| PUT    | `/users/{id}` | `UpdateUserPayload` | `{ data: User }`   |
| DELETE | `/users/{id}` | —                   | `204 No Content`   |

### 5.18 Roles & Permissions (Admin only)

| Method | Endpoint                               | Request                  | Response                 |
| ------ | -------------------------------------- | ------------------------ | ------------------------ |
| GET    | `/roles`                               | —                        | `{ data: Role[] }`       |
| POST   | `/roles`                               | `{ name: string }`       | `{ data: Role }`         |
| GET    | `/roles/{id}`                          | —                        | `{ data: Role }`         |
| PUT    | `/roles/{id}`                          | `{ name: string }`       | `{ data: Role }`         |
| DELETE | `/roles/{id}`                          | —                        | `204 No Content`         |
| GET    | `/roles/{id}/permissions`              | —                        | `{ data: Permission[] }` |
| POST   | `/roles/{id}/permissions`              | `{ permission: string }` | `{ message }`            |
| DELETE | `/roles/{id}/permissions/{permission}` | —                        | `{ message }`            |
| GET    | `/roles/{id}/users`                    | —                        | `{ data: User[] }`       |
| POST   | `/roles/{id}/users`                    | `{ user_id: number }`    | `{ message }`            |
| DELETE | `/roles/{id}/users/{userId}`           | —                        | `{ message }`            |
| GET    | `/permissions`                         | —                        | `{ data: Permission[] }` |
| POST   | `/permissions`                         | `{ name: string }`       | `{ data: Permission }`   |
| GET    | `/permissions/{id}`                    | —                        | `{ data: Permission }`   |
| PUT    | `/permissions/{id}`                    | `{ name: string }`       | `{ data: Permission }`   |
| DELETE | `/permissions/{id}`                    | —                        | `204 No Content`         |

---

## 6. AXIOS CLIENT SETUP

```typescript
// src/lib/axios.ts
import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// ── Token Management ─────────────────────────────────────────────────────────
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// ── Response Interceptor (401 → silent refresh) ─────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) prom.resolve(token);
        else prom.reject(error);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await api.post("/auth/refresh");
                setAccessToken(data.access_token);
                processQueue(null, data.access_token);
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                setAccessToken(null);
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);
```

---

## 7. TANSTACK QUERY — SERVICE LAYER PATTERN

Create one service file per module. Example pattern:

```typescript
// src/services/plantSpeciesService.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
    PlantSpecies,
    ApiResponse,
    StorePlantSpeciesPayload,
    UpdatePlantSpeciesPayload,
} from "@/types";

const QUERY_KEY = ["plant-species"] as const;

// ── Queries ──────────────────────────────────────────────────────────────────
export const usePlantSpecies = () =>
    useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            const { data } =
                await api.get<ApiResponse<PlantSpecies[]>>("/plant-species");
            return data.data;
        },
    });

export const usePlantSpeciesById = (id: number) =>
    useQuery({
        queryKey: [...QUERY_KEY, id],
        queryFn: async () => {
            const { data } = await api.get<ApiResponse<PlantSpecies>>(
                `/plant-species/${id}`,
            );
            return data.data;
        },
        enabled: !!id,
    });

// ── Mutations ────────────────────────────────────────────────────────────────
export const useCreatePlantSpecies = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: StorePlantSpeciesPayload) => {
            const { data } = await api.post<ApiResponse<PlantSpecies>>(
                "/plant-species",
                payload,
            );
            return data.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    });
};

export const useUpdatePlantSpecies = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: UpdatePlantSpeciesPayload & { id: number }) => {
            const { data } = await api.put<ApiResponse<PlantSpecies>>(
                `/plant-species/${id}`,
                payload,
            );
            return data.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    });
};

export const useDeletePlantSpecies = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/plant-species/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    });
};
```

**Replicate this pattern for ALL modules:**

- `plantVarietyService.ts`
- `plantSampleService.ts`
- `plantStockService.ts`
- `chemicalService.ts`
- `chemicalBatchService.ts`
- `chemicalUsageLogService.ts`
- `equipmentService.ts`
- `maintenanceRecordService.ts`
- `borrowRecordService.ts` (include overdue, pending, approve, reject, return)
- `transactionService.ts` (read-only)
- `achievementService.ts` (include assign/revoke)
- `userDocumentService.ts` (use FormData for upload, blob for download)
- `dashboardService.ts`
- `profileService.ts`
- `reportService.ts` (include CSV export via blob)
- `userService.ts` (admin)
- `roleService.ts` (admin)
- `permissionService.ts` (admin)
- `authService.ts`

---

## 8. REACT-HOOK-FORM INTEGRATION PATTERN

```typescript
// Example: Create Plant Species Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storePlantSpeciesSchema, type StorePlantSpeciesPayload } from '@/types/schemas';
import { useCreatePlantSpecies } from '@/services/plantSpeciesService';
import { toast } from 'sonner';

export function CreatePlantSpeciesForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StorePlantSpeciesPayload>({
    resolver: zodResolver(storePlantSpeciesSchema),
  });

  const createMutation = useCreatePlantSpecies();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Plant species created');
      reset();
    } catch (error: any) {
      // Laravel returns { message, errors: { field: string[] } } on 422
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        Object.entries(serverErrors).forEach(([field, messages]) => {
          toast.error(`${field}: ${(messages as string[])[0]}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    }
  });

  return (
    <form onSubmit={onSubmit}>
      {/* form fields here using register() */}
    </form>
  );
}
```

---

## 9. FILE UPLOAD PATTERN (User Documents)

```typescript
// For multipart/form-data uploads
export const useUploadDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            file: File;
            title: string;
            file_type: string;
            description?: string;
        }) => {
            const formData = new FormData();
            formData.append("file", payload.file);
            formData.append("title", payload.title);
            formData.append("file_type", payload.file_type);
            if (payload.description)
                formData.append("description", payload.description);

            const { data } = await api.post("/user-documents", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data.data;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["user-documents"] }),
    });
};

// For file downloads
export const downloadDocument = async (id: number, filename: string) => {
    const { data } = await api.get(`/user-documents/${id}/download`, {
        responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
```

---

## 10. ERROR HANDLING

Laravel returns these standard error formats:

```typescript
// 422 Validation Error
interface ValidationErrorResponse {
    message: string;
    errors: Record<string, string[]>;
}

// 401 Unauthorized
interface UnauthorizedResponse {
    error: string; // "Invalid email or password." or "Unauthenticated."
}

// 403 Forbidden
interface ForbiddenResponse {
    message: string; // "This action is unauthorized."
}

// 404 Not Found
interface NotFoundResponse {
    message: string; // "No query results for model [App\\Models\\X] Y"
}

// 500 Server Error (production shows generic message)
interface ServerErrorResponse {
    message: string;
}
```

---

## 11. ROLE-BASED ACCESS CONTROL

### Permissions (44 total, organized by module)

```
plants.view, plants.create, plants.edit, plants.delete
chemicals.view, chemicals.create, chemicals.edit, chemicals.delete
chemical_batches.view, chemical_batches.create, chemical_batches.edit, chemical_batches.delete
chemical_usage.view, chemical_usage.create
equipment.view, equipment.create, equipment.edit, equipment.delete
maintenance.view, maintenance.create, maintenance.edit, maintenance.delete
borrows.view, borrows.create, borrows.return, borrows.approve
transactions.view
reports.view, reports.export
users.view, users.create, users.edit, users.delete
roles.view, roles.create, roles.edit, roles.delete, roles.assign
permissions.view, permissions.create, permissions.edit, permissions.delete
achievements.view, achievements.create, achievements.edit, achievements.delete, achievements.assign
user_documents.view, user_documents.create, user_documents.delete
```

### Role → Permission Matrix

| Permission           | admin | lab_manager    | student                |
| -------------------- | ----- | -------------- | ---------------------- |
| All `*.view`         | ✅    | ✅             | ✅                     |
| `plants.*` (CRUD)    | ✅    | ✅             | view only              |
| `chemicals.*` (CRUD) | ✅    | ✅             | view only              |
| `chemical_batches.*` | ✅    | ✅             | view only              |
| `chemical_usage.*`   | ✅    | ✅             | view + create          |
| `equipment.*` (CRUD) | ✅    | ✅             | view only              |
| `maintenance.*`      | ✅    | ✅             | view only              |
| `borrows.*`          | ✅    | ✅             | view + create + return |
| `reports.*`          | ✅    | ✅             | view only              |
| `users.*`            | ✅    | —              | —                      |
| `roles.*`            | ✅    | —              | —                      |
| `permissions.*`      | ✅    | —              | —                      |
| `achievements.*`     | ✅    | ✅ (no assign) | view only              |
| `user_documents.*`   | ✅    | view + create  | view + create          |

### Frontend Permission Guard Component

```typescript
// src/components/PermissionGate.tsx
import { useAuth } from '@/hooks/useAuth';

interface Props {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: Props) {
  const { permissions } = useAuth();
  const required = Array.isArray(permission) ? permission : [permission];
  const hasPermission = required.some((p) => permissions.includes(p));
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
```

---

## 12. SUGGESTED PROJECT STRUCTURE

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumbs.tsx
│   ├── ui/                    # Reusable primitives (Button, Input, Modal, Table, Badge, etc.)
│   ├── forms/                 # Generic form components (FormField, SelectField, DatePicker, etc.)
│   └── shared/                # PermissionGate, LoadingSpinner, ErrorBoundary, EmptyState
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── profile/
│   │   ├── ProfilePage.tsx
│   │   ├── ContributionsTab.tsx
│   │   ├── AchievementsTab.tsx
│   │   └── ActivityTab.tsx
│   ├── plants/
│   │   ├── species/
│   │   │   ├── SpeciesListPage.tsx
│   │   │   ├── SpeciesDetailPage.tsx
│   │   │   └── SpeciesFormPage.tsx   # Create + Edit
│   │   ├── varieties/
│   │   │   ├── VarietyListPage.tsx
│   │   │   ├── VarietyDetailPage.tsx
│   │   │   └── VarietyFormPage.tsx
│   │   ├── samples/
│   │   │   ├── SampleListPage.tsx
│   │   │   ├── SampleDetailPage.tsx
│   │   │   └── SampleFormPage.tsx
│   │   └── stocks/
│   │       ├── StockListPage.tsx
│   │       ├── StockDetailPage.tsx
│   │       └── StockFormPage.tsx
│   ├── chemicals/
│   │   ├── ChemicalListPage.tsx
│   │   ├── ChemicalDetailPage.tsx
│   │   ├── ChemicalFormPage.tsx
│   │   ├── batches/
│   │   │   ├── BatchListPage.tsx
│   │   │   ├── BatchDetailPage.tsx
│   │   │   └── BatchFormPage.tsx
│   │   └── usage/
│   │       ├── UsageLogListPage.tsx
│   │       └── LogUsageFormPage.tsx
│   ├── equipment/
│   │   ├── EquipmentListPage.tsx
│   │   ├── EquipmentDetailPage.tsx
│   │   ├── EquipmentFormPage.tsx
│   │   └── maintenance/
│   │       ├── MaintenanceListPage.tsx
│   │       ├── MaintenanceDetailPage.tsx
│   │       └── MaintenanceFormPage.tsx
│   ├── borrows/
│   │   ├── BorrowListPage.tsx
│   │   ├── BorrowDetailPage.tsx
│   │   ├── NewBorrowPage.tsx
│   │   ├── PendingApprovalsPage.tsx
│   │   └── OverdueBorrowsPage.tsx
│   ├── reports/
│   │   ├── ReportsDashboardPage.tsx
│   │   ├── InventoryReportPage.tsx
│   │   ├── ChemicalUsageReportPage.tsx
│   │   ├── ExpiredItemsReportPage.tsx
│   │   ├── BorrowedItemsReportPage.tsx
│   │   └── UserActivityReportPage.tsx
│   ├── achievements/
│   │   ├── AchievementListPage.tsx
│   │   └── AchievementFormPage.tsx
│   ├── documents/
│   │   ├── DocumentListPage.tsx
│   │   └── UploadDocumentPage.tsx
│   ├── admin/
│   │   ├── users/
│   │   │   ├── UserListPage.tsx
│   │   │   ├── UserDetailPage.tsx
│   │   │   └── UserFormPage.tsx
│   │   ├── roles/
│   │   │   ├── RoleListPage.tsx
│   │   │   └── RolePermissionsPage.tsx
│   │   └── permissions/
│   │       └── PermissionListPage.tsx
│   └── transactions/
│       ├── TransactionListPage.tsx
│       └── TransactionDetailPage.tsx
├── services/                  # One file per API module (TanStack Query hooks)
├── hooks/
│   ├── useAuth.ts             # Auth context + token management
│   └── usePermissions.ts
├── lib/
│   ├── axios.ts               # Axios instance + interceptors
│   └── queryClient.ts         # TanStack Query client config
├── types/
│   ├── index.ts               # All interfaces
│   ├── enums.ts               # All enum objects + types
│   └── schemas.ts             # All Zod schemas
├── contexts/
│   └── AuthContext.tsx
├── routes/
│   └── index.tsx              # React Router configuration
└── App.tsx
```

---

## 13. IMPLEMENTATION EXECUTION PLAN

Execute in this exact order:

### Phase 1: Foundation

1. Project setup: `npm create vite@latest . -- --template react-ts`
2. Install deps: `npm i axios @tanstack/react-query react-router react-hook-form @hookform/resolvers zod lucide-react sonner`
3. Install Tailwind CSS v4
4. Create `src/types/enums.ts`, `src/types/index.ts`, `src/types/schemas.ts`
5. Create `src/lib/axios.ts` with interceptors
6. Create `src/lib/queryClient.ts`

### Phase 2: Auth

7. Create `AuthContext.tsx` with login/logout/register/refresh
8. Create Login + Register pages
9. Create protected route wrapper

### Phase 3: Layout

10. Create `AppLayout` with sidebar navigation
11. Create `Sidebar` with role-aware menu items
12. Create `PermissionGate` component

### Phase 4: Dashboard

13. Create `DashboardPage` consuming `/dashboard` endpoint
14. Add count cards, alert badges, recent activity table, status breakdown charts

### Phase 5: CRUD Modules (one at a time)

15. Plant Species (list → detail → create → edit → delete)
16. Plant Varieties
17. Plant Samples
18. Plant Stocks
19. Chemicals
20. Chemical Batches
21. Chemical Usage Logs
22. Equipment
23. Maintenance Records

### Phase 6: Borrow Workflow

24. Borrow list + detail
25. New borrow request form
26. Pending approvals page (lab_manager/admin)
27. Approve/reject/return actions
28. Overdue borrows page

### Phase 7: Supporting Features

29. Transactions (read-only list + detail)
30. Achievements (CRUD + assign/revoke)
31. User Documents (upload + list + download)
32. Profile pages (show, edit, contributions, achievements, activity)

### Phase 8: Reports

33. Reports dashboard with links to each report
34. Individual report pages with tables
35. CSV export download buttons

### Phase 9: Admin

36. User management (CRUD)
37. Role management (CRUD + permission assignment)
38. Permission management

### Phase 10: Polish

39. Loading states, error boundaries, empty states
40. Toast notifications on all mutations
41. Responsive design for mobile
42. Dark mode support
43. Final testing against live API
````

---

**END OF PROMPT — Copy everything between the ```` markers above and paste into your frontend AI agent.**
