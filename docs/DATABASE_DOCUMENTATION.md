# BioLab Compass — Complete Database Documentation

**Reverse-Engineered from UI Source Code**

**Author:** Principal Software Architect / Database Engineer  
**Date:** February 14, 2026  
**Version:** 1.1 (Updated: February 14, 2026)  
**Normalization:** 3NF (Third Normal Form)  
**Database:** PostgreSQL 14+ (recommended) / MySQL 8.0+

---

## TABLE OF CONTENTS

1. [Database Overview](#database-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. Business Module
   - [3.1 Clients](#31-clients)
   - [3.2 Contracts](#32-contracts)
   - [3.3 Contract Milestones](#33-contract-milestones)
   - [3.4 Payments](#34-payments)
   - [3.5 Production Forecasts](#35-production-forecasts)
4. Inventory Module
   - [4.1 Plant Species](#41-plant-species)
   - [4.2 Plant Batches](#42-plant-batches)
   - [4.3 Chemicals](#43-chemicals)
   - [4.4 Equipment](#44-equipment)
   - [4.5 Inventory Transactions](#45-inventory-transactions)
5. Research Module
   - [5.1 Experiments](#51-experiments)
   - [5.2 Growth Logs](#52-growth-logs)
   - [5.3 Protocols](#53-protocols)
   - [5.4 Lab Notebooks](#54-lab-notebooks)
   - [5.5 Species Growth Profiles](#55-species-growth-profiles)
6. Shared / Support Module
   - [6.1 Users](#61-users)
7. [Enum Definitions](#7-enum-definitions)
8. [Indexing Strategy](#8-indexing-strategy)
9. [Data Integrity Rules](#9-data-integrity-rules)
10. [API Payload Examples](#10-api-payload-examples)
11. [Scalability Considerations](#11-scalability-considerations)
12. [Application Layer Field Mapping](#12-application-layer-field-mapping)

---

## 1. DATABASE OVERVIEW

### System Purpose

BioLab Compass is a comprehensive laboratory management system for plant research facilities, managing:

- Client relationships and seedling production contracts
- Laboratory inventory (chemicals, equipment, plant materials)
- Research experiments and growth tracking
- Standard operating protocols and lab notebooks

### Total Entity Count

**16 core tables** organized into 3 domain modules + 1 support module:

- Business: 5 tables (clients, contracts, contract_milestones, payments, production_forecasts)
- Inventory: 5 tables (plant_species, plant_batches, chemicals, equipment, inventory_transactions)
- Research: 5 tables (experiments, growth_logs, protocols, lab_notebooks, species_growth_profiles)
- Shared/Support: 1 table (users)

> **Note:** Additional support tables (settings, attachments, tags, audit_logs) are planned for future phases but not yet implemented in the current application.

### Data Model Characteristics

- **Soft deletions** supported across all entities (deleted_at column)
- **Audit trails** for all transactional tables (created_by, updated_by, created_at, updated_at)
- **Polymorphic relationships** for tags and attachments
- **Computed fields** stored for performance (e.g., totalValue, progressPct)
- **JSON storage** for flexible nested data (environmental logs, specifications)

---

## 2. ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BUSINESS MODULE                                 │
└─────────────────────────────────────────────────────────────────────────┘

   ┌─────────────┐
   │   clients   │──────┐
   └──────┬──────┘      │ client_name (denormalized)
          │ 1            ▼
          │             ┌────────────────┐           ┌──────────────────┐
          │ N           │   contracts    ├──────────►│ plant_species    │
          └────────────►│ (+ client_name)│ N      1  └──────────────────┘
                        └──────┬─────────┘
                               │ 1
                               ├───────────────┬──────────────────┐
                               │ N             │ N                │ N
                        ┌──────▼────────┐ ┌───▼──────────┐  ┌───▼─────────────────┐
                        │ payments      │ │contract_     │  │production_forecasts │
                        └───────────────┘ │milestones    │  └─────────────────────┘
                                          └──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         INVENTORY MODULE                                 │
└─────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────┐
   │  plant_species   │
   └────────┬─────────┘
            │ 1
            ├────────────────────┬────────────────────┐
            │ N                  │ N                  │ N
   ┌────────▼─────────┐   ┌──────▼────────┐   ┌──────▼──────────┐
   │  plant_batches   │   │ experiments  │   │   contracts     │
   │(+species_name,   │   │(+species_name)│   │(+species_name,  │
   │ common_name)     │   │               │   │ common_name)    │
   └──────────────────┘   └───────────────┘   └─────────────────┘

   ┌───────────┐      ┌───────────┐      ┌─────────────────┐         ┌─────────┐
   │ chemicals │      │ equipment │      │inv_transactions ├────────►│  users  │
   └───────────┘      └───────────┘      └────────┬────────┘ N    1  └─────────┘
                                                   │ polymorphic
                                                   ▼
                                          plant | chemical | equipment

┌─────────────────────────────────────────────────────────────────────────┐
│                         RESEARCH MODULE                                  │
└─────────────────────────────────────────────────────────────────────────┘

   ┌──────────────┐
   │ experiments  │
   └──────┬───────┘
          │ 1
          ├────────────────┬──────────────┐
          │ N              │ N            │ 0..1
   ┌──────▼────────┐  ┌───▼────────┐ ┌──▼──────────┐
   │ growth_logs   │  │lab_notebooks│ │ protocols   │
   └───────────────┘  └─────────────┘ └─────────────┘

   ┌──────────────────────┐
   │species_growth_       │
   │profiles (aggregate)  │
   └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    SHARED / SUPPORT MODULE                               │
└─────────────────────────────────────────────────────────────────────────┘

   ┌─────────┐
   │  users  │──────► (referenced by created_by, updated_by in all tables)
   └─────────┘

**Notes:**
- Denormalized fields: contracts.client_name, contracts.species_name/common_name
- All domain tables have audit columns (created_by, updated_by) referencing users.id
- inventory_transactions uses polymorphic associations (item_type + item_id)
```

│ growth_logs │ │lab_notebooks│ │ protocols │
└───────────────┘ └─────────────┘ └─────────────┘

┌──────────────────────┐
│species*growth* │
│profiles (aggregate) │
└──────────────────────┘

````

---

## 3. BUSINESS MODULE

### 3.1 CLIENTS

**Table Name:** `clients`

**Purpose:** Store client/customer information for seedling production contracts.

**Fields:**

| Field Name      | Type          | Required | Constraints              | Description                            | Example                      |
| --------------- | ------------- | -------- | ------------------------ | -------------------------------------- | ---------------------------- |
| id              | bigint (PK)   | Yes      | Auto-increment           | Primary key                            | 1                            |
| client_code     | varchar(20)   | Yes      | UNIQUE, Pattern: CLT-### | Business identifier                    | CLT-001                      |
| company_name    | varchar(255)  | Yes      | Min 1 char               | Client company name                    | Green Valley Farms           |
| contact_name    | varchar(255)  | Yes      | Min 1 char               | Primary contact person                 | John Smith                   |
| email           | varchar(255)  | No       | Valid email format       | Contact email                          | john@greenvalley.com         |
| phone           | varchar(50)   | No       | —                        | Contact phone                          | +1-555-0123                  |
| address         | text          | No       | —                        | Full mailing address                   | 123 Farm Road, CA 90210      |
| client_type     | enum          | Yes      | See enum_client_type     | Client classification                  | Farm Owner                   |
| notes           | text          | No       | —                        | Additional remarks                     | Long-term partner since 2020 |
| total_contracts | integer       | No       | Default: 0, >= 0         | Computed: count of contracts           | 12                           |
| total_value     | decimal(12,2) | No       | Default: 0.00, >= 0      | Computed: sum of contract values (USD) | 45000.00                     |
| is_active       | boolean       | Yes      | Default: true            | Soft delete flag                       | true                         |
| created_by      | bigint (FK)   | No       | FK → users.id            | Creator user ID                        | 5                            |
| updated_by      | bigint (FK)   | No       | FK → users.id            | Last modifier user ID                  | 5                            |
| created_at      | timestamp     | Yes      | Auto-set on insert       | Creation timestamp                     | 2026-01-15 10:30:00          |
| updated_at      | timestamp     | Yes      | Auto-update on change    | Last update timestamp                  | 2026-02-01 14:22:00          |
| deleted_at      | timestamp     | No       | NULL when active         | Soft delete timestamp                  | NULL                         |

**Relationships:**

- **1:N** → `contracts` (one client has many contracts)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_client_code ON clients(client_code)`
- Search: `INDEX idx_company_name ON clients(company_name)`
- Filter: `INDEX idx_client_type ON clients(client_type)`
- Soft Delete: `INDEX idx_deleted_at ON clients(deleted_at)` (partial: WHERE deleted_at IS NULL)

**Business Rules:**

- `client_code` auto-generated on creation (format: CLT-###, zero-padded 3 digits)
- `total_contracts` and `total_value` updated via database triggers when contracts are added/modified
- `email` optional but recommended for notifications
- Soft delete: set `deleted_at` instead of hard delete; prevents orphan contracts

**Validation (Application Layer):**

- `company_name` and `contact_name` cannot be empty strings
- `email` must match RFC 5322 format if provided
- `phone` should be internationalized format (E.164 recommended)

---

### 3.2 CONTRACTS

**Table Name:** `contracts`

**Purpose:** Seedling production contracts between clients and lab.

**Fields:**

| Field Name           | Type          | Required | Constraints                              | Description                   | Example                               |
| -------------------- | ------------- | -------- | ---------------------------------------- | ----------------------------- | ------------------------------------- |
| id                   | bigint (PK)   | Yes      | Auto-increment                           | Primary key                   | 1                                     |
| contract_code        | varchar(20)   | Yes      | UNIQUE, Pattern: CON-###                 | Business identifier           | CON-001                               |
| client_id            | bigint (FK)   | Yes      | FK → clients.id                          | Reference to client           | 3                                     |
| client_name          | varchar(255)  | Yes      | Denormalized from clients                | Client company name (cached)  | Green Valley Farms                    |
| species_id           | bigint (FK)   | Yes      | FK → plant_species.id                    | Plant species being produced  | 12                                    |
| species_name         | varchar(255)  | Yes      | Denormalized from species                | Scientific name (cached)      | Solanum lycopersicum                  |
| common_name          | varchar(255)  | Yes      | Denormalized from species                | Common name (cached)          | Tomato                                |
| quantity_ordered     | integer       | Yes      | > 0                                      | Number of seedlings ordered   | 5000                                  |
| quantity_delivered   | integer       | No       | Default: 0, >= 0, <= quantity_ordered    | Seedlings delivered so far    | 2500                                  |
| unit_price           | decimal(10,2) | Yes      | >= 0                                     | Price per seedling (USD)      | 2.50                                  |
| total_value          | decimal(12,2) | Yes      | Computed: quantity_ordered \* unit_price | Total contract value (USD)    | 12500.00                              |
| currency             | varchar(3)    | Yes      | ISO 4217 code                            | Currency code                 | USD                                   |
| contract_date        | date          | Yes      | <= TODAY                                 | Date contract signed          | 2026-01-10                            |
| delivery_deadline    | date          | Yes      | > contract_date                          | Expected delivery date        | 2026-04-15                            |
| actual_delivery_date | date          | No       | —                                        | Actual completion date        | 2026-04-10                            |
| status               | enum          | Yes      | See enum_contract_status                 | Contract lifecycle status     | In Production                         |
| terms                | text          | No       | —                                        | Contract terms and conditions | Payment on delivery. 30-day warranty. |
| managed_by           | varchar(255)  | Yes      | —                                        | Lab staff responsible         | Dr. Sarah Chen                        |
| progress_pct         | decimal(5,2)  | No       | Default: 0, 0-100                        | Completion percentage         | 50.00                                 |
| created_by           | bigint (FK)   | No       | FK → users.id                            | Creator user ID               | 8                                     |
| updated_by           | bigint (FK)   | No       | FK → users.id                            | Last modifier user ID         | 8                                     |
| created_at           | timestamp     | Yes      | Auto-set                                 | Creation timestamp            | 2026-01-10 09:00:00                   |
| updated_at           | timestamp     | Yes      | Auto-update                              | Last update timestamp         | 2026-02-14 11:30:00                   |
| deleted_at           | timestamp     | No       | NULL when active                         | Soft delete timestamp         | NULL                                  |

**Relationships:**

- **N:1** → `clients` (many contracts belong to one client)
- **N:1** → `plant_species` (many contracts reference one species)
- **1:N** → `contract_milestones` (one contract has many milestones)
- **1:N** → `payments` (one contract has many payments)
- **1:N** → `production_forecasts` (one contract may have production planning data)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_contract_code ON contracts(contract_code)`
- Foreign Keys: `INDEX idx_client_id ON contracts(client_id)`
- Foreign Keys: `INDEX idx_species_id ON contracts(species_id)`
- Filter: `INDEX idx_status ON contracts(status)`
- Date Range: `INDEX idx_delivery_deadline ON contracts(delivery_deadline)`
- Soft Delete: `INDEX idx_deleted_at ON contracts(deleted_at)` (partial)

**Business Rules:**

- `contract_code` auto-generated (format: CON-###)
- `total_value` computed field: `quantity_ordered * unit_price`
- `progress_pct` calculated from milestones or delivery progress
- `client_name`, `species_name`, and `common_name` denormalized for performance (updated via triggers when parent records change)
- `status` transitions: Draft → Sent → Signed → In Production → Ready → Delivered
- Cannot delete if payments exist (protect financial records)

**Validation:**

- `delivery_deadline` must be after `contract_date`
- `quantity_delivered` cannot exceed `quantity_ordered`
- `unit_price` must be positive
- `actual_delivery_date` only set when status = "Delivered"

---

### 3.3 CONTRACT MILESTONES

**Table Name:** `contract_milestones`

**Purpose:** Track production milestones for contracts.

**Fields:**

| Field Name      | Type         | Required | Constraints                          | Description             | Example                     |
| --------------- | ------------ | -------- | ------------------------------------ | ----------------------- | --------------------------- |
| id              | bigint (PK)  | Yes      | Auto-increment                       | Primary key             | 1                           |
| contract_id     | bigint (FK)  | Yes      | FK → contracts.id, ON DELETE CASCADE | Parent contract         | 5                           |
| milestone_name  | varchar(255) | Yes      | Min 1 char                           | Milestone description   | Seedling stage reached      |
| target_date     | date         | Yes      | —                                    | Planned completion date | 2026-03-01                  |
| actual_date     | date         | No       | —                                    | Actual completion date  | 2026-03-03                  |
| projected_count | integer      | Yes      | >= 0                                 | Expected seedling count | 1500                        |
| actual_count    | integer      | No       | >= 0                                 | Actual seedling count   | 1480                        |
| status          | enum         | Yes      | See enum_milestone_status            | Milestone status        | Completed                   |
| notes           | text         | No       | —                                    | Additional observations | Slight delay due to weather |
| created_at      | timestamp    | Yes      | Auto-set                             | Creation timestamp      | 2026-01-15 10:00:00         |
| updated_at      | timestamp    | Yes      | Auto-update                          | Last update timestamp   | 2026-03-03 09:15:00         |

**Relationships:**

- **N:1** → `contracts` (many milestones belong to one contract)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Foreign Key: `INDEX idx_contract_id ON contract_milestones(contract_id)`
- Filter: `INDEX idx_status ON contract_milestones(status)`
- Date Query: `INDEX idx_target_date ON contract_milestones(target_date)`

**Business Rules:**

- Cascading delete when contract is deleted
- `status` automatically computed based on dates and counts
- `actual_count` can differ from `projected_count` (tracked for analysis)

---

### 3.4 PAYMENTS

**Table Name:** `payments`

**Purpose:** Financial transactions linked to contracts.

**Fields:**

| Field Name       | Type          | Required | Constraints              | Description                | Example                 |
| ---------------- | ------------- | -------- | ------------------------ | -------------------------- | ----------------------- |
| id               | bigint (PK)   | Yes      | Auto-increment           | Primary key                | 1                       |
| payment_code     | varchar(20)   | Yes      | UNIQUE, Pattern: PAY-### | Business identifier        | PAY-001                 |
| contract_id      | bigint (FK)   | Yes      | FK → contracts.id        | Related contract           | 8                       |
| contract_code    | varchar(20)   | Yes      | Denormalized             | Contract code (cached)     | CON-008                 |
| client_name      | varchar(255)  | Yes      | Denormalized             | Client name (cached)       | Green Valley Farms      |
| amount           | decimal(12,2) | Yes      | > 0                      | Payment amount             | 5000.00                 |
| currency         | varchar(3)    | Yes      | ISO 4217                 | Currency code              | USD                     |
| payment_type     | enum          | Yes      | See enum_payment_type    | Payment category           | Deposit                 |
| payment_method   | varchar(100)  | Yes      | —                        | Method of payment          | Wire Transfer           |
| payment_date     | date          | Yes      | —                        | Date payment received/made | 2026-01-20              |
| due_date         | date          | Yes      | —                        | Payment deadline           | 2026-01-15              |
| status           | enum          | Yes      | See enum_payment_status  | Payment status             | Received                |
| reference_number | varchar(100)  | No       | —                        | Transaction reference      | TXN-2026-0123456        |
| notes            | text          | No       | —                        | Additional payment notes   | First installment (40%) |
| created_by       | bigint (FK)   | No       | FK → users.id            | Creator user ID            | 10                      |
| updated_by       | bigint (FK)   | No       | FK → users.id            | Last modifier user ID      | 10                      |
| created_at       | timestamp     | Yes      | Auto-set                 | Record creation            | 2026-01-20 14:30:00     |
| updated_at       | timestamp     | Yes      | Auto-update              | Last update                | 2026-01-21 09:00:00     |
| deleted_at       | timestamp     | No       | NULL when active         | Soft delete                | NULL                    |

**Relationships:**

- **N:1** → `contracts` (many payments belong to one contract)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_payment_code ON payments(payment_code)`
- Foreign Key: `INDEX idx_contract_id ON payments(contract_id)`
- Filter: `INDEX idx_status ON payments(status)`
- Date Range: `INDEX idx_payment_date ON payments(payment_date)`
- Date Range: `INDEX idx_due_date ON payments(due_date)`
- Soft Delete: `INDEX idx_deleted_at ON payments(deleted_at)` (partial)

**Business Rules:**

- `payment_code` auto-generated (format: PAY-###)
- `status` auto-computed: if `payment_date > due_date` and status='Pending', set to 'Overdue'
- Denormalized fields (`contract_code`, `client_name`) for reporting performance
- Cannot delete if reconciled (financial audit requirement)

**Validation:**

- `amount` must be positive
- `payment_date` should not be in future (for received payments)
- Sum of payments for a contract should not exceed contract `total_value`

---

### 3.5 PRODUCTION FORECASTS

**Table Name:** `production_forecasts`

**Purpose:** Store production planning calculations and resource estimates.

**Fields:**

| Field Name                    | Type         | Required | Constraints                              | Description                  | Example                                                 |
| ----------------------------- | ------------ | -------- | ---------------------------------------- | ---------------------------- | ------------------------------------------------------- |
| id                            | bigint (PK)  | Yes      | Auto-increment                           | Primary key                  | 1                                                       |
| forecast_code                 | varchar(20)  | Yes      | UNIQUE                                   | Business identifier          | FC-001                                                  |
| species_name                  | varchar(255) | Yes      | —                                        | Plant species                | Solanum lycopersicum                                    |
| common_name                   | varchar(255) | Yes      | —                                        | Common name                  | Tomato                                                  |
| desired_quantity              | integer      | Yes      | > 0                                      | Target seedling count        | 10000                                                   |
| recommended_initial_stock     | integer      | Yes      | > 0                                      | Starting plant count         | 500                                                     |
| estimated_weeks               | integer      | Yes      | > 0                                      | Production timeline (weeks)  | 16                                                      |
| confidence_lower_weeks        | integer      | Yes      | > 0                                      | Optimistic timeline          | 14                                                      |
| confidence_upper_weeks        | integer      | Yes      | > 0                                      | Pessimistic timeline         | 18                                                      |
| estimated_cycles              | integer      | Yes      | >= 1                                     | Number of propagation cycles | 4                                                       |
| estimated_survival_rate       | decimal(5,2) | Yes      | 0-100                                    | Expected survival %          | 92.00                                                   |
| estimated_multiplication_rate | decimal(5,2) | Yes      | >= 1                                     | Expected growth multiplier   | 8.50                                                    |
| weekly_milestones             | json         | No       | Array of {week, projected}               | Week-by-week projections     | [{"week":1,"projected":500},…]                          |
| resource_requirements         | json         | Yes      | {greenhouses, laborHours, estimatedCost} | Resource estimates           | {"greenhouses":2,"laborHours":240,"estimatedCost":3500} |
| propagation_method            | varchar(50)  | Yes      | —                                        | Production technique         | Grafting                                                |
| calculated_by                 | varchar(255) | Yes      | —                                        | Staff who created forecast   | Dr. Sarah Chen                                          |
| created_at                    | timestamp    | Yes      | Auto-set                                 | Forecast creation            | 2026-01-10 11:00:00                                     |
| updated_at                    | timestamp    | Yes      | Auto-update                              | Last update                  | 2026-01-10 11:00:00                                     |

**Relationships:**

- Optional reference to contracts (not enforced FK, used for planning)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_forecast_code ON production_forecasts(forecast_code)`
- Search: `INDEX idx_species_name ON production_forecasts(species_name)`
- Filter: `INDEX idx_propagation_method ON production_forecasts(propagation_method)`

**Business Rules:**

- Used for "what-if" scenarios and contract planning
- `weekly_milestones` JSON stores projected counts by week
- `resource_requirements` JSON stores calculated resource needs
- Historical record — not deleted even if contract changes

**JSON Schema Examples:**

```json
// weekly_milestones
[
  {"week": 1, "projected": 500},
  {"week": 2, "projected": 500},
  {"week": 4, "projected": 1000},
  {"week": 8, "projected": 4000},
  {"week": 12, "projected": 8000},
  {"week": 16, "projected": 10000}
]

// resource_requirements
{
  "greenhouses": 2,
  "laborHours": 240,
  "estimatedCost": 3500.00
}
````

---

## 4. INVENTORY MODULE

### 4.1 PLANT SPECIES

**Table Name:** `plant_species`

**Purpose:** Master catalog of plant species handled by the laboratory.

**Fields:**

| Field Name        | Type         | Required | Constraints             | Description                       | Example                                |
| ----------------- | ------------ | -------- | ----------------------- | --------------------------------- | -------------------------------------- |
| id                | bigint (PK)  | Yes      | Auto-increment          | Primary key                       | 1                                      |
| species_code      | varchar(20)  | Yes      | UNIQUE, Pattern: SP-### | Business identifier               | SP-001                                 |
| scientific_name   | varchar(255) | Yes      | UNIQUE                  | Binomial nomenclature             | Solanum lycopersicum                   |
| common_name       | varchar(255) | Yes      | —                       | Vernacular name                   | Tomato                                 |
| family            | varchar(100) | Yes      | —                       | Taxonomic family                  | Solanaceae                             |
| growth_type       | varchar(50)  | Yes      | —                       | Growth habit                      | Annual                                 |
| optimal_temp      | varchar(50)  | No       | —                       | Temperature range                 | 20–25°C                                |
| native_region     | varchar(255) | No       | —                       | Geographic origin                 | Western South America                  |
| light_requirement | varchar(255) | No       | —                       | Light needs                       | Full Sun (6-8 hrs)                     |
| water_requirement | varchar(255) | No       | —                       | Watering needs                    | Moderate — consistent moisture         |
| soil_type         | varchar(255) | No       | —                       | Soil preferences                  | Well-drained loamy soil, pH 6.0–6.8    |
| humidity          | varchar(50)  | No       | —                       | Humidity range                    | 50–70%                                 |
| propagation       | varchar(255) | No       | —                       | Propagation methods               | Seed, Stem Cuttings                    |
| maturity_days     | integer      | No       | > 0                     | Days to maturity                  | 70                                     |
| max_height        | varchar(50)  | No       | —                       | Maximum height                    | 1.5–3 m                                |
| description       | text         | No       | —                       | Detailed description              | Widely cultivated edible fruit…        |
| image_url         | varchar(512) | No       | Valid URL               | Species photo URL                 | https://example.com/image.jpg          |
| active_batches    | integer      | No       | Default: 0, >= 0        | Computed: count of active batches | 3                                      |
| total_plants      | integer      | No       | Default: 0, >= 0        | Computed: sum of batch quantities | 1500                                   |
| tags              | json         | No       | Array of strings        | Searchable tags                   | ["model organism","fruit development"] |
| created_by        | bigint (FK)  | No       | FK → users.id           | Creator user ID                   | 3                                      |
| updated_by        | bigint (FK)  | No       | FK → users.id           | Last modifier user ID             | 5                                      |
| created_at        | timestamp    | Yes      | Auto-set                | Creation timestamp                | 2025-08-01 10:00:00                    |
| updated_at        | timestamp    | Yes      | Auto-update             | Last update timestamp             | 2026-02-10 14:20:00                    |
| deleted_at        | timestamp    | No       | NULL when active        | Soft delete timestamp             | NULL                                   |

**Relationships:**

- **1:N** → `plant_batches` (one species has many batches)
- **1:N** → `contracts` (one species referenced in many contracts)
- **1:N** → `experiments` (one species used in many experiments)
- **1:1** → `species_growth_profiles` (aggregated statistics)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_species_code ON plant_species(species_code)`
- Unique: `UNIQUE INDEX idx_scientific_name ON plant_species(scientific_name)`
- Search: `INDEX idx_common_name ON plant_species(common_name)`
- Filter: `INDEX idx_family ON plant_species(family)`
- Soft Delete: `INDEX idx_deleted_at ON plant_species(deleted_at)` (partial)

**Business Rules:**

- `species_code` auto-generated (format: SP-###)
- `scientific_name` must be unique (taxonomic integrity)
- `active_batches` and `total_plants` updated via triggers
- Cannot delete if referenced by contracts or active batches

---

### 4.2 PLANT BATCHES

**Table Name:** `plant_batches`

**Purpose:** Track groups of plants being grown together.

**Fields:**

| Field Name            | Type         | Required | Constraints                            | Description              | Example                                                                  |
| --------------------- | ------------ | -------- | -------------------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| id                    | bigint (PK)  | Yes      | Auto-increment                         | Primary key              | 1                                                                        |
| batch_code            | varchar(20)  | Yes      | UNIQUE, Pattern: PB-###                | Business identifier      | PB-001                                                                   |
| species_id            | bigint (FK)  | Yes      | FK → plant_species.id                  | Plant species            | 5                                                                        |
| species_name          | varchar(255) | Yes      | Denormalized                           | Scientific name (cached) | Solanum lycopersicum                                                     |
| common_name           | varchar(255) | Yes      | Denormalized                           | Common name (cached)     | Tomato                                                                   |
| stage                 | enum         | Yes      | See enum_growth_stage                  | Growth stage             | Growing                                                                  |
| quantity              | integer      | Yes      | >= 0                                   | Current plant count      | 150                                                                      |
| location              | varchar(255) | Yes      | —                                      | Physical location        | Greenhouse A                                                             |
| status                | varchar(50)  | Yes      | —                                      | Batch health status      | Healthy                                                                  |
| start_date            | date         | Yes      | —                                      | Batch initiation date    | 2025-11-15                                                               |
| expected_harvest_date | date         | No       | > start_date                           | Projected harvest        | 2026-03-15                                                               |
| source_material       | varchar(255) | No       | —                                      | Seed/cutting source      | Seed lot TM-2024-A (certified)                                           |
| health_score          | integer      | No       | 0-100                                  | Overall health rating    | 92                                                                       |
| notes                 | text         | No       | —                                      | Batch notes              | Experimental cultivar trial                                              |
| image_url             | varchar(512) | No       | Valid URL                              | Batch photo URL          | https://example.com/batch.jpg                                            |
| assigned_to           | varchar(255) | No       | —                                      | Responsible staff        | Dr. Sarah Chen                                                           |
| growth_milestones     | json         | No       | Array of {date, event}                 | Key events               | [{"date":"2025-11-15","event":"Seeds sown"}]                             |
| environmental_log     | json         | No       | Array of {date, temp, humidity, light} | Environment tracking     | [{"date":"2026-02-05","temp":"23°C","humidity":"65%","light":"14h/10h"}] |
| created_by            | bigint (FK)  | No       | FK → users.id                          | Creator user ID          | 7                                                                        |
| updated_by            | bigint (FK)  | No       | FK → users.id                          | Last modifier user ID    | 7                                                                        |
| created_at            | timestamp    | Yes      | Auto-set                               | Creation timestamp       | 2025-11-15 08:00:00                                                      |
| updated_at            | timestamp    | Yes      | Auto-update                            | Last update timestamp    | 2026-02-14 10:15:00                                                      |
| deleted_at            | timestamp    | No       | NULL when active                       | Soft delete timestamp    | NULL                                                                     |

**Relationships:**

- **N:1** → `plant_species` (many batches belong to one species)
- **N:1 optional** → `experiments` (batch may be linked to experiment)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_batch_code ON plant_batches(batch_code)`
- Foreign Key: `INDEX idx_species_id ON plant_batches(species_id)`
- Filter: `INDEX idx_stage ON plant_batches(stage)`
- Filter: `INDEX idx_location ON plant_batches(location)`
- Date Range: `INDEX idx_start_date ON plant_batches(start_date)`
- Soft Delete: `INDEX idx_deleted_at ON plant_batches(deleted_at)` (partial)

**Business Rules:**

- `batch_code` auto-generated (format: PB-###)
- `stage` transitions: Seed → Seedling → Growing → Hardening → Ready → Harvested
- `quantity` updated when plants are moved/harvested/lost
- Triggers update parent species `total_plants` count

**JSON Schema Examples:**

```json
// growth_milestones
[
  {"date": "2025-11-15", "event": "Seeds sown in propagation trays"},
  {"date": "2025-11-25", "event": "Germination complete (95% rate)"},
  {"date": "2025-12-10", "event": "Transplanted to individual pots"}
]

// environmental_log
[
  {"date": "2026-02-05", "temp": "23°C", "humidity": "65%", "light": "14h/10h"},
  {"date": "2026-02-04", "temp": "22°C", "humidity": "62%", "light": "14h/10h"}
]
```

---

### 4.3 CHEMICALS

**Table Name:** `chemicals`

**Purpose:** Chemical inventory management with safety and expiry tracking.

**Fields:**

| Field Name         | Type         | Required | Constraints                                | Description            | Example                                                                                        |
| ------------------ | ------------ | -------- | ------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------- |
| id                 | bigint (PK)  | Yes      | Auto-increment                             | Primary key            | 1                                                                                              |
| chemical_code      | varchar(20)  | Yes      | UNIQUE, Pattern: CH-###                    | Business identifier    | CH-001                                                                                         |
| name               | varchar(255) | Yes      | Min 1 char                                 | Chemical name          | Sodium Hydroxide (NaOH)                                                                        |
| cas_number         | varchar(50)  | No       | CAS Registry format                        | CAS identifier         | 1310-73-2                                                                                      |
| quantity           | varchar(100) | Yes      | —                                          | Current stock          | 2.5L                                                                                           |
| concentration      | varchar(100) | No       | —                                          | Solution concentration | 10 M                                                                                           |
| molecular_weight   | varchar(50)  | No       | —                                          | Molecular weight       | 40.00 g/mol                                                                                    |
| purity             | varchar(50)  | No       | —                                          | Purity grade           | ≥ 98%                                                                                          |
| expiry_date        | date         | No       | —                                          | Expiration date        | 2026-02-12                                                                                     |
| days_until_expiry  | integer      | No       | Computed: expiry_date - TODAY              | Days remaining         | 7                                                                                              |
| hazard_level       | enum         | Yes      | See enum_hazard_level                      | Safety classification  | high                                                                                           |
| safety_class       | varchar(100) | No       | —                                          | Official safety class  | Corrosive (C)                                                                                  |
| ghs_codes          | json         | No       | Array of GHS codes                         | GHS pictograms         | ["GHS05","GHS07"]                                                                              |
| location           | varchar(255) | Yes      | —                                          | Storage location       | Cabinet A-1                                                                                    |
| storage_temp       | varchar(50)  | No       | —                                          | Storage temperature    | 15–25°C                                                                                        |
| storage_conditions | text         | No       | —                                          | Storage requirements   | Keep tightly sealed. Protect from moisture.                                                    |
| supplier           | varchar(255) | No       | —                                          | Supplier name          | Sigma-Aldrich                                                                                  |
| supplier_catalog   | varchar(100) | No       | —                                          | Catalog number         | S8045                                                                                          |
| lot_number         | varchar(100) | No       | —                                          | Lot/batch number       | MKCL9574                                                                                       |
| date_received      | date         | No       | —                                          | Receipt date           | 2025-03-15                                                                                     |
| sds_url            | varchar(512) | No       | Valid URL                                  | Safety Data Sheet link | https://example.com/sds/CH-001.pdf                                                             |
| notes              | text         | No       | —                                          | Additional remarks     | Corrosive — always use PPE                                                                     |
| image_url          | varchar(512) | No       | Valid URL                                  | Chemical photo         | https://example.com/chemical.jpg                                                               |
| usage_records      | json         | No       | Array of {date, user, amountUsed, purpose} | Usage history          | [{"date":"2026-02-01","user":"Dr. Chen","amountUsed":"50 mL","purpose":"Media pH adjustment"}] |
| created_by         | bigint (FK)  | No       | FK → users.id                              | Creator user ID        | 4                                                                                              |
| updated_by         | bigint (FK)  | No       | FK → users.id                              | Last modifier user ID  | 6                                                                                              |
| created_at         | timestamp    | Yes      | Auto-set                                   | Creation timestamp     | 2025-03-15 09:00:00                                                                            |
| updated_at         | timestamp    | Yes      | Auto-update                                | Last update timestamp  | 2026-02-14 11:00:00                                                                            |
| deleted_at         | timestamp    | No       | NULL when active                           | Soft delete timestamp  | NULL                                                                                           |

**Relationships:**

- Referenced by `inventory_transactions` for usage tracking
- Referenced by `experiments` (many-to-many via junction table if detailed tracking needed)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_chemical_code ON chemicals(chemical_code)`
- Search: `INDEX idx_name ON chemicals(name)`
- Search: `INDEX idx_cas_number ON chemicals(cas_number)`
- Filter: `INDEX idx_hazard_level ON chemicals(hazard_level)`
- Filter: `INDEX idx_location ON chemicals(location)`
- Alert: `INDEX idx_expiry_date ON chemicals(expiry_date)` (for expiry notifications)
- Soft Delete: `INDEX idx_deleted_at ON chemicals(deleted_at)` (partial)

**Business Rules:**

- `chemical_code` auto-generated (format: CH-###)
- `days_until_expiry` computed daily via scheduled job or trigger
- Low stock / expiry alerts sent when `days_until_expiry < 30` or `quantity` below threshold
- Cannot delete if usage records exist (audit compliance)

**JSON Schema Examples:**

```json
// ghs_codes
["GHS05", "GHS07"]

// usage_records
[
  {"date": "2026-02-01", "user": "Dr. Chen", "amountUsed": "50 mL", "purpose": "Media pH adjustment"},
  {"date": "2026-01-20", "user": "Emily R.", "amountUsed": "100 mL", "purpose": "Buffer preparation"}
]
```

---

### 4.4 EQUIPMENT

**Table Name:** `equipment`

**Purpose:** Laboratory equipment inventory and maintenance tracking.

**Fields:**

| Field Name          | Type          | Required | Constraints                                    | Description                | Example                                                                                                         |
| ------------------- | ------------- | -------- | ---------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| id                  | bigint (PK)   | Yes      | Auto-increment                                 | Primary key                | 1                                                                                                               |
| equipment_code      | varchar(20)   | Yes      | UNIQUE, Pattern: EQ-###                        | Business identifier        | EQ-001                                                                                                          |
| name                | varchar(255)  | Yes      | Min 1 char                                     | Equipment name             | Compound Microscope                                                                                             |
| category            | varchar(100)  | Yes      | —                                              | Equipment type             | Optics                                                                                                          |
| status              | enum          | Yes      | See enum_equipment_status                      | Equipment status           | Available                                                                                                       |
| location            | varchar(255)  | Yes      | —                                              | Physical location          | Lab Room 1                                                                                                      |
| last_maintenance    | date          | No       | —                                              | Last maintenance date      | 2026-01-15                                                                                                      |
| borrowed_by         | varchar(255)  | No       | —                                              | Current user (if borrowed) | Dr. Park                                                                                                        |
| return_date         | date          | No       | —                                              | Expected return date       | 2026-02-10                                                                                                      |
| issue               | varchar(255)  | No       | —                                              | Current issue/problem      | Rotor replacement                                                                                               |
| manufacturer        | varchar(255)  | No       | —                                              | Manufacturer name          | Olympus                                                                                                         |
| model               | varchar(100)  | No       | —                                              | Model number               | CX43                                                                                                            |
| serial_number       | varchar(100)  | No       | UNIQUE (if not NULL)                           | Serial number              | OLY-CX43-2023-0047                                                                                              |
| purchase_date       | date          | No       | —                                              | Date purchased             | 2023-03-15                                                                                                      |
| purchase_price      | decimal(10,2) | No       | >= 0                                           | Original cost (USD)        | 4200.00                                                                                                         |
| current_value       | decimal(10,2) | No       | >= 0                                           | Depreciated value (USD)    | 3150.00                                                                                                         |
| depreciation_rate   | varchar(100)  | No       | —                                              | Depreciation method        | 10% / year (straight-line)                                                                                      |
| warranty_expiry     | date          | No       | —                                              | Warranty end date          | 2026-03-15                                                                                                      |
| specifications      | json          | No       | Array of {label, value}                        | Technical specs            | [{"label":"Magnification","value":"4x / 10x / 40x / 100x"}]                                                     |
| maintenance_history | json          | No       | Array of {date, type, technician, notes, cost} | Service history            | [{"date":"2026-01-15","type":"Routine","technician":"Lab Services Inc.","notes":"Lens cleaning","cost":"$120"}] |
| usage_log           | json          | No       | Array of {date, user, duration, purpose}       | Usage tracking             | [{"date":"2026-02-05","user":"Emily R.","duration":"2h","purpose":"Cell morphology observation"}]               |
| notes               | text          | No       | —                                              | Additional remarks         | Primary teaching microscope                                                                                     |
| image_url           | varchar(512)  | No       | Valid URL                                      | Equipment photo            | https://example.com/equipment.jpg                                                                               |
| created_by          | bigint (FK)   | No       | FK → users.id                                  | Creator user ID            | 2                                                                                                               |
| updated_by          | bigint (FK)   | No       | FK → users.id                                  | Last modifier user ID      | 8                                                                                                               |
| created_at          | timestamp     | Yes      | Auto-set                                       | Creation timestamp         | 2023-03-15 10:00:00                                                                                             |
| updated_at          | timestamp     | Yes      | Auto-update                                    | Last update timestamp      | 2026-02-14 09:30:00                                                                                             |
| deleted_at          | timestamp     | No       | NULL when active                               | Soft delete timestamp      | NULL                                                                                                            |

**Relationships:**

- Referenced by `inventory_transactions` for borrowing/returning
- Optional: **N:1** → `users` (borrowed_by could be FK instead of varchar)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_equipment_code ON equipment(equipment_code)`
- Unique: `UNIQUE INDEX idx_serial_number ON equipment(serial_number)` (partial: WHERE serial_number IS NOT NULL)
- Filter: `INDEX idx_category ON equipment(category)`
- Filter: `INDEX idx_status ON equipment(status)`
- Filter: `INDEX idx_location ON equipment(location)`
- Alert: `INDEX idx_last_maintenance ON equipment(last_maintenance)` (for maintenance scheduling)
- Soft Delete: `INDEX idx_deleted_at ON equipment(deleted_at)` (partial)

**Business Rules:**

- `equipment_code` auto-generated (format: EQ-###)
- `status` values: Available, Borrowed, Maintenance, Retired
- When `status = 'Borrowed'`, `borrowed_by` and `return_date` required
- Maintenance alerts when `last_maintenance > 6 months ago`
- Cannot delete if currently borrowed

**JSON Schema Examples:**

```json
// specifications
[
  {"label": "Magnification", "value": "4x / 10x / 40x / 100x (oil)"},
  {"label": "Illumination", "value": "LED, adjustable"},
  {"label": "Weight", "value": "7.5 kg"}
]

// maintenance_history
[
  {"date": "2026-01-15", "type": "Routine", "technician": "Lab Services Inc.", "notes": "Lens cleaning, alignment check, LED bulb replaced", "cost": "$120"},
  {"date": "2025-07-10", "type": "Routine", "technician": "Lab Services Inc.", "notes": "Full optical cleaning and calibration", "cost": "$95"}
]

// usage_log
[
  {"date": "2026-02-05", "user": "Emily R.", "duration": "2h", "purpose": "Cell morphology observation"},
  {"date": "2026-02-03", "user": "Dr. Chen", "duration": "3h", "purpose": "Pollen viability assessment"}
]
```

---

### 4.5 INVENTORY TRANSACTIONS

**Table Name:** `inventory_transactions`

**Purpose:** Complete audit trail of all inventory movements (plants, chemicals, equipment).

**Fields:**

| Field Name       | Type         | Required | Constraints                 | Description                         | Example                       |
| ---------------- | ------------ | -------- | --------------------------- | ----------------------------------- | ----------------------------- |
| id               | bigint (PK)  | Yes      | Auto-increment              | Primary key                         | 1                             |
| transaction_code | varchar(20)  | Yes      | UNIQUE, Pattern: TX-###     | Business identifier                 | TX-001                        |
| timestamp        | timestamp    | Yes      | Auto-set                    | Transaction timestamp               | 2026-02-05 14:32:00           |
| user_id          | bigint (FK)  | Yes      | FK → users.id               | User who performed action           | 8                             |
| user_name        | varchar(255) | Yes      | Denormalized                | User display name (cached)          | Dr. Sarah Chen                |
| action           | enum         | Yes      | See enum_transaction_action | Type of action                      | Added                         |
| item_type        | enum         | Yes      | See enum_item_type          | Resource type                       | plant                         |
| item_id          | bigint       | No       | —                           | Reference to specific item          | 12                            |
| item_name        | varchar(255) | Yes      | —                           | Item description                    | Tomato Seedlings (Batch #127) |
| quantity_change  | varchar(100) | No       | —                           | Quantity change                     | +50                           |
| category         | varchar(100) | Yes      | —                           | Item category                       | Plants                        |
| location_from    | varchar(255) | No       | —                           | Source location                     | Greenhouse A                  |
| location_to      | varchar(255) | No       | —                           | Destination location                | Greenhouse B                  |
| notes            | text         | No       | —                           | Transaction notes                   | Moved for space optimization  |
| created_at       | timestamp    | Yes      | Auto-set                    | Record creation (same as timestamp) | 2026-02-05 14:32:00           |

**Relationships:**

- **N:1** → `users` (many transactions by one user)
- Polymorphic references to `plant_batches`, `chemicals`, `equipment` via `item_type` + `item_id`

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_transaction_code ON inventory_transactions(transaction_code)`
- Foreign Key: `INDEX idx_user_id ON inventory_transactions(user_id)`
- Filter: `INDEX idx_action ON inventory_transactions(action)`
- Filter: `INDEX idx_item_type ON inventory_transactions(item_type)`
- Date Range: `INDEX idx_timestamp ON inventory_transactions(timestamp)`
- Audit: `INDEX idx_item_type_id ON inventory_transactions(item_type, item_id)` (composite)

**Business Rules:**

- `transaction_code` auto-generated (format: TX-###)
- Immutable log — transactions never deleted or modified
- Automatically created by triggers when inventory changes
- `quantity_change` format examples: `+50`, `-500mL`, `—` (for equipment borrow/return)

---

## 5. RESEARCH MODULE

### 5.1 EXPERIMENTS

**Table Name:** `experiments`

**Purpose:** Research experiments tracking seedling propagation trials.

**Fields:**

| Field Name          | Type         | Required | Constraints                 | Description              | Example                                                  |
| ------------------- | ------------ | -------- | --------------------------- | ------------------------ | -------------------------------------------------------- |
| id                  | bigint (PK)  | Yes      | Auto-increment              | Primary key              | 1                                                        |
| experiment_code     | varchar(20)  | Yes      | UNIQUE, Pattern: EXP-###    | Business identifier      | EXP-001                                                  |
| species_id          | bigint (FK)  | Yes      | FK → plant_species.id       | Plant species studied    | 8                                                        |
| species_name        | varchar(255) | Yes      | Denormalized                | Scientific name (cached) | Solanum lycopersicum                                     |
| common_name         | varchar(255) | Yes      | Denormalized                | Common name (cached)     | Tomato                                                   |
| title               | varchar(255) | Yes      | Min 1 char                  | Experiment title         | Tomato Grafting Propagation Trial A                      |
| objective           | text         | Yes      | Min 1 char                  | Research objective       | Evaluate grafting success rates…                         |
| propagation_method  | enum         | Yes      | See enum_propagation_method | Propagation technique    | Grafting                                                 |
| growth_medium       | varchar(255) | Yes      | —                           | Growing medium           | Rockwool cubes + nutrient solution                       |
| environment         | varchar(255) | Yes      | —                           | Growth environment       | Greenhouse A                                             |
| initial_seed_count  | integer      | Yes      | > 0                         | Starting plant count     | 200                                                      |
| current_count       | integer      | Yes      | >= 0                        | Current living count     | 1850                                                     |
| start_date          | date         | Yes      | —                           | Experiment start date    | 2025-09-01                                               |
| expected_end_date   | date         | Yes      | > start_date                | Projected end date       | 2026-03-22                                               |
| actual_end_date     | date         | No       | >= start_date               | Actual completion date   | 2026-03-20                                               |
| status              | enum         | Yes      | See enum_experiment_status  | Experiment status        | Active                                                   |
| final_yield         | integer      | No       | >= 0                        | Final seedling count     | 1850                                                     |
| avg_survival_rate   | decimal(5,2) | No       | 0-100                       | Average survival %       | 92.50                                                    |
| multiplication_rate | decimal(5,2) | No       | >= 1                        | Growth multiplier        | 9.25                                                     |
| conclusion          | text         | No       | —                           | Final conclusions        | High success rate. Grafting viable for commercial scale. |
| assigned_to         | json         | Yes      | Array of strings            | Team members             | ["Dr. Sarah Chen","James Wong"]                          |
| tags                | json         | No       | Array of strings            | Searchable tags          | ["grafting","commercial","high-yield"]                   |
| image_url           | varchar(512) | No       | Valid URL                   | Experiment photo         | https://example.com/experiment.jpg                       |
| created_by          | bigint (FK)  | No       | FK → users.id               | Creator user ID          | 10                                                       |
| updated_by          | bigint (FK)  | No       | FK → users.id               | Last modifier user ID    | 10                                                       |
| created_at          | timestamp    | Yes      | Auto-set                    | Creation timestamp       | 2025-08-28 10:00:00                                      |
| updated_at          | timestamp    | Yes      | Auto-update                 | Last update timestamp    | 2026-03-20 15:30:00                                      |
| deleted_at          | timestamp    | No       | NULL when active            | Soft delete timestamp    | NULL                                                     |

**Relationships:**

- **N:1** → `plant_species` (many experiments reference one species)
- **1:N** → `growth_logs` (one experiment has many growth log entries)
- **1:N optional** → `lab_notebooks` (experiment may have notebook entries)
- **N:1 optional** → `protocols` (experiment may follow a protocol)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_experiment_code ON experiments(experiment_code)`
- Foreign Key: `INDEX idx_species_id ON experiments(species_id)`
- Filter: `INDEX idx_status ON experiments(status)`
- Filter: `INDEX idx_propagation_method ON experiments(propagation_method)`
- Search: `INDEX idx_title ON experiments(title)`
- Date Range: `INDEX idx_start_date ON experiments(start_date)`
- Soft Delete: `INDEX idx_deleted_at ON experiments(deleted_at)` (partial)

**Business Rules:**

- `experiment_code` auto-generated (format: EXP-###)
- `status` transitions: Planning → Active → Paused ⇄ Active → Completed/Failed
- `final_yield`, `avg_survival_rate`, `multiplication_rate` calculated from growth_logs
- `conclusion` required when status = Completed/Failed
- Cannot delete if growth logs exist

---

### 5.2 GROWTH LOGS

**Table Name:** `growth_logs`

**Purpose:** Weekly tracking of seedling growth during experiments.

**Fields:**

| Field Name          | Type         | Required | Constraints                            | Description                | Example                                             |
| ------------------- | ------------ | -------- | -------------------------------------- | -------------------------- | --------------------------------------------------- |
| id                  | bigint (PK)  | Yes      | Auto-increment                         | Primary key                | 1                                                   |
| log_code            | varchar(20)  | Yes      | UNIQUE, Pattern: GL-###                | Business identifier        | GL-001                                              |
| experiment_id       | bigint (FK)  | Yes      | FK → experiments.id, ON DELETE CASCADE | Parent experiment          | 5                                                   |
| week_number         | integer      | Yes      | > 0                                    | Week of experiment         | 3                                                   |
| log_date            | date         | Yes      | —                                      | Observation date           | 2025-09-22                                          |
| seedling_count      | integer      | Yes      | >= 0                                   | Total seedlings            | 180                                                 |
| alive_count         | integer      | Yes      | >= 0, <= seedling_count                | Living seedlings           | 178                                                 |
| dead_count          | integer      | Yes      | >= 0                                   | Deceased this week         | 2                                                   |
| new_propagations    | integer      | Yes      | >= 0                                   | New propagations this week | 0                                                   |
| survival_rate_pct   | decimal(5,2) | Yes      | 0-100                                  | Survival percentage        | 98.90                                               |
| multiplication_rate | decimal(5,2) | Yes      | >= 1                                   | Growth multiplier          | 1.00                                                |
| health_score        | integer      | Yes      | 1-10                                   | Overall health rating      | 9                                                   |
| avg_height_cm       | decimal(5,2) | No       | >= 0                                   | Average height (cm)        | 9.20                                                |
| growth_stage        | enum         | Yes      | See enum_growth_stage                  | Current stage              | Seedling                                            |
| observations        | text         | Yes      | Min 1 char                             | Detailed observations      | True leaves emerging. Strong root development.      |
| photo_urls          | json         | No       | Array of URLs                          | Photo documentation        | ["https://example.com/week3-1.jpg"]                 |
| environmental_data  | json         | No       | {temp, humidity, light, ph}            | Environmental conditions   | {"temp":22,"humidity":55,"light":"16h/8h","ph":6.5} |
| recorded_by         | varchar(255) | Yes      | —                                      | Observer name              | Dr. Sarah Chen                                      |
| created_at          | timestamp    | Yes      | Auto-set                               | Log creation               | 2025-09-22 14:00:00                                 |
| updated_at          | timestamp    | Yes      | Auto-update                            | Last update                | 2025-09-22 14:00:00                                 |

**Relationships:**

- **N:1** → `experiments` (many logs belong to one experiment)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_log_code ON growth_logs(log_code)`
- Foreign Key: `INDEX idx_experiment_id ON growth_logs(experiment_id)`
- Composite Unique: `UNIQUE INDEX idx_exp_week ON growth_logs(experiment_id, week_number)` (one log per week per experiment)
- Filter: `INDEX idx_growth_stage ON growth_logs(growth_stage)`
- Date Range: `INDEX idx_log_date ON growth_logs(log_date)`

**Business Rules:**

- `log_code` auto-generated (format: GL-###)
- Cascading delete when experiment deleted
- `survival_rate_pct = (alive_count / seedling_count) * 100`
- `multiplication_rate` calculated from propagation cycles
- One log entry per week per experiment (enforced by unique index)

**JSON Schema Examples:**

```json
// photo_urls
["https://example.com/week3-1.jpg", "https://example.com/week3-2.jpg"]

// environmental_data
{
  "temp": 22,
  "humidity": 55,
  "light": "16h/8h",
  "ph": 6.5
}
```

---

### 5.3 PROTOCOLS

**Table Name:** `protocols`

**Purpose:** Standard Operating Procedures (SOPs) for lab procedures.

**Fields:**

| Field Name         | Type         | Required | Constraints              | Description                     | Example                            |
| ------------------ | ------------ | -------- | ------------------------ | ------------------------------- | ---------------------------------- |
| id                 | bigint (PK)  | Yes      | Auto-increment           | Primary key                     | 1                                  |
| protocol_code      | varchar(20)  | Yes      | UNIQUE, Pattern: PRT-### | Business identifier             | PRT-001                            |
| title              | varchar(255) | Yes      | Min 1 char               | Protocol title                  | Tomato Grafting Standard Procedure |
| description        | text         | Yes      | Min 1 char               | Detailed description            | Step-by-step grafting procedure…   |
| category           | varchar(100) | Yes      | —                        | Protocol category               | Propagation Techniques             |
| version            | varchar(20)  | Yes      | —                        | Version number                  | 2.1                                |
| status             | enum         | Yes      | See enum_protocol_status | Protocol status                 | Active                             |
| author             | varchar(255) | Yes      | —                        | Protocol author                 | Dr. Sarah Chen                     |
| last_updated       | date         | Yes      | —                        | Last revision date              | 2025-12-15                         |
| steps              | integer      | Yes      | > 0                      | Number of steps                 | 12                                 |
| linked_experiments | integer      | No       | Default: 0, >= 0         | Count of experiments using this | 8                                  |
| tags               | json         | No       | Array of strings         | Searchable tags                 | ["grafting","SOP","tomato"]        |
| created_by         | bigint (FK)  | No       | FK → users.id            | Creator user ID                 | 9                                  |
| updated_by         | bigint (FK)  | No       | FK → users.id            | Last modifier user ID           | 9                                  |
| created_at         | timestamp    | Yes      | Auto-set                 | Creation timestamp              | 2024-05-10 11:00:00                |
| updated_at         | timestamp    | Yes      | Auto-update              | Last update timestamp           | 2025-12-15 09:30:00                |
| deleted_at         | timestamp    | No       | NULL when active         | Soft delete timestamp           | NULL                               |

**Relationships:**

- Referenced by `experiments` (many-to-many via junction table if detailed tracking needed)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_protocol_code ON protocols(protocol_code)`
- Search: `INDEX idx_title ON protocols(title)`
- Filter: `INDEX idx_category ON protocols(category)`
- Filter: `INDEX idx_status ON protocols(status)`
- Soft Delete: `INDEX idx_deleted_at ON protocols(deleted_at)` (partial)

**Business Rules:**

- `protocol_code` auto-generated (format: PRT-###)
- `version` incremented when protocol updated
- `status` values: Draft, Active, Archived
- Active protocols referenced by experiments; cannot delete if `linked_experiments > 0`
- `last_updated` auto-set on modification

---

### 5.4 LAB NOTEBOOKS

**Table Name:** `lab_notebooks`

**Purpose:** Digital lab notebook entries for documenting research observations.

**Fields:**

| Field Name      | Type         | Required | Constraints             | Description              | Example                                |
| --------------- | ------------ | -------- | ----------------------- | ------------------------ | -------------------------------------- |
| id              | bigint (PK)  | Yes      | Auto-increment          | Primary key              | 1                                      |
| notebook_code   | varchar(20)  | Yes      | UNIQUE, Pattern: NB-### | Business identifier      | NB-001                                 |
| title           | varchar(255) | Yes      | Min 1 char              | Entry title              | Tomato Grafting Observations — Week 3  |
| content         | text         | Yes      | Min 1 char              | Entry content            | Observed significant callus formation… |
| author          | varchar(255) | Yes      | —                       | Entry author             | Dr. Sarah Chen                         |
| experiment_id   | bigint (FK)  | No       | FK → experiments.id     | Linked experiment        | 12                                     |
| experiment_code | varchar(20)  | No       | Denormalized            | Experiment code (cached) | EXP-001                                |
| tags            | json         | No       | Array of strings        | Searchable tags          | ["grafting","observations","week-3"]   |
| is_locked       | boolean      | Yes      | Default: false          | Entry locked (finalized) | true                                   |
| created_by      | bigint (FK)  | No       | FK → users.id           | Creator user ID          | 7                                      |
| updated_by      | bigint (FK)  | No       | FK → users.id           | Last modifier user ID    | 7                                      |
| created_at      | timestamp    | Yes      | Auto-set                | Entry creation           | 2025-01-15 14:30:00                    |
| updated_at      | timestamp    | Yes      | Auto-update             | Last modification        | 2025-01-15 15:10:00                    |
| deleted_at      | timestamp    | No       | NULL when active        | Soft delete timestamp    | NULL                                   |

**Relationships:**

- **N:1 optional** → `experiments` (notebook entry may be linked to experiment)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_notebook_code ON lab_notebooks(notebook_code)`
- Foreign Key: `INDEX idx_experiment_id ON lab_notebooks(experiment_id)`
- Search: `FULLTEXT INDEX idx_title_content ON lab_notebooks(title, content)` (PostgreSQL: GIN index with pg_trgm)
- Filter: `INDEX idx_author ON lab_notebooks(author)`
- Filter: `INDEX idx_is_locked ON lab_notebooks(is_locked)`
- Date Range: `INDEX idx_created_at ON lab_notebooks(created_at)`
- Soft Delete: `INDEX idx_deleted_at ON lab_notebooks(deleted_at)` (partial)

**Business Rules:**

- `notebook_code` auto-generated (format: NB-###)
- When `is_locked = true`, entry cannot be modified (immutable scientific record)
- Entries without `experiment_id` are general lab notes
- Full-text search enabled on `title` and `content`

---

### 5.5 SPECIES GROWTH PROFILES

**Table Name:** `species_growth_profiles`

**Purpose:** Aggregated statistics per species from all completed experiments.

**Fields:**

| Field Name                | Type         | Required | Constraints                   | Description                          | Example                              |
| ------------------------- | ------------ | -------- | ----------------------------- | ------------------------------------ | ------------------------------------ |
| id                        | bigint (PK)  | Yes      | Auto-increment                | Primary key                          | 1                                    |
| species_id                | bigint (FK)  | Yes      | UNIQUE, FK → plant_species.id | Plant species                        | 5                                    |
| species_name              | varchar(255) | Yes      | Denormalized                  | Scientific name (cached)             | Solanum lycopersicum                 |
| common_name               | varchar(255) | Yes      | Denormalized                  | Common name (cached)                 | Tomato                               |
| total_experiments         | integer      | Yes      | >= 0                          | All-time experiment count            | 15                                   |
| completed_experiments     | integer      | Yes      | >= 0                          | Successfully completed count         | 12                                   |
| avg_multiplication_rate   | decimal(5,2) | Yes      | >= 1                          | Average growth multiplier            | 8.75                                 |
| avg_survival_rate         | decimal(5,2) | Yes      | 0-100                         | Average survival %                   | 91.20                                |
| std_dev_survival          | decimal(5,2) | No       | >= 0                          | Standard deviation (survival)        | 3.45                                 |
| avg_cycle_duration_weeks  | integer      | Yes      | > 0                           | Average experiment duration          | 14                                   |
| best_multiplication_rate  | decimal(5,2) | Yes      | >= 1                          | Best multiplier achieved             | 12.50                                |
| worst_multiplication_rate | decimal(5,2) | Yes      | >= 1                          | Worst multiplier                     | 6.20                                 |
| avg_yield_per_initial     | decimal(5,2) | Yes      | >= 0                          | Avg final_yield / initial_seed_count | 8.75                                 |
| propagation_methods       | json         | Yes      | Array of enums                | Methods used historically            | ["Seed","Grafting","Tissue Culture"] |
| last_calculated           | timestamp    | Yes      | Auto-update                   | Last aggregation run                 | 2026-02-14 02:00:00                  |
| updated_at                | timestamp    | Yes      | Auto-update                   | Last update timestamp                | 2026-02-14 02:00:00                  |

**Relationships:**

- **1:1** → `plant_species` (one profile per species)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique Foreign Key: `UNIQUE INDEX idx_species_id ON species_growth_profiles(species_id)`
- Sort: `INDEX idx_avg_multiplication_rate ON species_growth_profiles(avg_multiplication_rate)`
- Sort: `INDEX idx_avg_survival_rate ON species_growth_profiles(avg_survival_rate)`

**Business Rules:**

- Materialized view / denormalized aggregate table
- Populated by scheduled job (daily/weekly) from `experiments` and `growth_logs`
- Read-only from application perspective
- `propagation_methods` derived from unique methods across experiments
- Used for analytics and dashboards

---

## 6. SHARED / SUPPORT MODULE

### 6.1 USERS

**Table Name:** `users`

**Purpose:** Manage lab personnel accounts, roles, and access control.

**Fields:**

| Field Name  | Type         | Required | Constraints            | Description             | Example                   |
| ----------- | ------------ | -------- | ---------------------- | ----------------------- | ------------------------- |
| id          | bigint (PK)  | Yes      | Auto-increment         | Primary key             | 1                         |
| user_code   | varchar(20)  | Yes      | UNIQUE, Pattern: U-### | Business identifier     | U-001                     |
| name        | varchar(255) | Yes      | Min 1 char             | Full name               | Dr. Sarah Chen            |
| email       | varchar(255) | Yes      | UNIQUE, Valid email    | Institutional email     | sarah.chen@university.edu |
| role        | varchar(100) | Yes      | —                      | Job role / title        | Lab Manager               |
| department  | varchar(100) | Yes      | —                      | Department affiliation  | Agricultural Sciences     |
| status      | varchar(20)  | Yes      | 'Active' or 'Inactive' | Account status          | Active                    |
| last_active | timestamp    | No       | —                      | Last activity timestamp | 2026-02-14 10:28:00       |
| created_at  | timestamp    | Yes      | Auto-set on insert     | Account creation        | 2025-01-01 09:00:00       |
| updated_at  | timestamp    | Yes      | Auto-update on change  | Last update             | 2026-02-14 10:28:00       |
| deleted_at  | timestamp    | No       | NULL when active       | Soft delete timestamp   | NULL                      |

**Relationships:**

- Referenced by `created_by` / `updated_by` FK columns across all domain tables
- **1:N** → `inventory_transactions` (one user performs many transactions)

**Indexes:**

- Primary: `PRIMARY KEY (id)`
- Unique: `UNIQUE INDEX idx_user_code ON users(user_code)`
- Unique: `UNIQUE INDEX idx_user_email ON users(email)`
- Filter: `INDEX idx_user_role ON users(role)`
- Filter: `INDEX idx_user_department ON users(department)`
- Filter: `INDEX idx_user_status ON users(status)`
- Soft Delete: `INDEX idx_users_deleted_at ON users(deleted_at)` (partial: WHERE deleted_at IS NULL)

**Business Rules:**

- `user_code` auto-generated (format: U-###)
- `email` must be unique (institutional email)
- Deactivated users (`status = 'Inactive'`) cannot perform actions but records are retained
- Cannot hard delete users referenced by audit columns (`created_by`, `updated_by`)

**Predefined Roles:**

| Role               | Permissions                                     |
| ------------------ | ----------------------------------------------- |
| Lab Manager        | Full CRUD on all entities, user management      |
| Professor          | Full CRUD on research, read access to inventory |
| Research Assistant | CRUD on assigned experiments, read inventory    |
| Lab Technician     | CRUD on inventory, read research                |
| PhD Student        | CRUD on assigned experiments, limited inventory |

---

## 7. ENUM DEFINITIONS

All enum types with their allowed values:

### 7.1 Business Module Enums

```sql
-- Client Type
CREATE TYPE enum_client_type AS ENUM (
  'Farm Owner',
  'Investor',
  'Government',
  'NGO',
  'Research Partner'
);

-- Contract Status
CREATE TYPE enum_contract_status AS ENUM (
  'Draft',
  'Sent',
  'Signed',
  'In Production',
  'Ready',
  'Delivered',
  'Cancelled'
);

-- Payment Status
CREATE TYPE enum_payment_status AS ENUM (
  'Pending',
  'Received',
  'Overdue',
  'Cancelled'
);

-- Payment Type
CREATE TYPE enum_payment_type AS ENUM (
  'Deposit',
  'Milestone',
  'Final',
  'Refund'
);

-- Milestone Status
CREATE TYPE enum_milestone_status AS ENUM (
  'Pending',
  'On Track',
  'At Risk',
  'Completed',
  'Missed'
);
```

### 7.2 Inventory Module Enums

```sql
-- Hazard Level (Chemicals)
CREATE TYPE enum_hazard_level AS ENUM (
  'low',
  'medium',
  'high'
);

-- Equipment Status
CREATE TYPE enum_equipment_status AS ENUM (
  'Available',
  'Borrowed',
  'Maintenance',
  'Retired'
);

-- Transaction Action
CREATE TYPE enum_transaction_action AS ENUM (
  'Added',
  'Consumed',
  'Disposed',
  'Borrowed',
  'Returned',
  'Transferred',
  'Harvested',
  'Lost'
);

-- Item Type (for polymorphic inventory_transactions)
CREATE TYPE enum_item_type AS ENUM (
  'plant',
  'chemical',
  'equipment',
  'other'
);
```

### 7.3 Research Module Enums

```sql
-- Experiment Status
CREATE TYPE enum_experiment_status AS ENUM (
  'Planning',
  'Active',
  'Paused',
  'Completed',
  'Failed'
);

-- Growth Stage
CREATE TYPE enum_growth_stage AS ENUM (
  'Germination',
  'Seedling',
  'Vegetative',
  'Hardening',
  'Ready'
);

-- Propagation Method
CREATE TYPE enum_propagation_method AS ENUM (
  'Seed',
  'Cutting',
  'Grafting',
  'Tissue Culture'
);

-- Protocol Status
CREATE TYPE enum_protocol_status AS ENUM (
  'Draft',
  'Active',
  'Archived'
);
```

---

## 8. INDEXING STRATEGY

### 8.1 Index Categories

**Primary Keys:**

- Auto-incrementing `BIGINT` on all tables for performance and scalability
- Clustered indexes on primary keys

**Unique Constraints:**

- Business identifiers (e.g., `client_code`, `contract_code`) for application-level lookups
- Natural keys (e.g., `scientific_name` in `plant_species`)

**Foreign Keys:**

- Indexes on all FK columns for join performance
- Consider composite indexes for multi-column FK lookups

**Search/Filter:**

- Single-column indexes on frequently filtered fields (`status`, `category`, `location`)
- Full-text search indexes on `title`, `content`, `description` fields (PostgreSQL: GIN with pg_trgm)
- Partial indexes on soft-delete columns: `WHERE deleted_at IS NULL`

**Date Ranges:**

- Indexes on date columns used for range queries (`created_at`, `expiry_date`, `delivery_deadline`)
- Consider B-tree indexes for date columns

**Composite Indexes:**

- `(experiment_id, week_number)` on `growth_logs` for uniqueness
- `(item_type, item_id)` on `inventory_transactions` for polymorphic lookups

### 8.2 Performance Recommendations

- **Avoid over-indexing:** Monitor query performance; remove unused indexes
- **Use covering indexes** for frequently accessed column combinations
- **Index selectivity:** Prioritize high-cardinality columns
- **Analyze query plans** regularly with `EXPLAIN ANALYZE`
- **Rebuild indexes** periodically on high-write tables

---

## 9. DATA INTEGRITY RULES

### 9.1 Foreign Key Constraints

**Cascading Deletes:**

- `growth_logs.experiment_id` → `experiments.id` (ON DELETE CASCADE)
- `contract_milestones.contract_id` → `contracts.id` (ON DELETE CASCADE)

**Restrict Deletes:**

- `contracts.client_id` → `clients.id` (ON DELETE RESTRICT)
- `experiments.species_id` → `plant_species.id` (ON DELETE RESTRICT)
- Prevents orphan records and maintains referential integrity

### 9.2 Check Constraints

```sql
-- Quantity constraints
ALTER TABLE contracts
  ADD CONSTRAINT chk_quantity_ordered CHECK (quantity_ordered > 0),
  ADD CONSTRAINT chk_quantity_delivered CHECK (quantity_delivered >= 0 AND quantity_delivered <= quantity_ordered);

-- Price constraints
ALTER TABLE contracts
  ADD CONSTRAINT chk_unit_price CHECK (unit_price >= 0);

ALTER TABLE payments
  ADD CONSTRAINT chk_amount CHECK (amount > 0);

-- Date constraints
ALTER TABLE contracts
  ADD CONSTRAINT chk_delivery_deadline CHECK (delivery_deadline > contract_date);

-- Percentage constraints
ALTER TABLE contracts
  ADD CONSTRAINT chk_progress_pct CHECK (progress_pct >= 0 AND progress_pct <= 100);

ALTER TABLE growth_logs
  ADD CONSTRAINT chk_survival_rate CHECK (survival_rate_pct >= 0 AND survival_rate_pct <= 100);

-- Health score constraints
ALTER TABLE growth_logs
  ADD CONSTRAINT chk_health_score CHECK (health_score >= 1 AND health_score <= 10);
```

### 9.3 Triggers

**Auto-Update Computed Fields:**

```sql
-- Update clients.total_contracts and clients.total_value when contracts change
CREATE TRIGGER update_client_totals
  AFTER INSERT OR UPDATE OR DELETE ON contracts
  FOR EACH ROW EXECUTE FUNCTION recalculate_client_totals();

-- Update plant_species.total_plants when plant_batches change
CREATE TRIGGER update_species_totals
  AFTER INSERT OR UPDATE OR DELETE ON plant_batches
  FOR EACH ROW EXECUTE FUNCTION recalculate_species_totals();
```

**Audit Trail Triggers:**

```sql
-- Auto-populate created_at, updated_at, created_by, updated_by
CREATE TRIGGER set_audit_fields
  BEFORE INSERT OR UPDATE ON {table_name}
  FOR EACH ROW EXECUTE FUNCTION set_audit_timestamps();
```

**Inventory Transaction Logging:**

```sql
-- Auto-create transaction log when inventory changes
CREATE TRIGGER log_inventory_change
  AFTER INSERT OR UPDATE OR DELETE ON plant_batches
  FOR EACH ROW EXECUTE FUNCTION create_transaction_log();
```

### 9.4 Soft Delete Implementation

All core tables include `deleted_at` timestamp column:

- `NULL` = active record
- `NOT NULL` = soft-deleted record
- Partial indexes: `WHERE deleted_at IS NULL` for performance
- Application queries should always filter `deleted_at IS NULL` unless explicitly requesting deleted records

---

## 10. API PAYLOAD EXAMPLES

### 10.1 CREATE Operations

**Create Client:**

```json
POST /api/clients
{
  "companyName": "Green Valley Farms",
  "contactName": "John Smith",
  "email": "john@greenvalley.com",
  "phone": "+1-555-0123",
  "address": "123 Farm Road, CA 90210",
  "clientType": "Farm Owner",
  "notes": "Long-term partner since 2020"
}

Response:
{
  "id": 15,
  "clientCode": "CLT-015",
  "companyName": "Green Valley Farms",
  "contactName": "John Smith",
  "email": "john@greenvalley.com",
  "phone": "+1-555-0123",
  "address": "123 Farm Road, CA 90210",
  "clientType": "Farm Owner",
  "notes": "Long-term partner since 2020",
  "totalContracts": 0,
  "totalValue": 0.00,
  "createdAt": "2026-02-14T10:30:00Z",
  "updatedAt": "2026-02-14T10:30:00Z"
}
```

**Create Contract:**

```json
POST /api/contracts
{
  "clientId": 15,
  "speciesId": 8,
  "speciesName": "Solanum lycopersicum",
  "commonName": "Tomato",
  "quantityOrdered": 5000,
  "unitPrice": 2.50,
  "currency": "USD",
  "contractDate": "2026-02-14",
  "deliveryDeadline": "2026-05-15",
  "terms": "Payment on delivery. 30-day warranty.",
  "managedBy": "Dr. Sarah Chen"
}

Response:
{
  "id": 42,
  "contractCode": "CON-042",
  "clientId": 15,
  "clientName": "Green Valley Farms",
  "speciesId": 8,
  "speciesName": "Solanum lycopersicum",
  "commonName": "Tomato",
  "quantityOrdered": 5000,
  "quantityDelivered": 0,
  "unitPrice": 2.50,
  "totalValue": 12500.00,
  "currency": "USD",
  "contractDate": "2026-02-14",
  "deliveryDeadline": "2026-05-15",
  "actualDeliveryDate": null,
  "status": "Draft",
  "terms": "Payment on delivery. 30-day warranty.",
  "managedBy": "Dr. Sarah Chen",
  "progressPct": 0.00,
  "createdAt": "2026-02-14T11:00:00Z",
  "updatedAt": "2026-02-14T11:00:00Z"
}
```

**Create Experiment:**

```json
POST /api/experiments
{
  "speciesId": 8,
  "title": "Tomato Stem Cutting Trial C",
  "objective": "Test rapid propagation via stem cuttings",
  "propagationMethod": "Cutting",
  "growthMedium": "Peat-vermiculite mix",
  "environment": "Greenhouse B",
  "initialSeedCount": 200,
  "startDate": "2026-02-15",
  "expectedEndDate": "2026-06-01",
  "assignedTo": ["Dr. Sarah Chen", "Emily Rodriguez"],
  "tags": ["cutting", "rapid-propagation", "commercial"]
}

Response:
{
  "id": 23,
  "experimentCode": "EXP-023",
  "speciesId": 8,
  "speciesName": "Solanum lycopersicum",
  "commonName": "Tomato",
  "title": "Tomato Stem Cutting Trial C",
  "objective": "Test rapid propagation via stem cuttings",
  "propagationMethod": "Cutting",
  "growthMedium": "Peat-vermiculite mix",
  "environment": "Greenhouse B",
  "initialSeedCount": 200,
  "currentCount": 200,
  "startDate": "2026-02-15",
  "expectedEndDate": "2026-06-01",
  "actualEndDate": null,
  "status": "Planning",
  "finalYield": null,
  "avgSurvivalRate": null,
  "multiplicationRate": null,
  "conclusion": null,
  "assignedTo": ["Dr. Sarah Chen", "Emily Rodriguez"],
  "tags": ["cutting", "rapid-propagation", "commercial"],
  "imageUrl": null,
  "createdAt": "2026-02-14T12:00:00Z",
  "updatedAt": "2026-02-14T12:00:00Z"
}
```

### 10.2 UPDATE Operations

**Update Contract Status:**

```json
PATCH /api/contracts/42
{
  "status": "Signed",
  "quantityDelivered": 1200,
  "progressPct": 24.00
}

Response:
{
  "id": 42,
  "contractCode": "CON-042",
  "status": "Signed",
  "quantityDelivered": 1200,
  "progressPct": 24.00,
  "updatedAt": "2026-02-20T14:30:00Z"
}
```

**Add Growth Log Entry:**

```json
POST /api/experiments/23/growth-logs
{
  "weekNumber": 2,
  "logDate": "2026-03-01",
  "seedlingCount": 195,
  "aliveCount": 192,
  "deadCount": 3,
  "newPropagations": 0,
  "survivalRatePct": 98.46,
  "multiplicationRate": 1.00,
  "healthScore": 9,
  "avgHeightCm": 8.5,
  "growthStage": "Seedling",
  "observations": "Excellent root development. Minimal losses.",
  "recordedBy": "Dr. Sarah Chen",
  "environmentalData": {
    "temp": 23,
    "humidity": 60,
    "light": "14h/10h",
    "ph": 6.2
  }
}

Response:
{
  "id": 567,
  "logCode": "GL-567",
  "experimentId": 23,
  "weekNumber": 2,
  "logDate": "2026-03-01",
  "seedlingCount": 195,
  "aliveCount": 192,
  "deadCount": 3,
  "newPropagations": 0,
  "survivalRatePct": 98.46,
  "multiplicationRate": 1.00,
  "healthScore": 9,
  "avgHeightCm": 8.5,
  "growthStage": "Seedling",
  "observations": "Excellent root development. Minimal losses.",
  "photoUrls": null,
  "environmentalData": {
    "temp": 23,
    "humidity": 60,
    "light": "14h/10h",
    "ph": 6.2
  },
  "recordedBy": "Dr. Sarah Chen",
  "createdAt": "2026-03-01T15:00:00Z",
  "updatedAt": "2026-03-01T15:00:00Z"
}
```

---

## 11. SCALABILITY CONSIDERATIONS

### 11.1 Data Volume Projections

**Expected Growth (5 years):**

- **Business Module:**
  - Clients: ~500 records
  - Contracts: ~2,000 records
  - Contract Milestones: ~10,000 records
  - Payments: ~8,000 records
  - Production Forecasts: ~500 records
- **Inventory Module:**
  - Plant Species: ~100 records
  - Plant Batches: ~5,000 records
  - Chemicals: ~500 records
  - Equipment: ~300 records
  - Inventory Transactions: ~100,000 records
- **Research Module:**
  - Experiments: ~1,000 records
  - Growth Logs: ~50,000 records (50 logs/experiment avg)
  - Protocols: ~100 records
  - Lab Notebooks: ~10,000 records
  - Species Growth Profiles: ~100 records (1 per species)
- **Shared/Support:**
  - Users: ~50 records

**Total Database Size (estimated):** ~2-5 GB

### 11.2 Performance Optimization

**Query Optimization:**

- Use query result caching (Redis) for dashboard aggregates
- Implement pagination for all list endpoints (limit 50-100 records/page)
- Background jobs for heavy aggregations (e.g., `species_growth_profiles`)

**Read Replicas:**

- Consider read replicas for reporting/analytics queries
- Separate OLTP (transactional) from OLAP (analytical) workloads

**Archival Strategy:**

- Archive completed experiments older than 5 years to cold storage
- Maintain summary statistics in `species_growth_profiles`
- Keep financial records (contracts, payments) indefinitely (regulatory compliance)

### 11.3 Database Sharding (Future)

**Sharding Strategy (if needed at scale):**

- Horizontal partitioning by date (e.g., experiments by year)
- Geographic sharding (if multi-lab deployment)
- Functional sharding (business vs inventory vs research schemas)

### 11.4 Backup & Disaster Recovery

**Backup Schedule:**

- Full backup: Daily (off-peak hours)
- Incremental backup: Hourly
- Transaction log backup: Every 15 minutes
- Retention: 30 days online, 7 years offline (regulatory)

**Point-in-Time Recovery:**

- Enable PITR with transaction log retention
- Test restore procedures quarterly

---

## 12. APPLICATION LAYER FIELD MAPPING

This section documents how TypeScript/JavaScript field names in the application layer map to SQL column names.

### 12.1 Naming Convention

The application uses **camelCase** for all identifiers in TypeScript interfaces and JSON APIs. The database uses **snake_case** for column names. The API layer performs automatic transformation between the two conventions.

### 12.2 Business Identifier Fields

All entities have both a numeric primary key (`id`) and a human-readable business code (`*_code`):

| SQL Columns                              | TypeScript Field                       | Example SQL Value                  | Example TS Value                           |
| ---------------------------------------- | -------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `id` (bigint), `client_code` (varchar)   | `id` (string)                          | `id=15`, `client_code='CLT-015'`   | `id: "CLT-015"`                            |
| `id` (bigint), `contract_code` (varchar) | `id` (string), `contractCode` (string) | `id=42`, `contract_code='CON-042'` | `id: "CON-042"`, `contractCode: "CON-042"` |

**Application Convention:** The TS `id` field corresponds to the SQL `*_code` column (not the numeric PK). When inserting/updating via API, the application references entities by their code (e.g., `"CLT-001"`), and the database resolves this to the numeric PK via a JOIN or subquery.

### 12.3 Timestamp Fields

| SQL Column   | TypeScript Field | SQL Type    | TS Type          | Format                   |
| ------------ | ---------------- | ----------- | ---------------- | ------------------------ |
| `created_at` | `createdAt`      | `timestamp` | `string`         | ISO 8601 (UTC)           |
| `updated_at` | `updatedAt`      | `timestamp` | `string`         | ISO 8601 (UTC)           |
| `deleted_at` | `deletedAt`      | `timestamp` | `string \| null` | ISO 8601 (UTC) or `null` |

**Example:** SQL `2026-02-14 10:30:00` → TS `"2026-02-14T10:30:00Z"`

### 12.4 Chemical-Specific Mappings

The `chemicals` table has several shortened field names in the application layer:

| SQL Column          | TypeScript Field | Notes                            |
| ------------------- | ---------------- | -------------------------------- |
| `cas_number`        | `cas`            | Shortened for conciseness        |
| `expiry_date`       | `expiry`         | Date fields use simplified names |
| `days_until_expiry` | `daysLeft`       | Clearer semantic meaning         |
| `hazard_level`      | `hazard`         | Enum values unchanged            |
| `ghs_codes`         | `ghs`            | JSON array of GHS codes          |

**TS Type:** `ghs: string[]` (e.g., `["GHS05", "GHS07"]`)  
**SQL Type:** `ghs_codes JSONB` (e.g., `["GHS05", "GHS07"]`)

### 12.5 Batch/Stock Mappings

Plant batches (stock) use different field names in list vs detail views:

| SQL Column     | List Item Field (`StockItem`) | Detail Field (`BatchDetail`) |
| -------------- | ----------------------------- | ---------------------------- |
| `species_name` | `species`                     | `species`                    |
| `common_name`  | `commonName`                  | `commonName`                 |
| `stage`        | `stage`                       | `stage`                      |
| `species_id`   | _(not present)_               | `speciesId`                  |

Detail views include FK references (`speciesId`) while list views omit them for performance.

### 12.6 Audit Fields

Infrastructure audit fields are present in SQL but typically **not exposed** in TypeScript client interfaces:

| SQL Column   | Present in TS Interface? | Notes                                         |
| ------------ | ------------------------ | --------------------------------------------- |
| `created_by` | ❌ No                    | Server-side only (set from session context)   |
| `updated_by` | ❌ No                    | Server-side only                              |
| `deleted_at` | ❌ No                    | Handled by soft-delete flag                   |
| `is_active`  | ❌ No                    | Implicitly determined by `deleted_at IS NULL` |

These fields are managed by the backend and not directly manipulated by the frontend.

### 12.7 Denormalized Display Fields

Several tables cache denormalized fields for performance:

| Table           | Denormalized Field             | Source                                            | Maintenance               |
| --------------- | ------------------------------ | ------------------------------------------------- | ------------------------- |
| `contracts`     | `client_name`                  | `clients.company_name`                            | Trigger on clients update |
| `contracts`     | `species_name`, `common_name`  | `plant_species.*`                                 | Trigger on species update |
| `payments`      | `contract_code`, `client_name` | `contracts.contract_code`, `clients.company_name` | Immutable (set on insert) |
| `plant_batches` | `species_name`, `common_name`  | `plant_species.*`                                 | Trigger on species update |
| `experiments`   | `species_name`, `common_name`  | `plant_species.*`                                 | Trigger on species update |

**Consistency Rule:** All denormalized fields are kept in sync via database triggers. Application code should **not** manually update these fields.

### 12.8 Polymorphic Transactions

`inventory_transactions` uses polymorphic associations:

| SQL Columns                    | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `item_type` (`enum_item_type`) | Discriminator: `'plant'`, `'chemical'`, `'equipment'`, `'other'` |
| `item_id` (bigint, nullable)   | Foreign key to specific table (resolved dynamically)             |
| `item_name` (varchar)          | Cached display name (denormalized)                               |

**Application Pattern:**

```typescript
{
  itemType: "plant",
  itemId: 42,  // FK to plant_batches.id
  itemName: "Tomato Seedlings (Batch #127)"
}
```

### 12.9 Decimal/Currency Fields

Financial and measurement fields use different representations:

| SQL Type        | TS Type              | Display Format   | Example                   |
| --------------- | -------------------- | ---------------- | ------------------------- |
| `decimal(12,2)` | `number`             | Numeric value    | `12500.00` → `12500`      |
| `decimal(10,2)` | `string` (equipment) | Formatted string | `4200.00` → `"$4,200.00"` |

**Equipment Exception:** `purchasePrice` and `currentValue` are transmitted as formatted strings (including currency symbol) for UI display convenience.

### 12.10 Complete Field Name Reference

**Common patterns:**

- SQL `snake_case` → TS `camelCase`
- SQL `*_id` → TS `*Id`
- SQL `*_at` → TS `*At`
- SQL `*_pct` → TS `*Pct`
- SQL `avg_*` → TS `avg*`

**Exceptions to auto-conversion:**

| SQL                         | TS         | Reason                     |
| --------------------------- | ---------- | -------------------------- |
| `cas_number`                | `cas`      | Abbreviated                |
| `expiry_date`               | `expiry`   | Simplified                 |
| `days_until_expiry`         | `daysLeft` | Semantic clarity           |
| `hazard_level`              | `hazard`   | Simplified                 |
| `ghs_codes`                 | `ghs`      | Abbreviated                |
| `species_name` (in batches) | `species`  | Context-specific shorthand |

---

## APPENDIX A: Migration Scripts

**Initial Schema Creation (PostgreSQL):**

```sql
-- Create enums first (see Section 7)
-- Then create tables in dependency order:

-- 1. Independent tables (no FK dependencies)
CREATE TABLE plant_species (...);
CREATE TABLE protocols (...);
CREATE TABLE users (...); -- Shared/Support module

-- 2. Dependent tables (Business)
CREATE TABLE clients (...);
CREATE TABLE contracts (...); -- FK to clients, plant_species
CREATE TABLE contract_milestones (...); -- FK to contracts
CREATE TABLE payments (...); -- FK to contracts
CREATE TABLE production_forecasts (...);

-- 3. Dependent tables (Inventory)
CREATE TABLE plant_batches (...); -- FK to plant_species
CREATE TABLE chemicals (...);
CREATE TABLE equipment (...);
CREATE TABLE inventory_transactions (...); -- FK to users

-- 4. Dependent tables (Research)
CREATE TABLE experiments (...); -- FK to plant_species
CREATE TABLE growth_logs (...); -- FK to experiments
CREATE TABLE lab_notebooks (...); -- FK to experiments
CREATE TABLE species_growth_profiles (...); -- FK to plant_species

-- 5. Add triggers for denormalized fields
-- Update client_name in contracts when clients.company_name changes
-- Update species_name/common_name in contracts, batches, experiments when plant_species changes
-- Update computed aggregates (total_contracts, total_value, active_batches, total_plants)

-- 6. Add other indexes, constraints for performance
```

---

## APPENDIX B: Database Normalization Verification

**3NF Compliance:**

- ✅ All tables have atomic values (1NF)
- ✅ All non-key attributes fully depend on primary key (2NF)
- ✅ No transitive dependencies (3NF)

**Denormalization Exceptions (intentional for performance):**

- `contract_code`, `client_name` in `payments` (reporting performance)
- `client_name`, `species_name`, `common_name` in `contracts` (avoid joins)
- `species_name`, `common_name` in `experiments`, `plant_batches`, `species_growth_profiles` (avoid joins)
- Computed fields: `total_contracts`, `total_value`, `progress_pct` (dashboard performance)

All denormalized fields updated via triggers to maintain consistency.

---

## APPENDIX C: Security Considerations

**SQL Injection Prevention:**

- Use parameterized queries exclusively
- Validate all user inputs at application layer
- Escape special characters in dynamic SQL (avoid if possible)

**Access Control:**

- Implement row-level security (RLS) for multi-tenant scenarios
- Role-based access control (RBAC): admin, lab_manager, researcher, viewer
- Audit all data modifications via `created_by`, `updated_by`

**Data Encryption:**

- Encrypt sensitive fields at rest (e.g., `email`, `phone` via application-level encryption)
- Use TLS for database connections
- Hash any authentication credentials (bcrypt, Argon2)

**PII Protection:**

- Client contact information subject to data privacy regulations (GDPR, CCPA)
- Implement data retention policies
- Provide mechanisms for data export and deletion (right to be forgotten)

---

## DOCUMENT REVISION HISTORY

| Version | Date       | Author                       | Changes                                                                                                                                                                                                                                                                              |
| ------- | ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 2026-02-14 | Principal Software Architect | Initial database documentation based on UI reverse-engineering                                                                                                                                                                                                                       |
| 1.1     | 2026-02-14 | Principal Software Architect | Added Users table (Section 6). Added `client_name` to contracts table. Fixed protocol code pattern (PRT-### not PROT-###). Updated entity count (16 tables). Added Application Layer Field Mapping (Section 12). Renumbered sections 7–11. Updated ER diagram and migration scripts. |

---

**END OF DATABASE DOCUMENTATION**
