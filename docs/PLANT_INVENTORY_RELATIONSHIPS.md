# Plant inventory — canonical data model & relationships

**Purpose:** define a single-source-of-truth data model for Plant Species, Varieties, Stock (batches) and Samples — include constraints, DDL, TypeScript contracts, UI validation rules and a migration/backfill plan.

Last updated: 2026-02-16

---

## Summary (TL;DR) ✅

- Use foreign keys (species_id, variety_id, stock_id) as the canonical links.
- Prevent deletion of referenced entities (DB: ON DELETE RESTRICT). Use UI delete-guards.
- Samples represent _physical inventory or test aliquots_ and may optionally reference a Variety and/or a Stock (batch).
- Varieties represent _genetic definitions_ and must reference Species.
- Stock (batches) are physical groups of plants derived from a species (and optionally a variety).

---

## ER diagram (canonical)

```mermaid
erDiagram
    PLANT_SPECIES {
      uuid id PK
      string common_name
      string scientific_name
      text description
      timestamp created_at
      timestamp updated_at
    }

    PLANT_VARIETIES {
      uuid id PK
      uuid species_id FK
      string name
      string variety_code
      string unique_code
      text description
      text[] traits
      number germination_rate
      string status
      timestamp created_at
      timestamp updated_at
    }

    PLANT_STOCK {
      uuid id PK
      uuid species_id FK
      uuid variety_id FK NULL
      string common_name
      string stage
      integer quantity
      string quantity_unit
      integer reserved_quantity
      string status
      string location
      timestamp start_date
      timestamp expected_harvest_date
      timestamp created_at
      timestamp updated_at
    }

    PLANT_SAMPLES {
      uuid id PK
      uuid species_id FK
      uuid variety_id FK NULL
      uuid stock_id FK NULL
      string name
      string sample_code
      integer quantity
      string quantity_unit
      string status
      string storage_location
      timestamp date_brought
      timestamp created_at
      timestamp updated_at
    }

    PLANT_SPECIES ||--o{ PLANT_VARIETIES : has
    PLANT_SPECIES ||--o{ PLANT_STOCK : "hosts batches"
    PLANT_VARIETIES ||--o{ PLANT_STOCK : "may classify"
    PLANT_VARIETIES ||--o{ PLANT_SAMPLES : "defines"
    PLANT_STOCK ||--o{ PLANT_SAMPLES : "source-of"
    PLANT_SPECIES ||--o{ PLANT_SAMPLES : "may own"
```

---

## Entities & responsibilities

- PlantSpecies — taxonomy & canonical names (common/scientific). Lightweight, rarely changed.
- PlantVariety — genetic/trait metadata (traits, germinationRate, diseaseResistance). Immutable-ish.
- PlantStock (batch) — physical inventory (quantity, stage, location, reservedQuantity). Changes frequently.
- PlantSample — physical/test aliquots (quantity, storage conditions, status). Often consumed.

---

## Key design rules / invariants (business logic)

- species_id is required on varieties, stock and samples.
- variety_id is optional for stock and samples (some stock/samples may be species-only).
- stock.reserved_quantity <= stock.quantity (DB CHECK + UI guard).
- sample.quantity >= 0; stock.quantity >= 0.
- Prevent deleting species/variety if dependent rows exist (DB: RESTRICT; UI: block + list dependents).
- When creating/updating, always validate FKs server-side and client-side (validateSpeciesExists/validateVarietyExists).
- Denormalized display fields (species_name, variety_name) are allowed but must be derived from FKs at write-time.

---

## Suggested SQL (core excerpts)

```sql
-- status enums
CREATE TYPE enum_plant_variety_status AS ENUM ('Active','Archived','Destroyed');
CREATE TYPE enum_plant_stock_status AS ENUM ('Growing','Seed','Harvested','Failed');
CREATE TYPE enum_plant_sample_status AS ENUM ('Active','In Testing','Consumed','Contaminated','Archived','Destroyed');

-- species
CREATE TABLE plant_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- varieties
CREATE TABLE plant_varieties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES plant_species(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  variety_code TEXT UNIQUE,
  unique_code TEXT UNIQUE,
  traits TEXT[],
  germination_rate NUMERIC,
  disease_resistance TEXT,
  maturity_days INT,
  status enum_plant_variety_status NOT NULL DEFAULT 'Active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- stock (batches)
CREATE TABLE plant_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES plant_species(id) ON DELETE RESTRICT,
  variety_id UUID REFERENCES plant_varieties(id) ON DELETE SET NULL,
  common_name TEXT,
  stage TEXT,
  quantity INT NOT NULL CHECK (quantity >= 0),
  quantity_unit TEXT DEFAULT 'units',
  reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  status enum_plant_stock_status NOT NULL DEFAULT 'Seed',
  location TEXT,
  start_date DATE,
  expected_harvest_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE plant_stock ADD CONSTRAINT reserved_leq_quantity CHECK (reserved_quantity <= quantity);

-- samples
CREATE TABLE plant_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES plant_species(id) ON DELETE RESTRICT,
  variety_id UUID REFERENCES plant_varieties(id) ON DELETE SET NULL,
  stock_id UUID REFERENCES plant_stock(id) ON DELETE SET NULL,
  sample_code TEXT UNIQUE,
  name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  quantity_unit TEXT DEFAULT 'units',
  status enum_plant_sample_status NOT NULL DEFAULT 'Active',
  storage_location TEXT,
  date_brought DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);
```

> Note: use ON DELETE RESTRICT for species to avoid orphaning. Use ON DELETE SET NULL for optional variety/stock references when appropriate.

---

## TypeScript model (examples to add/update in `src/types/inventory.ts`)

```ts
export type PlantVarietyStatus = "Active" | "Archived" | "Destroyed";
export type PlantStockStatus =
  | "Seed"
  | "Seedling"
  | "Growing"
  | "Harvested"
  | "Failed";
export type PlantSampleStatus =
  | "Active"
  | "In Testing"
  | "Consumed"
  | "Contaminated"
  | "Archived"
  | "Destroyed";

export interface PlantSpecies {
  id: string;
  commonName: string;
  scientificName?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PlantVariety extends Auditable {
  id: string;
  speciesId: string; // FK
  name: string;
  varietyCode?: string;
  traits?: string[];
  germinationRate?: number;
  status: PlantVarietyStatus;
  // ...
}

export interface PlantStock extends Auditable {
  id: string;
  speciesId: string;
  varietyId?: string | null;
  commonName?: string;
  stage?: string;
  quantity: number;
  quantityUnit?: string;
  reservedQuantity?: number;
  status: PlantStockStatus;
  location?: string;
}

export interface PlantSample extends Auditable {
  id: string;
  sampleCode?: string;
  speciesId: string;
  varietyId?: string | null;
  stockId?: string | null;
  name: string;
  quantity: number;
  quantityUnit?: string;
  status: PlantSampleStatus;
  storageLocation?: string;
}
```

---

## UI & validation rules (client + server)

- Forms: use `speciesId` (Select) and optional `varietyId` (dependent Select filtered by speciesId).
- Show denormalized `speciesName` / `varietyName` in lists but persist FK values.
- Validation before save:
  - `validateSpeciesExists(speciesId)`
  - `validateVarietyExists(varietyId, speciesId)` (if varietyId provided, ensure it belongs to the selected species)
  - `quantity` is numeric and >= 0
  - `reservedQuantity <= quantity`
- Delete guard: when deleting a species/variety show dependent counts (samples, stock, contracts) and prevent delete unless force/archival flow.

---

## Backfill & migration plan (safe steps)

1. **Add new enums & columns** (DDL above).
2. **Backfill species_id on stock/samples** using a best-effort name-match script (report any unmatched rows for manual review).

   Example SQL backfill (one-time):

   ```sql
   UPDATE plant_stock s
   SET species_id = sp.id
   FROM plant_species sp
   WHERE lower(sp.common_name) = lower(s.common_name)
     AND s.species_id IS NULL;
   ```

   For varietal backfill, match on `varietyCode` or `unique_code` where available.

3. **Add NOT NULL / FK constraints** after backfill and verification.
4. **Run application tests** and fix UI to read/write FKs.
5. **Deploy** with a migration window; verify sample/stock counts.

---

## API contract examples

- GET /api/species
- GET /api/varieties?speciesId={id}
- GET /api/stock?speciesId={id}&varietyId={id}
- POST /api/stock (validates speciesId/varietyId)
- POST /api/samples (validates speciesId/varietyId/stockId)
- POST /api/stock/:id/reserve { amount } (atomic, CHECK available >= amount )

---

## Tests to add

- Unit: validateForeignKey(speciesId) and validateVarietyBelongsToSpecies(varietyId, speciesId)
- Integration: create sample for given stock — quantity decrement/consumption flows
- Migration: backfill script unit/integration tests + report for unmatched rows
- Edge: enforce reservedQuantity <= quantity

---

## Implementation checklist (start here)

1. [ ] Add enums & columns (migration SQL)
2. [ ] Backfill speciesId / varietyId (script + report)
3. [ ] Add / update TypeScript types
4. [ ] Update hooks/pages to use speciesId/varietyId selects and validation
5. [ ] Add delete-guard UI and server-side FK checks
6. [ ] Add tests and run migration in staging

---

## Recommended next actions (pick one)

- Add DB migration SQL + backfill script (recommended first) ✅
- Update TypeScript types + mock data
- Implement UI changes (forms + validation)

---

> If you want, I can implement any of the three next steps above — tell me which and I’ll produce the patches and tests.
