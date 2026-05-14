# 🧬 BioLab Compass — System Design Document
### Research & Seedling Production Management Platform

**Version:** 1.0  
**Date:** February 7, 2026  
**Author:** CTO / Solutions Architect  
**Status:** Strategic Planning — Ready for Implementation  

---

## Table of Contents

1. [Executive Technical Summary](#1-executive-technical-summary)
2. [Current System Analysis](#2-current-system-analysis)
3. [Recommended Tech Stack](#3-recommended-tech-stack)
4. [Core Features & User Flow](#4-core-features--user-flow)
5. [Database Schema Design](#5-database-schema-design)
6. [System Architecture](#6-system-architecture)
7. [Security & Compliance](#7-security--compliance)
8. [Development Roadmap](#8-development-roadmap)
9. [Appendix — Existing Codebase Audit](#9-appendix--existing-codebase-audit)

---

## 1. Executive Technical Summary

### 1.1 Business Problem

A Bioengineering laboratory conducts large-scale seedling propagation experiments across multiple crop species. Currently, there is **no systematic way** to:

- Track seedling growth data week-over-week (e.g., Week 1: 200 seeds → Week 2: 100 seedlings → 200 seedlings → Week 3: 200 → 400 seedlings)
- Calculate production capacity based on historical experimental data
- Provide **accurate delivery timelines** to investors/farm owners (e.g., "10,000 avocado seedlings in X weeks")
- Generate contracts backed by data-driven production forecasts
- Monitor experiment progress against commitments in real-time

### 1.2 How Technology Solves This

The **BioLab Compass** platform extends the existing Inventory Management system (already successfully built) with two new modules:

| Module | Purpose |
|--------|---------|
| **🔬 Research Module** | Track experiments, record weekly seedling counts, manage protocols, and build a historical dataset of growth rates per species |
| **💼 Business Module** | Use accumulated research data to power a **Seedling Production Calculator** — accurately forecasting how long it takes to produce N seedlings of species X, generating quotes, managing contracts, and tracking delivery |

### 1.3 The Data Flywheel

```
┌─────────────────────────────────────────────────────────────────────┐
│                        THE DATA FLYWHEEL                            │
│                                                                     │
│   🧪 EXPERIMENTS          📊 GROWTH DATA         🧮 CALCULATOR     │
│   ┌─────────────┐       ┌──────────────┐       ┌──────────────┐    │
│   │ Conduct      │──────▶│ Weekly counts │──────▶│ Production   │    │
│   │ seedling     │       │ survival %    │       │ forecasting  │    │
│   │ experiments  │       │ growth rates  │       │ engine       │    │
│   └─────────────┘       └──────────────┘       └──────┬───────┘    │
│                                                        │            │
│   📋 CONTRACTS           💰 BUSINESS            ◀──────┘            │
│   ┌─────────────┐       ┌──────────────┐                            │
│   │ Delivery     │◀──────│ Client quotes │                           │
│   │ tracking     │       │ & agreements  │                           │
│   └─────────────┘       └──────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.4 Critical Technical Challenges

| Challenge | Severity | Mitigation |
|-----------|----------|------------|
| **Data Accuracy for Forecasting** | 🔴 Critical | Need sufficient experimental data (minimum 3 cycles per species) before forecasting engine is reliable |
| **Real-time Experiment Tracking** | 🟡 Medium | Weekly data entry with reminders; consider mobile-friendly quick entry |
| **Production Calculation Algorithm** | 🔴 Critical | Statistical model accounting for survival rates, propagation ratios, seasonal variation, and facility capacity |
| **Contract Compliance Monitoring** | 🟡 Medium | Automated alerts when actual production deviates from forecasted timeline |
| **No Backend Currently Exists** | 🔴 Critical | All data is mock/hardcoded. Need to build API + database layer before production use |
| **Authentication Not Implemented** | 🟡 Medium | Multi-user access with role-based permissions required for lab vs. business users |

---

## 2. Current System Analysis

### 2.1 What's Already Built ✅

The **Inventory Management** module is fully functional with mock data:

| Feature | Status | Details |
|---------|--------|---------|
| Dashboard | ✅ Complete | 4 KPI cards, 15 analytics widgets across 3 tabs (Overview / Analytics / AI Insights) |
| Plant Species | ✅ Complete | CRUD, search, filter by family, grid/list views, image upload (7 species) |
| Plant Batches | ✅ Complete | CRUD, linked to species, stage tracking, filter by species (7 batches) |
| Chemicals | ✅ Complete | CRUD, hazard tracking, expiry alerts, GHS classification (7 chemicals) |
| Equipment | ✅ Complete | CRUD, maintenance history, booking/borrowing, depreciation (8 items) |
| Transactions | ✅ Complete | Transaction feed and history |
| Users | ✅ Complete | Role-based user list (Lab Manager, Senior Researcher, Research Assistant, Lab Technician) |
| Detail Pages | ✅ Complete | 4 rich detail views with hero images, timelines, environmental logs |

### 2.2 What's Defined But Not Built ⚠️

| Feature | Status | Details |
|---------|--------|---------|
| Research Section | ⚠️ Placeholder | Sidebar nav defined (6 items), routes defined, only "Coming Soon" page exists |
| Business Section | ⚠️ Placeholder | Sidebar nav defined (7 items), routes defined, only placeholder page exists |
| Safety Section | ❌ Empty | Directory exists, no files |
| Settings Section | ❌ Empty | Directory exists, no files |

### 2.3 Existing Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 18.3.1 |
| **Language** | TypeScript | (strict mode off) |
| **Build Tool** | Vite | 7.x |
| **Styling** | Tailwind CSS 3 + shadcn/ui (40+ components) | Latest |
| **Design System** | Neo-Brutalist (0px radius, hard shadows, Space Grotesk font) | Custom |
| **Routing** | React Router DOM | 6.30.1 |
| **State** | Local React state (no global store) | — |
| **Charts** | Recharts | 2.15.4 |
| **Forms** | React Hook Form + Zod validation | 7.61.1 / 3.25 |
| **Package Manager** | Bun | Latest |
| **Async Data** | @tanstack/react-query (installed, unused) | 5.83.0 |

### 2.4 Existing Data Models

The following TypeScript interfaces are already defined in `src/data/mockDetailData.ts`:

- **`SpeciesDetail`** — 20+ fields including propagation method, maturity days, growth conditions
- **`BatchDetail`** — Growth milestones, environmental logs, health scores, assigned researcher
- **`ChemicalDetail`** — CAS numbers, GHS classification, SDS links, usage records
- **`EquipmentDetail`** — Maintenance history, usage logs, depreciation, specifications

### 2.5 Existing Navigation Architecture

```
TopNav (horizontal): [ Inventory | Research | Business ]
                           │          │          │
Sidebar (vertical):    ┌───┘          │          └───┐
                       │              │              │
                  ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
                  │Dashboard │   │Overview  │   │Overview  │
                  │Species   │   │Experiments│  │Revenue   │
                  │Batches   │   │Protocols │   │Supply    │
                  │Chemicals │   │Notebooks │   │Sales     │
                  │Equipment │   │Analysis  │   │Partners  │
                  │Transacts │   │Samples   │   │Costs     │
                  │Users     │   │          │   │Market    │
                  └──────────┘   └──────────┘   └──────────┘
                    ✅ BUILT      ⚠️ PLANNED     ⚠️ PLANNED
```

---

## 3. Recommended Tech Stack

### 3.1 Frontend — Keep React + TypeScript + Vite ✅

**Decision: Extend the existing stack. Do NOT rewrite.**

| Choice | Rationale |
|--------|-----------|
| **React 18** | Already built with 7 complete pages, 40+ components, and a polished design system. Rewriting in another framework would waste 3+ months of work. |
| **TypeScript** | Type safety is critical for the production calculation engine. **Action:** Enable `strict: true` in tsconfig. |
| **Vite 7** | Fastest dev server, HMR in <50ms, already configured. |
| **shadcn/ui** | 40+ components already installed. Consistent neo-brutalist theme. |
| **Recharts** | Already used for 6 dashboard charts. Perfect for growth trend visualizations. |
| **React Hook Form + Zod** | Already installed. Critical for experiment data entry forms with validation. |
| **@tanstack/react-query** | Already installed but unused. **Activate it** for server state management when backend is connected. |

**New Additions for Research Module:**

| Package | Purpose |
|---------|---------|
| **`@tanstack/react-table`** | Sortable, filterable data tables for experiment logs and production records |
| **`date-fns`** ✅ Already installed | Week-over-week date calculations for growth tracking |
| **`mathjs` or custom** | Statistical functions for production forecasting (mean, std dev, regression) |
| **`react-to-print`** | Print/export contracts and production reports as PDF |
| **`zustand`** | Lightweight global state for cross-module data (experiment → calculator) |

### 3.2 Backend — Supabase (BaaS) for MVP → Node.js/Express Migration for Scale

**Phase 1 (MVP): Supabase**

| Choice | Rationale |
|--------|-----------|
| **Supabase** | PostgreSQL under the hood (relational data is critical for species→experiment→batch relationships). Built-in auth, real-time subscriptions, REST + GraphQL APIs. **Zero backend code needed for MVP.** |
| **Why not Firebase?** | Data is heavily relational (experiments link to species, batches, researchers, contracts). Firebase's NoSQL would require complex denormalization. |
| **Why not custom Node.js?** | For an MVP by a small team, writing a custom backend adds 2-3 months. Supabase gets us to market in weeks. |

**Phase 2 (Scale): Migrate to Custom Backend**

| Choice | Rationale |
|--------|-----------|
| **Node.js + Express + Prisma ORM** | When production calculation engine needs custom business logic, ML model integration, and complex aggregation queries. |
| **PostgreSQL (keep)** | Supabase uses PostgreSQL — zero migration cost for the database. |

### 3.3 Database — PostgreSQL (via Supabase)

| Choice | Rationale |
|--------|-----------|
| **PostgreSQL** | Complex relational data: Species → Experiments → Growth Logs → Production Forecasts → Contracts. Needs JOINs, aggregation, window functions. |
| **Why not MongoDB?** | The seedling tracking data is inherently tabular (week_number, seedling_count, survival_rate). Relational queries like "average growth rate for avocado across all experiments" are trivial in SQL, painful in NoSQL. |
| **Why not SQLite?** | Multi-user concurrent access required (researchers + lab manager + business team). |

### 3.4 Infrastructure

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Hosting (Frontend)** | Vercel | Free tier, instant deploys from Git, edge CDN, perfect for Vite/React |
| **Backend/DB** | Supabase Cloud | Managed PostgreSQL, 500MB free tier, auto-backups |
| **File Storage** | Supabase Storage | Experiment photos, protocol PDFs, contract documents |
| **CI/CD** | GitHub Actions | Automated testing + deployment on push to main |
| **Monitoring** | Sentry (free tier) | Error tracking and performance monitoring |

---

## 4. Core Features & User Flow

### 4.1 Must-Have Features (MVP)

#### Feature 1: 🧪 Experiment Management
> Create, track, and manage seedling propagation experiments

- Create experiment linked to a crop species
- Define experiment parameters (initial seed count, propagation method, growth medium, environment)
- Set experiment timeline (start date, expected duration in weeks)
- Assign researcher(s) to experiment
- Link to chemicals and equipment from inventory

#### Feature 2: 📊 Weekly Growth Tracking
> Record seedling counts week-by-week to build production dataset

- Weekly data entry: seedling count, survival count, health score, notes, photos
- Automatic calculation: survival rate %, multiplication rate, weekly growth delta
- Visual growth curve chart (line chart with projected vs actual)
- Alert when growth deviates from expected trajectory by >15%
- Bulk entry support (enter data for multiple experiments at once)

#### Feature 3: 🧮 Seedling Production Calculator
> The core business tool — forecast production timelines from historical data

- Select crop species → system pulls all historical experiment data
- Input: desired seedling quantity (e.g., 10,000 avocado seedlings)
- System calculates:
  - Average multiplication rate per cycle (from all experiments for that species)
  - Average survival rate per stage
  - Expected number of propagation cycles needed
  - Total calendar time (weeks) accounting for species growth cycle
  - Required initial seed/mother plant stock
  - Required facility capacity (greenhouse space, growth chambers)
  - Confidence interval (e.g., "95% confident: 12-16 weeks")
- Output: **Production Plan** with week-by-week projected milestones

#### Feature 4: 📋 Contract & Order Management
> Convert production plans into client contracts

- Create client profile (investor / farm owner)
- Generate quote from production calculator results
- Contract creation: species, quantity, delivery date, price, terms
- Contract status tracking: Draft → Sent → Signed → In Production → Delivered
- Link contract to active experiments/batches
- Payment tracking (deposit, milestones, final payment)
- Automated alerts: approaching deadline, production ahead/behind schedule

#### Feature 5: 📈 Research Dashboard & Analytics
> Visualize experimental data and production performance

- Species performance comparison (which species has highest multiplication rate?)
- Researcher productivity metrics
- Experiment success/failure rates
- Production forecast accuracy (predicted vs. actual delivery)
- Seasonal trend analysis
- Resource utilization (greenhouse capacity, chemical consumption per experiment)

### 4.2 Happy Path User Journey

#### Journey A: Researcher Recording Experiment Data

```
Step 1: LOGIN
├── Researcher "Dr. Sarah Chen" logs in
├── Sees Research Dashboard with active experiments
│
Step 2: CREATE EXPERIMENT
├── Click "New Experiment" button
├── Select species: "Persea americana" (Avocado)
├── Set parameters: 200 initial seeds, Grafting method
├── Set timeline: Start Feb 10, 2026 — Est. 16 weeks
├── Assign to self + Lab Tech "James"
├── System creates Experiment #EXP-047
│
Step 3: WEEKLY DATA ENTRY (Every Monday)
├── Week 1: Navigate to EXP-047 → "Add Weekly Log"
│   ├── Seedlings alive: 185 (survival: 92.5%)
│   ├── Health score: 8/10
│   ├── Photo upload (optional)
│   └── Notes: "Strong germination, 15 failed due to moisture"
├── Week 2: Seedlings alive: 180, propagated → 360 new cuttings
├── Week 3: 360 → 340 (survival 94.4%)
├── Week 4: 340 → 680 (second propagation cycle)
│   └── Growth chart auto-updates with each entry
│
Step 4: EXPERIMENT COMPLETION
├── After 16 weeks: Mark experiment as "Completed"
├── Final yield: 2,400 seedlings from 200 initial seeds
├── System calculates: 12x multiplication, 91.3% avg survival
└── Data feeds into species growth profile
```

#### Journey B: Business Manager Fulfilling a Client Order

```
Step 1: CLIENT INQUIRY
├── Farm owner contacts: "I need 10,000 avocado seedlings"
│
Step 2: PRODUCTION CALCULATOR
├── Navigate to Business → Production Calculator
├── Select: Avocado (Persea americana)
├── Input: 10,000 seedlings desired
├── System analyzes 5 past avocado experiments:
│   ├── Avg multiplication rate: 12x per full cycle
│   ├── Avg survival rate: 91.3%
│   ├── Avg cycle duration: 16 weeks
│   ├── Facility capacity: 3 greenhouses available
│   └── Calculation:
│       ├── Need ~910 mother plants (10,000 ÷ 12 × 1/0.913)
│       ├── Estimated time: 18 weeks (1 cycle + buffer)
│       ├── Confidence: 90% within 16-20 weeks
│       └── Required: 2 greenhouses, specific chemicals
├── Generate Production Plan PDF
│
Step 3: CREATE CONTRACT
├── Click "Create Contract from Plan"
├── Client: "Green Valley Farms"
├── Quantity: 10,000 avocado seedlings
├── Delivery: June 15, 2026 (18 weeks from now)
├── Price: $25,000 (based on per-seedling pricing)
├── Payment: 40% deposit, 30% at midpoint, 30% on delivery
├── Both parties sign → Status: "In Production"
│
Step 4: PRODUCTION TRACKING
├── System auto-creates experiment batches linked to contract
├── Weekly progress: Actual vs. Predicted production curve
├── Dashboard shows: "Contract #CON-012: 67% complete, ON TRACK ✅"
│
Step 5: DELIVERY
├── 10,000 seedlings ready on June 12 (3 days early!)
├── Mark contract: "Delivered"
├── Final payment collected
└── Client satisfaction recorded
```

---

## 5. Database Schema Design

### 5.1 Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                             │
│                                                                     │
│   Users ──────┬──── Experiments ──── Growth Logs                    │
│               │         │                                           │
│               │         ├──── Experiment Resources                  │
│               │         │         │                                 │
│   Species ────┘─────────┘    Chemicals / Equipment (from inventory)│
│      │                                                              │
│      └──── Species Growth Profiles (aggregated stats)              │
│                    │                                                │
│              Production Forecasts                                   │
│                    │                                                │
│              Contracts ──── Contract Milestones                     │
│                 │                                                   │
│              Clients ──── Payments                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Tables & Relationships

### 5.3 Mermaid.js ERD

```mermaid
erDiagram
    %% ══════════════════════════════════════════════
    %% CORE ENTITIES (Existing Inventory + New)
    %% ══════════════════════════════════════════════

    USERS {
        uuid id PK
        string email UK
        string full_name
        string role "Lab Manager | Senior Researcher | Research Assistant | Lab Technician | Business Manager"
        string avatar_url
        timestamp created_at
        timestamp last_login
    }

    SPECIES {
        uuid id PK
        string scientific_name UK
        string common_name
        string family
        string growth_type "Annual | Perennial"
        string optimal_temp
        string propagation_methods "Seed | Cutting | Grafting | Tissue Culture"
        int maturity_days
        string light_requirement
        string water_requirement
        string soil_type
        text description
        string image_url
        string[] tags
        timestamp created_at
    }

    CHEMICALS {
        uuid id PK
        string name
        string cas_number
        float quantity
        string unit
        date expiry
        string hazard_class
        string location
        string storage_conditions
        timestamp created_at
    }

    EQUIPMENT {
        uuid id PK
        string name
        string category
        string status "Available | In Use | Maintenance | Retired"
        string location
        date last_maintenance
        timestamp created_at
    }

    %% ══════════════════════════════════════════════
    %% RESEARCH MODULE (NEW)
    %% ══════════════════════════════════════════════

    EXPERIMENTS {
        uuid id PK
        string experiment_code UK "EXP-001"
        uuid species_id FK
        uuid created_by FK
        string title
        text objective
        string propagation_method "Seed | Cutting | Grafting | Tissue Culture"
        string growth_medium
        string environment "Greenhouse A | Growth Chamber 1 | Field Plot"
        int initial_seed_count
        date start_date
        date expected_end_date
        date actual_end_date
        string status "Planning | Active | Paused | Completed | Failed"
        int final_yield
        float avg_survival_rate
        float multiplication_rate
        text conclusion
        string[] tags
        timestamp created_at
        timestamp updated_at
    }

    EXPERIMENT_RESEARCHERS {
        uuid id PK
        uuid experiment_id FK
        uuid user_id FK
        string role "Lead | Assistant"
        timestamp assigned_at
    }

    EXPERIMENT_RESOURCES {
        uuid id PK
        uuid experiment_id FK
        uuid chemical_id FK "nullable"
        uuid equipment_id FK "nullable"
        string resource_type "Chemical | Equipment"
        float quantity_used
        string unit
        text notes
        timestamp used_at
    }

    GROWTH_LOGS {
        uuid id PK
        uuid experiment_id FK
        uuid recorded_by FK
        int week_number
        date log_date
        int seedling_count
        int alive_count
        int dead_count
        int new_propagations "seedlings created this week"
        float survival_rate_pct "auto-calculated"
        float multiplication_rate "auto-calculated"
        int health_score "1-10"
        float avg_height_cm
        float avg_root_length_cm
        string growth_stage "Germination | Seedling | Vegetative | Hardening | Ready"
        text observations
        string[] photo_urls
        jsonb environmental_data "temp, humidity, light, pH"
        timestamp created_at
    }

    %% ══════════════════════════════════════════════
    %% ANALYTICS / FORECASTING (NEW)
    %% ══════════════════════════════════════════════

    SPECIES_GROWTH_PROFILES {
        uuid id PK
        uuid species_id FK UK
        int total_experiments
        float avg_multiplication_rate
        float avg_survival_rate
        float std_dev_survival
        float avg_cycle_duration_weeks
        float best_multiplication_rate
        float worst_multiplication_rate
        jsonb propagation_method_stats "per-method averages"
        jsonb seasonal_factors "spring: 1.1, winter: 0.85"
        timestamp last_calculated
    }

    PRODUCTION_FORECASTS {
        uuid id PK
        uuid species_id FK
        uuid calculated_by FK
        int desired_quantity
        int recommended_initial_stock
        float estimated_weeks
        float confidence_lower_weeks
        float confidence_upper_weeks
        int estimated_cycles
        float estimated_survival_rate
        jsonb weekly_milestones "week-by-week projected counts"
        jsonb resource_requirements "greenhouses, chemicals, labor"
        string propagation_method_used
        timestamp created_at
    }

    %% ══════════════════════════════════════════════
    %% BUSINESS MODULE (NEW)
    %% ══════════════════════════════════════════════

    CLIENTS {
        uuid id PK
        string company_name
        string contact_name
        string email
        string phone
        string address
        string client_type "Farm Owner | Investor | Government | NGO | Research Partner"
        text notes
        timestamp created_at
    }

    CONTRACTS {
        uuid id PK
        string contract_code UK "CON-001"
        uuid client_id FK
        uuid species_id FK
        uuid forecast_id FK "nullable — links to production forecast"
        uuid managed_by FK
        int quantity_ordered
        int quantity_delivered
        float unit_price
        float total_value
        string currency "USD | THB | EUR"
        date contract_date
        date delivery_deadline
        date actual_delivery_date
        string status "Draft | Sent | Signed | In Production | Ready | Delivered | Cancelled"
        text terms
        text special_requirements
        string[] document_urls
        timestamp created_at
        timestamp updated_at
    }

    CONTRACT_MILESTONES {
        uuid id PK
        uuid contract_id FK
        string milestone_name "e.g. Germination Complete, First Propagation, Hardening Phase"
        date target_date
        date actual_date
        int projected_count
        int actual_count
        string status "Pending | On Track | At Risk | Completed | Missed"
        text notes
        timestamp created_at
    }

    PAYMENTS {
        uuid id PK
        uuid contract_id FK
        float amount
        string currency
        string payment_type "Deposit | Milestone | Final | Refund"
        string payment_method "Bank Transfer | Check | Cash | Online"
        date payment_date
        date due_date
        string status "Pending | Received | Overdue | Cancelled"
        string reference_number
        text notes
        timestamp created_at
    }

    %% ══════════════════════════════════════════════
    %% RELATIONSHIPS
    %% ══════════════════════════════════════════════

    USERS ||--o{ EXPERIMENTS : "creates"
    USERS ||--o{ EXPERIMENT_RESEARCHERS : "participates in"
    USERS ||--o{ GROWTH_LOGS : "records"
    USERS ||--o{ PRODUCTION_FORECASTS : "calculates"
    USERS ||--o{ CONTRACTS : "manages"

    SPECIES ||--o{ EXPERIMENTS : "studied in"
    SPECIES ||--|| SPECIES_GROWTH_PROFILES : "has profile"
    SPECIES ||--o{ PRODUCTION_FORECASTS : "forecasted"
    SPECIES ||--o{ CONTRACTS : "ordered"

    EXPERIMENTS ||--o{ EXPERIMENT_RESEARCHERS : "has team"
    EXPERIMENTS ||--o{ EXPERIMENT_RESOURCES : "uses"
    EXPERIMENTS ||--o{ GROWTH_LOGS : "has weekly logs"

    CHEMICALS ||--o{ EXPERIMENT_RESOURCES : "consumed in"
    EQUIPMENT ||--o{ EXPERIMENT_RESOURCES : "used in"

    PRODUCTION_FORECASTS ||--o| CONTRACTS : "generates"

    CLIENTS ||--o{ CONTRACTS : "orders"
    CONTRACTS ||--o{ CONTRACT_MILESTONES : "has milestones"
    CONTRACTS ||--o{ PAYMENTS : "has payments"
```

### 5.4 Key Relationships Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| Species → Experiments | One-to-Many | Each species can have many experiments |
| Experiment → Growth Logs | One-to-Many | Each experiment has weekly log entries |
| Experiment → Researchers | Many-to-Many | Via `experiment_researchers` junction table |
| Experiment → Chemicals/Equipment | Many-to-Many | Via `experiment_resources` junction table |
| Species → Growth Profile | One-to-One | Aggregated statistics per species |
| Species → Forecasts | One-to-Many | Multiple production forecasts per species |
| Forecast → Contract | One-to-One (optional) | A forecast can become a contract |
| Client → Contracts | One-to-Many | Client can have multiple orders |
| Contract → Milestones | One-to-Many | Each contract has tracked milestones |
| Contract → Payments | One-to-Many | Multiple payment installments per contract |

---

## 6. System Architecture

### 6.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ 💻 Web App    │  │ 📱 Mobile     │  │ 🖨️ Reports    │                  │
│  │ (React SPA)  │  │ (Future PWA) │  │ (PDF Export) │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                 │                           │
│         └────────────┬────┘─────────────────┘                          │
│                      ▼                                                  │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    VERCEL EDGE NETWORK                         │     │
│  │         Static Assets + CDN + SSL + Domain                    │     │
│  └──────────────────────────┬────────────────────────────────────┘     │
│                              ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                     SUPABASE (BaaS)                            │     │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐    │     │
│  │  │ 🔐 Auth      │  │ 📡 Realtime   │  │ 📁 Storage        │    │     │
│  │  │ (JWT + RLS) │  │ (WebSocket)  │  │ (Photos/Docs)    │    │     │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘    │     │
│  │  ┌─────────────────────────────────────────────────────────┐  │     │
│  │  │ 🗄️ PostgreSQL Database                                   │  │     │
│  │  │  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐ │  │     │
│  │  │  │ Inventory │ │ Research  │ │ Analytics │ │ Business │ │  │     │
│  │  │  │ Tables   │ │ Tables    │ │ Views     │ │ Tables   │ │  │     │
│  │  │  └──────────┘ └───────────┘ └───────────┘ └──────────┘ │  │     │
│  │  └─────────────────────────────────────────────────────────┘  │     │
│  │  ┌─────────────────────────────────────────────────────────┐  │     │
│  │  │ ⚡ Edge Functions (Deno)                                  │  │     │
│  │  │  • Production Calculation Engine                         │  │     │
│  │  │  • Species Profile Aggregation                           │  │     │
│  │  │  • Contract Alert Notifications                          │  │     │
│  │  │  • PDF Report Generation                                 │  │     │
│  │  └─────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                  3RD PARTY INTEGRATIONS                        │     │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │     │
│  │  │ 📧 Email  │  │ 📊 Charts  │  │ 🖨️ PDF    │  │ ☁️ Weather   │  │     │
│  │  │ Resend   │  │ (client)  │  │ jsPDF    │  │ OpenMeteo   │  │     │
│  │  └──────────┘  └───────────┘  └──────────┘  └─────────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Data Flow — Production Calculator Engine

```
┌──────────────────────────────────────────────────────────────────────┐
│            PRODUCTION CALCULATOR — DATA FLOW                         │
│                                                                      │
│  INPUT                    PROCESSING                  OUTPUT         │
│  ┌──────────────┐        ┌──────────────────┐       ┌────────────┐  │
│  │ Species: 🥑   │───────▶│ 1. Query all     │       │ Production │  │
│  │ Avocado       │        │    experiments   │       │ Plan:      │  │
│  │               │        │    for species   │       │            │  │
│  │ Quantity:     │        ├──────────────────┤       │ • 910      │  │
│  │ 10,000        │        │ 2. Calculate     │       │   initial  │  │
│  │               │        │    averages:     │       │   stock    │  │
│  │ Method:       │        │    • mult rate   │       │ • 18 weeks │  │
│  │ Grafting      │        │    • survival %  │       │ • 2 green- │  │
│  │               │        │    • cycle time  │       │   houses   │  │
│  │ Priority:     │        ├──────────────────┤       │ • Weekly   │  │
│  │ Standard      │        │ 3. Apply safety  │       │   targets  │  │
│  └──────────────┘        │    margins:      │       │ • 90%      │  │
│                           │    • seasonal    │       │   conf.    │  │
│                           │    • capacity    │       │            │  │
│                           │    • std dev     │       │ Cost:      │  │
│                           ├──────────────────┤       │ • $25,000  │  │
│                           │ 4. Generate week │       │            │  │
│                           │    by week plan  │       │ Risk: LOW  │  │
│                           └──────────────────┘       └────────────┘  │
│                                                                      │
│  ════════════════════════════════════════════════════════════════════ │
│                                                                      │
│  FORMULA:                                                            │
│                                                                      │
│  initial_stock = desired_qty / (avg_mult_rate × avg_survival_rate)  │
│                                                                      │
│  est_weeks = avg_cycle_weeks × ceil(log(desired/initial) /          │
│              log(avg_mult_rate)) + buffer_weeks                      │
│                                                                      │
│  confidence = est_weeks ± (z_score × std_dev_weeks)                 │
│              where z_score = 1.645 for 90% CI                       │
│                                                                      │
│  weekly_milestone[i] = initial × (avg_mult_rate ^ (i/cycle_weeks)) │
│                        × avg_survival_rate                           │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.3 Third-Party Integrations

| Service | Purpose | Phase | Cost |
|---------|---------|-------|------|
| **Supabase** | Database, Auth, Storage, Realtime | Phase 1 | Free → $25/mo |
| **Vercel** | Frontend hosting, CDN, SSL | Phase 1 | Free → $20/mo |
| **Resend** | Transactional emails (contract notifications, weekly reminders) | Phase 1 | Free (100/day) |
| **jsPDF + html2canvas** | Client-side PDF generation (production plans, contracts) | Phase 1 | Free (OSS) |
| **Open-Meteo API** | Weather data for correlating environmental conditions with growth | Phase 2 | Free |
| **Stripe** | Payment processing for client deposits/invoices | Phase 2 | 2.9% + $0.30 |
| **Twilio / WhatsApp** | SMS alerts for critical deadlines and delivery notifications | Phase 2 | $0.0075/msg |
| **GitHub Actions** | CI/CD pipeline (lint, test, deploy) | Phase 1 | Free |
| **Sentry** | Error monitoring and performance tracking | Phase 1 | Free (5K events) |

---

## 7. Security & Compliance

### 7.1 Authentication & Authorization

| Layer | Implementation |
|-------|---------------|
| **Authentication** | Supabase Auth with email/password + optional Google OAuth |
| **Session Management** | JWT tokens with 1-hour expiry, refresh tokens with 7-day expiry |
| **Role-Based Access Control (RBAC)** | See matrix below |
| **Row-Level Security (RLS)** | Supabase PostgreSQL RLS policies — users can only access data they're authorized for |

#### RBAC Permission Matrix

| Action | Lab Manager | Senior Researcher | Research Assistant | Lab Technician | Business Manager |
|--------|:-----------:|:-----------------:|:------------------:|:--------------:|:----------------:|
| Create Experiments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Record Growth Logs | ✅ | ✅ | ✅ | ✅ | ❌ |
| View All Experiments | ✅ | ✅ | ✅ | ✅ | 🔍 Read-only |
| Edit Species Data | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Inventory | ✅ | ✅ | ✅ | ✅ | ❌ |
| Use Production Calculator | ✅ | ✅ | ❌ | ❌ | ✅ |
| Create/Edit Contracts | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Financial Data | ✅ | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ❌ | ❌ | ✅ |

### 7.2 Data Protection

| Measure | Implementation |
|---------|---------------|
| **Encryption at Rest** | Supabase encrypts all data at rest (AES-256) |
| **Encryption in Transit** | TLS 1.3 for all connections (enforced by Supabase + Vercel) |
| **API Security** | Supabase API keys + RLS policies. `anon` key for public, `service_role` key only on server-side |
| **Input Validation** | Zod schemas on frontend + PostgreSQL constraints on backend |
| **SQL Injection** | Prevented by Supabase client library (parameterized queries) |
| **XSS Protection** | React's built-in JSX escaping + Content Security Policy headers |
| **CSRF Protection** | JWT-based auth (no cookies = no CSRF risk) |
| **File Upload Security** | Supabase Storage with file type validation, max 10MB per file |
| **Audit Trail** | `created_at`, `updated_at`, `created_by` on all tables + Supabase audit logs |

### 7.3 Compliance Considerations

| Regulation | Applicability | Action Required |
|-----------|--------------|-----------------|
| **GDPR** | ⚠️ Moderate | If serving EU clients: implement data export/deletion, cookie consent, privacy policy |
| **HIPAA** | ❌ Not applicable | No human health data involved (plant research only) |
| **PCI-DSS** | ⚠️ Phase 2 only | When Stripe is integrated: never store card data locally, use Stripe Elements (PCI-compliant) |
| **Data Residency** | ⚠️ Check | Ensure Supabase region matches client country requirements. Default: US East |
| **Research Data Integrity** | ✅ Important | Growth logs should be **append-only** (no editing past entries, only adding corrections). Implements good lab practice (GLP) principles |
| **Intellectual Property** | ✅ Important | Experimental data and proprietary growth rates are trade secrets. RLS ensures researchers only see their authorized experiments |

### 7.4 Backup & Disaster Recovery

| Component | Strategy |
|-----------|----------|
| **Database** | Supabase daily backups (Pro plan: point-in-time recovery) |
| **Application Code** | Git repository on GitHub (full version history) |
| **Uploaded Files** | Supabase Storage with S3-compatible replication |
| **Recovery Time Objective (RTO)** | < 4 hours |
| **Recovery Point Objective (RPO)** | < 24 hours (free tier) / < 1 minute (Pro tier) |

---

## 8. Development Roadmap

### Phase 1: MVP — Research Module (Months 1-3)

#### Month 1: Foundation & Core Research

| Week | Deliverables | Priority |
|------|-------------|----------|
| **Week 1-2** | **Backend Setup** | 🔴 Critical |
| | • Supabase project creation + schema migration | |
| | • Authentication implementation (email/password) | |
| | • RLS policies for all tables | |
| | • Connect frontend to Supabase (replace mock data for inventory) | |
| **Week 3-4** | **Experiment Management UI** | 🔴 Critical |
| | • Experiments list page (grid/list view, following existing patterns) | |
| | • Create/Edit Experiment dialog (species selector, parameters, team assignment) | |
| | • Experiment detail page (using existing DetailPageShell pattern) | |
| | • Link experiments to inventory (chemicals, equipment) | |

#### Month 2: Growth Tracking & Data Entry

| Week | Deliverables | Priority |
|------|-------------|----------|
| **Week 5-6** | **Weekly Growth Logging** | 🔴 Critical |
| | • Growth Log entry form (seedling count, survival, health, photos) | |
| | • Auto-calculated fields (survival rate %, multiplication rate) | |
| | • Growth curve visualization (Recharts line chart) | |
| | • Bulk data entry mode (enter multiple weeks at once) | |
| **Week 7-8** | **Research Dashboard** | 🟡 Important |
| | • Research overview page with KPI cards (active experiments, species count, avg survival) | |
| | • Experiment status distribution chart | |
| | • Species comparison chart (growth rates) | |
| | • Recent activity feed | |

#### Month 3: Production Calculator & Business MVP

| Week | Deliverables | Priority |
|------|-------------|----------|
| **Week 9-10** | **Species Growth Profiles & Calculator** | 🔴 Critical |
| | • Auto-aggregate experiment data into species growth profiles | |
| | • Production Calculator page (species select → quantity input → forecast output) | |
| | • Weekly milestone generation algorithm | |
| | • Confidence interval calculation | |
| | • PDF export of production plan | |
| **Week 11-12** | **Contract Management** | 🟡 Important |
| | • Client management (CRUD) | |
| | • Contract creation from production forecast | |
| | • Contract status tracking pipeline | |
| | • Basic payment tracking | |
| | • Dashboard showing active contracts vs. production progress | |

#### Phase 1 Definition of Done:
- [ ] Researcher can create experiment, log weekly growth data, see growth charts
- [ ] System calculates species growth profiles from accumulated experiment data
- [ ] Business user can input desired quantity → get production timeline + plan
- [ ] Contracts can be created, tracked, and linked to production forecasts
- [ ] All existing inventory features migrated from mock data to Supabase
- [ ] Authentication working with role-based access
- [ ] Deployed to production (Vercel + Supabase)

---

### Phase 2: Scale & Optimize (Months 4-6)

#### Month 4: Advanced Analytics & Intelligence

| Deliverables | Priority |
|-------------|----------|
| **Forecast Accuracy Tracking** — Compare predicted vs. actual production timelines | 🟡 Important |
| **Seasonal Adjustment Models** — Factor in seasonal growth variations using historical data | 🟡 Important |
| **Anomaly Detection** — Alert when growth deviates >15% from expected trajectory | 🟡 Important |
| **Resource Optimization** — Recommend optimal greenhouse allocation based on active contracts | 🟢 Nice-to-have |
| **Weather Correlation** — Integrate Open-Meteo API to correlate environmental data with growth rates | 🟢 Nice-to-have |

#### Month 5: Payment & Communication

| Deliverables | Priority |
|-------------|----------|
| **Stripe Integration** — Accept deposits and milestone payments online | 🟡 Important |
| **Invoice Generation** — Auto-generate invoices from contract milestones | 🟡 Important |
| **Email Notifications** — Weekly experiment reminders, contract deadline alerts, payment receipts | 🟡 Important |
| **Client Portal** — Read-only view for clients to track their order progress | 🟢 Nice-to-have |
| **SMS/WhatsApp Alerts** — Critical notifications for overdue payments, production delays | 🟢 Nice-to-have |

#### Month 6: Polish & Performance

| Deliverables | Priority |
|-------------|----------|
| **PWA (Progressive Web App)** — Install on mobile for quick growth log entry in the greenhouse | 🟡 Important |
| **Offline Support** — Cache growth log form for field data entry without internet | 🟡 Important |
| **Barcode/QR Scanning** — Scan experiment batch tags for quick data lookup | 🟢 Nice-to-have |
| **Data Export** — Export all experiment data to CSV/Excel for academic publications | 🟡 Important |
| **Performance Optimization** — Lazy loading, virtual scrolling for large datasets | 🟡 Important |
| **Comprehensive Testing** — Unit tests (Vitest), E2E tests (Playwright), >80% coverage | 🔴 Critical |

#### Phase 2 Definition of Done:
- [ ] Production forecasts improve accuracy to ±10% based on accumulated data
- [ ] Clients can make online payments via Stripe
- [ ] Automated email notifications for all key events
- [ ] Mobile-friendly data entry (PWA) working offline
- [ ] System handles 50+ concurrent experiments, 10+ active contracts
- [ ] Comprehensive test suite with >80% code coverage

---

## 9. Appendix — Existing Codebase Audit

### 9.1 Technical Debt to Address Before Building

| Issue | Severity | Fix |
|-------|----------|-----|
| `noImplicitAny: false` in tsconfig | 🟡 Medium | Set `strict: true` incrementally |
| Monolithic page files (636-844 lines) | 🟡 Medium | Extract form components, table components into separate files |
| All data is hardcoded mock arrays | 🔴 Critical | Migrate to Supabase as first step |
| `@tanstack/react-query` installed but unused | 🟢 Low | Activate when connecting to Supabase |
| No global state management | 🟡 Medium | Add Zustand for cross-module state (experiment data → calculator) |
| No error boundaries | 🟡 Medium | Add React Error Boundaries around each module |
| No loading/skeleton states for data fetching | 🟡 Medium | Add skeleton components (shadcn/ui already has `<Skeleton>`) |
| Missing accessibility (ARIA labels) | 🟡 Medium | Audit and add aria-labels to all interactive elements |
| No pagination | 🟡 Medium | Implement cursor-based pagination with Supabase |
| Business section page file may not exist | 🔴 Critical | Create Business module pages |

### 9.2 File Structure — Proposed Extension

```
src/
├── components/
│   ├── layout/             # ✅ Existing (AppLayout, Sidebar, TopNav)
│   ├── ui/                 # ✅ Existing (40+ shadcn components)
│   ├── dashboard/          # ✅ Existing (15 dashboard widgets)
│   ├── detail/             # ✅ Existing (DetailPageShell)
│   ├── research/           # 🆕 NEW
│   │   ├── ExperimentCard.tsx
│   │   ├── GrowthLogForm.tsx
│   │   ├── GrowthChart.tsx
│   │   ├── ExperimentTimeline.tsx
│   │   └── SpeciesProfileCard.tsx
│   └── business/           # 🆕 NEW
│       ├── ProductionCalculator.tsx
│       ├── ForecastResultCard.tsx
│       ├── ContractCard.tsx
│       ├── ContractPipeline.tsx
│       ├── ClientCard.tsx
│       └── PaymentTracker.tsx
├── pages/
│   ├── inventory/          # ✅ Existing (7 list + 4 detail pages)
│   ├── research/           # 🆕 NEW
│   │   ├── ResearchDashboard.tsx
│   │   ├── Experiments.tsx
│   │   ├── ExperimentDetail.tsx
│   │   ├── Protocols.tsx
│   │   ├── GrowthAnalysis.tsx
│   │   └── SpeciesProfiles.tsx
│   └── business/           # 🆕 NEW
│       ├── BusinessDashboard.tsx
│       ├── ProductionPlanner.tsx
│       ├── Clients.tsx
│       ├── ClientDetail.tsx
│       ├── Contracts.tsx
│       ├── ContractDetail.tsx
│       └── Payments.tsx
├── lib/
│   ├── utils.ts            # ✅ Existing
│   ├── supabase.ts         # 🆕 Supabase client initialization
│   ├── calculator.ts       # 🆕 Production calculation engine
│   └── statistics.ts       # 🆕 Statistical helper functions
├── hooks/
│   ├── use-mobile.tsx      # ✅ Existing
│   ├── use-experiments.ts  # 🆕 Experiment CRUD hooks (react-query)
│   ├── use-growth-logs.ts  # 🆕 Growth log hooks
│   ├── use-contracts.ts    # 🆕 Contract hooks
│   └── use-calculator.ts   # 🆕 Production calculator hook
├── types/
│   ├── inventory.ts        # 🆕 Extracted from mockDetailData.ts
│   ├── research.ts         # 🆕 Experiment, GrowthLog, SpeciesProfile types
│   └── business.ts         # 🆕 Client, Contract, Payment, Forecast types
└── data/
    └── mockDetailData.ts   # ✅ Existing (migrate to Supabase)
```

### 9.3 Estimation Summary

| Metric | Value |
|--------|-------|
| **Total new pages to build** | ~13 pages |
| **Total new components to build** | ~15 components |
| **New database tables** | 10 tables |
| **Existing pages to refactor** | 7 (migrate from mock to Supabase) |
| **Estimated total effort (Phase 1)** | 480-600 developer hours |
| **Recommended team size** | 2-3 developers |
| **MVP launch target** | May 2026 |
| **Full platform target** | August 2026 |

---

## 10. Key Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| **Forecast Accuracy** | Production calculator within ±15% of actual delivery time |
| **Data Entry Compliance** | >90% of experiments have weekly growth logs |
| **Contract Fulfillment** | >95% of contracts delivered on or before deadline |
| **System Uptime** | >99.5% |
| **User Adoption** | All lab researchers actively using the system |
| **Time-to-Quote** | <5 minutes from client inquiry to production plan (previously: hours/days) |

---

*Document generated for BioLab Compass platform — Bioengineering Laboratory Research & Production Management System*

*This document should be reviewed with stakeholders and updated as requirements evolve.*
