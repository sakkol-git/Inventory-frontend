# ARCHITECTURAL INTERVENTION — Plant Lab Inventory System

> **Date:** 2026-03-04  
> **Scope:** Full-stack Laravel 11 + React 18 + TypeScript  
> **Verdict:** Structurally sound with targeted debt. Not a rescue — an acceleration.

---

## 1. System Health Assessment

| Dimension                   |  Score (1–10)   | Explanation                                                                                                                                                                                                         |
| --------------------------- | :-------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architecture Maturity**   |     **6.5**     | Correct patterns chosen (services, resources, policies, enums, form requests). Execution is 70% consistent — the last 30% is where the debt accumulates.                                                            |
| **Maintainability**         |     **5.5**     | Backend is maintainable. Frontend has 793-line page components, 1,262 lines of mock data, and duplicate service layers that make changes expensive.                                                                 |
| **Scalability**             |     **5.0**     | Backend queries are N+1 prone in reports/dashboard. Frontend loads every route eagerly (530-line App.tsx, 50+ static imports). No pagination used on most pages despite `usePagination` existing.                   |
| **Readability**             |     **6.0**     | Backend is readable — `declare(strict_types: 1)`, typed returns, clean naming. Frontend readability varies: dashboard widget registries are excellent; entity list pages are 400–800 line monoliths.                |
| **Technical Debt Level**    | **Medium-High** | ~1,950 lines of hardcoded mock data. Dual service layer (hooks + services). TypeScript `strict: false` with `noImplicitAny: false`. Zero meaningful frontend tests.                                                 |
| **Risk Level If Unchanged** |    **High**     | A second developer will spend weeks decoding which service layer to use, which mock data is real vs fake, and whether the 5 research/business pages have backend APIs. Feature velocity will halve within 3 months. |

---

## 2. Root Structural Failures

### CRITICAL — Backend

| #    | Category             | Failure                                                                                                                                                                   | Why Dangerous                                                                                                                   | Long-Term Impact                                                |
| ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| B-01 | **Performance**      | `ReportController::inventory()` loads ALL species, varieties, samples, stocks, chemicals, batches, AND equipment in a single request with no pagination                   | Single endpoint returns potentially thousands of records. Response size grows unbounded.                                        | Page load stalls at ~500 records. Server OOM at ~5,000.         |
| B-02 | **Performance**      | `ReportController::userActivity()` runs `Transaction::where()->count()` inside a `->map()` loop — classic N+1                                                             | For 100 users, this fires 100+ queries per request.                                                                             | Dashboard becomes unusable as user count grows.                 |
| B-03 | **Performance**      | `DashboardController::__invoke()` fires 15+ separate COUNT queries. No caching.                                                                                           | Every dashboard load = 15+ database round-trips.                                                                                | Under 10 concurrent users, the database becomes the bottleneck. |
| B-04 | **Architecture**     | `ReportController` is a 287-line God Controller doing querying + transformation + CSV streaming                                                                           | Violates SRP. Impossible to test individual reports. Adding a new report requires touching the same file.                       | Every new report increases merge conflict surface.              |
| B-05 | **Duplication**      | `ChemicalController` and `EquipmentController` have identical store/update/destroy patterns (DB::transaction + TransactionService::log) copy-pasted across 8+ controllers | Changes to the transaction logging pattern require editing 8 files.                                                             | A missed file = silent audit log gap. Regression guaranteed.    |
| B-06 | **Missing Coverage** | Research module (experiments, protocols, notebooks, growth analysis, sample tracking) has NO backend API — frontend uses 100% mock data                                   | Entire section is non-functional. Users see fake data they cannot modify.                                                       | Feature is a UI demo, not a product. Cannot ship.               |
| B-07 | **Missing Coverage** | Business module (clients, contracts, payments, lab services, production planner) has NO backend API — frontend uses 100% mock data                                        | Same as B-06. Entire business section is inert.                                                                                 | Cannot be sold or used operationally.                           |
| B-08 | **Testing**          | 22 test files but most are Fortify auth scaffolding stubs. Feature tests for core entities exist but don't cover edge cases.                                              | No tests for: borrow approval/rejection flow, report exports, transaction service integration, policy authorization edge cases. | Regressions will ship undetected. No CI confidence.             |

### CRITICAL — Frontend

| #    | Category         | Failure                                                                                                                                                                                                                                                                                       | Why Dangerous                                                                                                | Long-Term Impact                                                                                         |
| ---- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| F-01 | **Architecture** | **Dual service layer**: `src/services/chemicalService.ts` (plain axios) AND `src/hooks/useChemicalQuery.ts` (TanStack Query wrapping services) AND `src/services/chemicalService.ts` also exports TanStack hooks (`useChemicals`, `useCreateChemical`). Three access patterns for one entity. | Developer doesn't know which to import. Some pages use service hooks, others use query hooks, some use both. | Import confusion → inconsistent caching → stale data bugs.                                               |
| F-02 | **Dead Code**    | `src/data/` contains 1,948 lines of hardcoded mock data (mockDetailData, mockResearchData, mockBusinessData, mockLabServiceData, mockUserData)                                                                                                                                                | Ships to production. Inflates bundle. Causes confusion about what's real vs fake.                            | New developers will think the system works when it doesn't.                                              |
| F-03 | **Type Safety**  | TypeScript `strict: false`, `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, `noFallthroughCasesInSwitch: false` — every safety check disabled                                                                                                                   | The compiler catches nothing. `any` propagates silently. Refactoring is blind.                               | Runtime crashes that TypeScript was designed to prevent.                                                 |
| F-04 | **Bundle Size**  | `App.tsx` statically imports 50+ page components. No code splitting except the unused `lazy-routes.ts`. The entire app loads on first page visit.                                                                                                                                             | Initial bundle contains every page, every chart, every form.                                                 | First load > 2MB. Mobile users on 3G wait 8+ seconds.                                                    |
| F-05 | **Complexity**   | `Equipment.tsx` = 793 lines. `PlantSpecies.tsx` = 690 lines. `Chemicals.tsx` = 559 lines. These are monolith pages mixing form UI, table UI, grid UI, dialog logic, and filter logic in one file.                                                                                             | Impossible to review, test, or reuse any piece independently.                                                | Every bug fix in Equipment.tsx risks breaking the form, the table, AND the grid simultaneously.          |
| F-06 | **Routing**      | 530-line `App.tsx` with flat `<Route>` declarations, repeated `<ProtectedRoute>` wrappers, and 15+ legacy redirect routes                                                                                                                                                                     | Adding a new page requires editing the longest file in the app. Legacy redirects accumulate forever.         | App.tsx becomes the merge conflict epicenter.                                                            |
| F-07 | **State**        | Research and Business dashboards use mock data from `src/data/` — no backend connection. `useResearchDashboard`, `useBusinessDashboard`, and related hooks fabricate state from static imports.                                                                                               | Users interact with a Potemkin village. Forms submit to nowhere.                                             | Feature requests for "fix the bug in contracts" are unanswerable — there is no bug, there is no feature. |
| F-08 | **Testing**      | 1 test file: `example.test.ts` containing `expect(true).toBe(true)`. Zero component tests. Zero hook tests. Zero integration tests.                                                                                                                                                           | No safety net for any refactoring.                                                                           | Every change is a manual QA session. Velocity collapses as complexity grows.                             |

### MODERATE — Cross-Cutting

| #    | Category         | Failure                                                                                                                                                                                                                                               | Why Dangerous                                                                                   | Long-Term Impact                                                                                |
| ---- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| X-01 | **API Contract** | `AuthController::profile()` returns a raw JSON object. `AuthController::register()` returns `{ user: UserResource, access_token, ... }`. `AuthController::login()` returns `{ access_token, ... }` without user data. Three response shapes for auth. | Frontend must special-case every auth endpoint.                                                 | Inconsistent error handling, silent login failures.                                             |
| X-02 | **Naming**       | Backend: `chemical_name` in some places, `common_name` in others (model uses `common_name`, CSV export uses `chemical_name`). `transactionable` vs `transactable_type` typo in dashboard controller.                                                  | Data mapping bugs. Frontend receives `common_name` but some components display `chemical_name`. | Silent data display errors.                                                                     |
| X-03 | **Naming**       | Frontend: `plantSpeciesApi.ts` exists alongside `plantSpeciesService.ts`. No naming convention distinguishes the two.                                                                                                                                 | Which file do you import? Nobody knows without reading both.                                    | Time waste on every import decision.                                                            |
| X-04 | **Security**     | JWT tokens stored in `localStorage`. Vulnerable to XSS. Access token is a plain string in JS memory.                                                                                                                                                  | Any XSS vulnerability = full account takeover.                                                  | Industry-standard practice is httpOnly cookies for tokens. This is a known OWASP vulnerability. |

---

## 3. Target Architecture Vision

### 3.1 Backend (Laravel) — Target Structure

**Principle:** Controller → FormRequest → Service/Action → Model → Resource. Controllers are thin dispatchers. Business logic lives in Services/Actions. Models define data shape and scopes. Resources define API output.

```
app/
├── Console/
│   └── Commands/
│       ├── CheckOverdueBorrowsCommand.php
│       └── PruneExpiredTokensCommand.php
│
├── Domain/                              ← NEW: Domain-driven modules
│   ├── Auth/
│   │   ├── Controllers/
│   │   │   └── AuthController.php
│   │   ├── Requests/
│   │   │   ├── LoginRequest.php
│   │   │   └── RegisterRequest.php
│   │   └── Actions/
│   │       ├── LoginAction.php
│   │       └── RegisterAction.php
│   │
│   ├── Inventory/
│   │   ├── Controllers/
│   │   │   ├── ChemicalController.php
│   │   │   ├── EquipmentController.php
│   │   │   ├── PlantSampleController.php
│   │   │   ├── PlantSpeciesController.php
│   │   │   ├── PlantStockController.php
│   │   │   └── PlantVarietyController.php
│   │   ├── Models/
│   │   │   ├── Chemical.php
│   │   │   ├── ChemicalBatch.php
│   │   │   ├── Equipment.php
│   │   │   ├── PlantSample.php
│   │   │   ├── PlantSpecies.php
│   │   │   ├── PlantStock.php
│   │   │   └── PlantVariety.php
│   │   ├── Requests/
│   │   ├── Resources/
│   │   ├── Services/
│   │   │   ├── InventoryCrudService.php   ← Eliminates B-05 duplication
│   │   │   └── StockService.php
│   │   └── Policies/
│   │
│   ├── Borrowing/
│   │   ├── Controllers/
│   │   │   └── BorrowRecordController.php
│   │   ├── Models/
│   │   │   └── BorrowRecord.php
│   │   ├── Services/
│   │   │   └── BorrowService.php
│   │   ├── Notifications/
│   │   ├── Exceptions/
│   │   └── Policies/
│   │
│   ├── Reporting/
│   │   ├── Controllers/
│   │   │   └── ReportController.php        ← Thin dispatcher
│   │   ├── Queries/                        ← NEW
│   │   │   ├── InventoryReportQuery.php
│   │   │   ├── ChemicalUsageReportQuery.php
│   │   │   ├── ExpiredItemsReportQuery.php
│   │   │   ├── BorrowedItemsReportQuery.php
│   │   │   └── UserActivityReportQuery.php
│   │   └── Exporters/                     ← NEW
│   │       ├── CsvExporter.php
│   │       └── ReportExporterInterface.php
│   │
│   ├── Operations/
│   │   ├── Controllers/
│   │   │   ├── TransactionController.php
│   │   │   └── DashboardController.php
│   │   ├── Models/
│   │   │   └── Transaction.php
│   │   └── Services/
│   │       ├── TransactionService.php
│   │       └── DashboardService.php       ← Extract from controller
│   │
│   └── UserManagement/
│       ├── Controllers/
│       ├── Models/
│       ├── Resources/
│       └── Policies/
│
├── Enums/                               ← Stays global (shared across domains)
├── Exceptions/
├── Http/
│   └── Middleware/
├── Providers/
└── Support/
    ├── Concerns/
    │   └── HasTransactions.php
    └── Traits/
```

#### Controller Responsibility Rules

```
ALLOWED in controllers:
  ✓ $this->authorize()
  ✓ $request->validated()
  ✓ $service->doSomething()
  ✓ return new SomeResource($model)

FORBIDDEN in controllers:
  ✗ DB::transaction()         → Move to Service
  ✗ Model::create()           → Move to Service/Action
  ✗ Complex query building    → Move to dedicated Query class
  ✗ Data transformation       → Move to Resource
  ✗ Business rule checks      → Move to Service
  ✗ Notification dispatching  → Move to Service/Event
```

#### InventoryCrudService — Eliminates B-05

```php
class InventoryCrudService
{
    public function __construct(
        private readonly TransactionService $transactionService,
    ) {}

    public function create(Model $model, array $data, User $user): Model
    {
        return DB::transaction(function () use ($model, $data, $user) {
            $instance = $model::create($data);
            $this->transactionService->log(
                item: $instance,
                user: $user,
                action: TransactionAction::ADDED,
                quantity: (float) ($data['quantity'] ?? 0),
                note: class_basename($model) . ' created',
            );
            return $instance;
        });
    }

    // update(), delete() follow same pattern
}
```

#### DashboardService — Eliminates B-03

```php
class DashboardService
{
    public function getCounts(): array { /* cached 60s */ }
    public function getAlerts(): array { /* cached 30s */ }
    public function getRecentActivity(): Collection { /* cached 15s */ }
    public function getStatusBreakdown(): array { /* cached 60s */ }
}
```

#### Form Request Usage Rules

| Scenario       | Rule                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| Create entity  | `StoreXxxRequest` — all required fields validated                        |
| Update entity  | `UpdateXxxRequest` — `sometimes` on optional fields                      |
| Custom action  | Named request (e.g., `ApproveBorrowRecordRequest`)                       |
| Read/list/show | No FormRequest. Query params validated inline via `$request->validate()` |
| Authorization  | `authorize()` method in FormRequest, NOT in controller                   |

#### API Resource Standards

Every resource MUST:

1. Flatten enum values with `->value`
2. Format dates as ISO 8601
3. Include `id`, `created_at`, `updated_at`
4. Never expose `password`, `remember_token`, `deleted_at`
5. Use `$this->whenLoaded()` for relationships

---

### 3.2 Frontend (React) — Target Structure

```
src/
├── app/                                 ← NEW: App shell
│   ├── App.tsx                          ← Slim: providers + <RouterProvider>
│   ├── providers.tsx                    ← Provider composition
│   └── router.tsx                       ← Centralized route config with lazy()
│
├── components/
│   ├── ui/                              ← shadcn primitives (untouched)
│   ├── shared/                          ← Reusable widgets
│   ├── composed/                        ← Multi-primitive compositions
│   └── layout/                          ← AppLayout, AuthLayout, etc.
│
├── features/                            ← NEW: Feature-based modules
│   ├── chemicals/
│   │   ├── api.ts                       ← Service + query hooks (ONE file)
│   │   ├── types.ts                     ← Chemical-specific types
│   │   ├── constants.ts                 ← Enum options, status maps
│   │   ├── ChemicalsPage.tsx            ← Page component (~80 lines)
│   │   ├── ChemicalCard.tsx             ← Grid card
│   │   ├── ChemicalTable.tsx            ← Table view
│   │   ├── ChemicalForm.tsx             ← Create/Edit form
│   │   ├── ChemicalDetail.tsx           ← Detail page
│   │   └── useChemicalsView.ts          ← View hook
│   │
│   ├── equipment/                       ← Same structure
│   ├── plant-species/
│   ├── plant-varieties/
│   ├── plant-samples/
│   ├── plant-stocks/
│   ├── borrows/
│   ├── transactions/
│   ├── reports/
│   ├── dashboard/
│   ├── auth/
│   │   ├── api.ts
│   │   ├── AuthContext.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── users/
│   │   ├── api.ts
│   │   ├── UsersPage.tsx
│   │   ├── UserProfile.tsx
│   │   └── useUsersView.ts
│   └── admin/
│       ├── RoleManagement.tsx
│       └── PermissionManagement.tsx
│
├── hooks/                               ← Generic UI hooks only
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   ├── useFocusTrap.ts
│   └── useReducedMotion.ts
│
├── lib/                                 ← Utilities & config
│   ├── api.ts                           ← Axios instance
│   ├── utils.ts
│   ├── tokens.ts
│   ├── formatters.ts
│   ├── a11y.ts
│   └── query-client.ts
│
├── types/                               ← Shared/global types only
│   ├── api.ts                           ← ApiResponse, PaginatedResponse
│   ├── enums.ts
│   └── pagination.ts
│
└── test/
    └── setup.ts
```

#### Key Structural Changes

| Current                                                             | Target                                                                                            | Why                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/services/chemicalService.ts` + `src/hooks/useChemicalQuery.ts` | `src/features/chemicals/api.ts`                                                                   | **Merge dual service layer** into one file per feature |
| `src/data/mockDetailData.ts` (1,262 lines)                          | **DELETED**                                                                                       | Remove all mock data files                             |
| `src/pages/inventory/Equipment.tsx` (793 lines)                     | Split into `EquipmentPage.tsx` + `EquipmentTable.tsx` + `EquipmentCard.tsx` + `EquipmentForm.tsx` | No file over 250 lines                                 |
| `src/App.tsx` (530 lines)                                           | `src/app/router.tsx` with `lazy()` imports                                                        | Code-split every route                                 |
| `src/pages/research/*` (mock data)                                  | Move to `src/features/research/` with `// TODO: Wire to backend` stubs                            | Honest about status                                    |
| `src/pages/business/*` (mock data)                                  | Move to `src/features/business/` with `// TODO: Wire to backend` stubs                            | Honest about status                                    |

#### Component Layering Rules

```
Layer 1: ui/        — shadcn primitives. DO NOT add business logic.
Layer 2: shared/    — Entity-agnostic widgets. No API calls. No state management.
Layer 3: composed/  — Multi-widget compositions. Generic types OK. No API calls.
Layer 4: features/  — Business logic lives here. API calls, forms, pages.

Data flow: features/ → composed/ → shared/ → ui/
           features/ → hooks/ (for generic UI hooks)
           features/ → lib/ (for utilities)

NEVER: ui/ → features/
NEVER: shared/ → features/
NEVER: composed/ → features/
```

#### State Management Structure

```
Server State    → TanStack Query (ONLY via feature/xxx/api.ts)
Form State      → react-hook-form + zod
UI State        → useState in view hooks
Auth State      → AuthContext (single global context)
Theme State     → ThemeProvider (shadcn)

BANNED: Redux. MobX. Zustand. Global state stores.
REASON: This app has <20 pages. TanStack Query + Context is sufficient.
```

---

### 3.3 API Boundary Redesign

#### Response Format Standard

```json
// Success (single resource)
{
  "data": { "id": 1, "common_name": "Ethanol", ... },
  "message": "Chemical created successfully."
}

// Success (collection, paginated)
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 97,
    "from": 1,
    "to": 20
  },
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  }
}

// Success (action, no resource returned)
{
  "message": "Chemical deleted successfully."
}
```

#### Error Response Standard

```json
// Validation error (422)
{
  "message": "The given data was invalid.",
  "errors": {
    "common_name": ["The common name field is required."],
    "quantity": ["The quantity must be at least 0."]
  }
}

// Authorization error (403)
{
  "message": "You do not have permission to perform this action."
}

// Not found (404)
{
  "message": "Chemical not found."
}

// Business rule error (422)
{
  "message": "Cannot borrow expired chemicals.",
  "error_code": "ITEM_NOT_BORROWABLE"
}

// Server error (500)
{
  "message": "An unexpected error occurred."
}
```

#### Authentication Flow

```
1. POST /api/auth/login     → { access_token, token_type, expires_in, user: UserResource }
2. POST /api/auth/register  → { access_token, token_type, expires_in, user: UserResource }
3. GET  /api/auth/profile   → { data: { id, name, email, phone, role, permissions: [...] } }
4. POST /api/auth/refresh   → { access_token, token_type, expires_in }
5. POST /api/auth/logout    → { message: "..." }
```

**Rules:**

- Login and register MUST return user data to avoid a second profile request
- Profile MUST be wrapped in `{ data: ... }` like every other resource
- Access token SHOULD be in httpOnly cookie (Phase 4 security hardening)

#### Versioning Strategy

- Current: no versioning → acceptable at V1
- When V2 is needed: prefix with `/api/v2/`, keep `/api/` as V1 alias
- Never break existing response shapes without version bump

---

## 4. Clean Code Constitution

### Naming Rules

| Entity                 | Convention                  | Example                 |
| ---------------------- | --------------------------- | ----------------------- |
| PHP class              | PascalCase                  | `ChemicalController`    |
| PHP method             | camelCase                   | `returnItem()`          |
| PHP variable           | camelCase                   | `$borrowRecord`         |
| DB column              | snake_case                  | `common_name`           |
| DB table               | snake_case plural           | `chemicals`             |
| API route              | kebab-case plural           | `/plant-species`        |
| React component        | PascalCase                  | `ChemicalCard.tsx`      |
| React hook             | camelCase with `use` prefix | `useChemicalsView.ts`   |
| TypeScript type        | PascalCase                  | `ChemicalApi`           |
| TypeScript enum member | SCREAMING_SNAKE             | `AVAILABLE`             |
| CSS class              | kebab-case (Tailwind)       | `text-muted-foreground` |
| File (component)       | PascalCase                  | `PageHeader.tsx`        |
| File (utility)         | camelCase or kebab-case     | `formatters.ts`         |
| File (types)           | kebab-case                  | `plant-species.ts`      |

### Size Limits

| Entity                     |             Hard Limit              |      Warning Threshold       |
| -------------------------- | :---------------------------------: | :--------------------------: |
| Component file             |              300 lines              |          200 lines           |
| Hook file                  |              200 lines              |          150 lines           |
| Controller method          |              30 lines               |           20 lines           |
| Controller file            |              150 lines              |          100 lines           |
| Service method             |              50 lines               |           30 lines           |
| Service file               |              300 lines              |          200 lines           |
| Function/method parameters |                  5                  |              4               |
| CSS file                   |              500 lines              | 300 lines (split by section) |
| `index.css`                | **Current: 960 lines — OVER LIMIT** |     Split into partials      |

### Prohibited Patterns

| Pattern                         | Reason                              | Fix                                        |
| ------------------------------- | ----------------------------------- | ------------------------------------------ |
| `any` in TypeScript             | Defeats type system                 | Use `unknown`, generics, or specific types |
| Inline `style={{}}`             | Breaks dark mode, unmaintainable    | Tailwind classes                           |
| `JSON.stringify(data)` in UI    | Debug artifact in production        | Proper data display                        |
| `console.log` in committed code | Production noise                    | Remove or use conditional logger           |
| Raw SQL in controllers          | Injection risk, untestable          | Eloquent scopes or Query classes           |
| Business logic in Blade/JSX     | Violates separation                 | Move to service/hook                       |
| Storing JWT in localStorage     | XSS vulnerability                   | httpOnly cookie                            |
| `$request->all()` in Laravel    | Accepts unvalidated fields          | Always `$request->validated()`             |
| `catch {}` (empty catch)        | Swallows errors silently            | At minimum, log the error                  |
| `useEffect` for data fetching   | Race conditions, no caching         | TanStack Query                             |
| Static mock data in `src/data/` | Ships to production, fakes features | Delete or gate behind `__DEV__`            |

### Required Patterns

| Pattern                    | Where                         | Rule           |
| -------------------------- | ----------------------------- | -------------- |
| `declare(strict_types=1)`  | Every PHP file                | Already done ✓ |
| FormRequest for validation | Every mutating endpoint       | Already done ✓ |
| Policy for authorization   | Every controller action       | Already done ✓ |
| API Resource for output    | Every JSON response           | Already done ✓ |
| View hook for page state   | Every page with filters/state | ~60% done      |
| `AsyncContent` for loading | Every data-dependent UI       | ~0% adopted    |
| `key` prop with entity ID  | Every list/grid               | Check per-page |

### Comment Standards

```php
// ✓ "Why" comment — explains non-obvious decision
// Ship borrow directly for users with approve permission,
// otherwise create a pending request that needs manager approval.

// ✗ "What" comment — restates the code
// Create a chemical
$chemical = Chemical::create($data);
```

```tsx
// ✓ Section dividers for files >100 lines
// ─── Types ─────────────────────────────────────────
// ─── Queries ───────────────────────────────────────
// ─── Mutations ─────────────────────────────────────
// ─── Component ─────────────────────────────────────

// ✗ Excessive JSDoc on obvious code
/** Returns the user's name */
getName(): string { return this.name; }
```

---

## 5. Refactor Master Plan

### Phase 1 — Stabilization (Week 1–2)

**Goal:** Stop the bleeding. No new features. Fix what's actively dangerous.

| #   | Task                                                                                                                                                        |  Risk  | Complexity | Improvement                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: | :--------: | --------------------------------------------------------------- |
| 1.1 | Enable TypeScript `strict: true`, `noImplicitAny: true` in `tsconfig.app.json` and fix all resulting errors                                                 | Medium |    High    | Catches 50+ latent type bugs. Every future change is type-safe. |
| 1.2 | Delete `src/data/` directory (1,948 lines of mock data)                                                                                                     |  Low   |    Low     | Removes fake features. Forces honest assessment of what works.  |
| 1.3 | Mark Research and Business frontend modules as `// MOCK — NO BACKEND API` with a banner component                                                           |  Low   |    Low     | Prevents users from thinking these sections are functional.     |
| 1.4 | Consolidate dual service layer: delete `src/services/chemicalService.ts` hooks, keep only `src/hooks/useChemicalQuery.ts` (repeat for all 14 service files) | Medium |   Medium   | Single import path per entity. Eliminates confusion.            |
| 1.5 | Add `Cache::remember()` to `DashboardController` (60s TTL for counts, 30s for alerts)                                                                       |  Low   |    Low     | Dashboard goes from 15 queries to 1–2 cache hits.               |
| 1.6 | Fix `ReportController::userActivity()` N+1: use `withCount` and subquery instead of loop                                                                    |  Low   |    Low     | 100 queries → 1 query.                                          |
| 1.7 | Add pagination to `ReportController::inventory()` — split into separate paginated endpoints or add `?per_page=`                                             | Medium |   Medium   | Prevents unbounded response growth.                             |

### Phase 2 — Boundary Extraction (Week 3–5)

**Goal:** Separate concerns. Establish clear boundaries between domains.

| #   | Task                                                                                                                                     |  Risk  | Complexity | Improvement                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | :----: | :--------: | --------------------------------------------------------------------------- |
| 2.1 | Create `src/app/router.tsx` with `React.lazy()` for every route. Reduce `App.tsx` from 530 lines to ~50 (providers only).                | Medium |   Medium   | First paint drops by 60%. App.tsx becomes non-controversial.                |
| 2.2 | Create `InventoryCrudService` to extract the duplicated DB::transaction + TransactionService::log pattern from 8 controllers             |  Low   |   Medium   | 8 controllers shrink by 30% each. Audit logging changes in 1 place.         |
| 2.3 | Split `ReportController` (287 lines) into 5 Query classes + 1 thin controller dispatch                                                   |  Low   |   Medium   | Each report is independently testable and modifiable.                       |
| 2.4 | Extract `DashboardService` from `DashboardController`                                                                                    |  Low   |    Low     | Controller becomes a one-liner. Service is cacheable and testable.          |
| 2.5 | Move frontend pages from `src/pages/inventory/` to `src/features/` — one feature per entity with co-located api.ts, types.ts, components | Medium |    High    | Feature modules are self-contained. New dev finds everything in one folder. |
| 2.6 | Split monster page files: `Equipment.tsx` (793→4 files), `PlantSpecies.tsx` (690→4 files), `Chemicals.tsx` (559→4 files)                 | Medium |    High    | Every file under 250 lines. Each sub-component independently reviewable.    |
| 2.7 | Migrate all entity pages to use `ListPage` composed component                                                                            | Medium |   Medium   | Eliminates 200+ lines of boilerplate per page.                              |

### Phase 3 — Structural Normalization (Week 6–8)

**Goal:** Unify patterns. Make every part of the codebase predictable.

| #   | Task                                                                                                                                            |  Risk  | Complexity | Improvement                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | :----: | :--------: | ----------------------------------------------------------------- |
| 3.1 | Standardize auth API responses: login/register return `{ user, access_token, ... }`, profile returns `{ data: { ... } }`                        | Medium |    Low     | Frontend auth flow becomes predictable.                           |
| 3.2 | Fix naming inconsistencies: `chemical_name` → `common_name` everywhere (CSV export, dashboard, etc.)                                            |  Low   |    Low     | Zero mapping confusion.                                           |
| 3.3 | Remove `plantSpeciesApi.ts` (merge into `plantSpeciesService.ts`), apply to all duplicate service files                                         |  Low   |    Low     | One service file per entity.                                      |
| 3.4 | Adopt `usePagination` hook on all list pages (currently unused despite being fully built)                                                       |  Low   |   Medium   | Large lists become functional. No more loading 500 items at once. |
| 3.5 | Split `index.css` (960 lines) into logical partials using `@import` or Tailwind `@layer` files                                                  |  Low   |   Medium   | Each CSS concern in its own file. Max 300 lines each.             |
| 3.6 | Enforce consistent enum value representation: Backend enums use `->value` in Resources. Frontend mirrors with TypeScript string literal unions. |  Low   |   Medium   | Zero enum mismatch bugs.                                          |
| 3.7 | Create standardized error handling middleware in Laravel that wraps all exceptions into the documented format                                   | Medium |   Medium   | Frontend has one error parsing path, not five.                    |

### Phase 4 — Performance & Testing Hardening (Week 9–12)

**Goal:** Add resilience. Make the system provably correct.

| #   | Task                                                                                                             |  Risk  | Complexity | Improvement                                            |
| --- | ---------------------------------------------------------------------------------------------------------------- | :----: | :--------: | ------------------------------------------------------ |
| 4.1 | Write feature tests for: BorrowService (borrow, return, approve, reject), TransactionService, all report queries |  Low   |    High    | Core business flows are regression-proof.              |
| 4.2 | Write frontend component tests for: AsyncContent, EntityGrid, ListPage, AuthContext                              |  Low   |    High    | Critical interaction paths are tested.                 |
| 4.3 | Add Pest test coverage for all policies (14 policies × 5 methods = 70 test cases)                                |  Low   |   Medium   | Authorization logic is provably correct.               |
| 4.4 | Move JWT storage from localStorage to httpOnly cookie (requires backend cookie setup + CSRF)                     |  High  |    High    | Eliminates XSS token theft vulnerability.              |
| 4.5 | Add `@tanstack/react-query-devtools` to dev build. Enable React StrictMode.                                      |  Low   |    Low     | Dev-time debugging for cache, double-render detection. |
| 4.6 | Add database query logging in development. Monitor N+1 with Laravel Debugbar.                                    |  Low   |    Low     | Every N+1 is caught during development.                |
| 4.7 | Configure CI pipeline: `tsc --noEmit` + `eslint` + `vitest` + `php artisan test` on every PR                     | Medium |   Medium   | No broken code reaches main branch.                    |

---

## 6. Developer Onboarding Blueprint

### Document Structure

```
docs/
├── ARCHITECTURE.md              ← System overview with diagrams
│   - Tech stack with versions
│   - Backend domain boundaries
│   - Frontend feature modules
│   - Data flow diagram (request lifecycle)
│   - Authentication flow
│
├── GETTING_STARTED.md           ← Zero-to-running in 30 minutes
│   - Prerequisites (PHP 8.2+, Node 20+, MySQL 8+)
│   - Clone → Install → Migrate → Seed → Run
│   - Environment variables explained
│   - Common errors and fixes
│
├── FOLDER_GUIDE.md              ← "What goes where" reference
│   - Backend: Domain/ structure with purpose of each folder
│   - Frontend: features/ structure with component taxonomy
│   - Decision tree: "Where does my new code go?"
│
├── API_REFERENCE.md             ← Every endpoint documented
│   - Grouped by domain (Auth, Inventory, Borrowing, Reports)
│   - Request/response examples
│   - Authentication requirements
│   - Permission requirements
│
├── CODING_STANDARDS.md          ← Hard rules, not suggestions
│   - Naming conventions table
│   - Size limits table
│   - Prohibited patterns table
│   - Required patterns table
│   - Import ordering
│
├── CONTRIBUTING.md              ← PR process, review expectations
│   - Branch naming: feature/, fix/, refactor/
│   - Commit message format
│   - PR size limits (max 400 lines changed)
│   - Review checklist
│
├── FRONTEND_GOVERNANCE.md       ← Already created ✓
├── PAGE_MIGRATION_GUIDE.md      ← Already created ✓
└── UI_ARCHITECTURE_AUDIT.md     ← Already created ✓
```

### 48-Hour Onboarding Path

| Hour  | Activity                                                                                                                                   | Document                            |
| :---: | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
|  0–2  | Read architecture overview, run the development environment                                                                                | ARCHITECTURE.md, GETTING_STARTED.md |
|  2–4  | Read folder guide, explore the codebase with the guide open                                                                                | FOLDER_GUIDE.md                     |
|  4–6  | Read coding standards, understand what's allowed and banned                                                                                | CODING_STANDARDS.md                 |
|  6–8  | Walk through one complete feature: Chemicals (backend controller → service → model → API resource → frontend feature module → page → hook) | Self-guided                         |
| 8–12  | Read API reference, test endpoints with Postman collection                                                                                 | API_REFERENCE.md, POSTMAN files     |
| 12–16 | First task: add a filter to an existing list page (modify view hook + SearchFilter)                                                        | PAGE_MIGRATION_GUIDE.md             |
| 16–24 | Second task: create a new simple CRUD entity end-to-end                                                                                    | FOLDER_GUIDE.md                     |
| 24–36 | Read existing test suite, write one new test for an edge case                                                                              | Test files                          |
| 36–48 | PR review of another developer's work using the review checklist                                                                           | CONTRIBUTING.md                     |

---

## 7. Anti-Entropy Governance System

### Code Review Checklist (attach to every PR template)

```markdown
## Code Review Checklist

### Structure

- [ ] Files are in the correct domain/feature folder
- [ ] No business logic in controllers (use services/actions)
- [ ] No API calls in ui/ or shared/ components
- [ ] View hook pattern used for pages with data + filters
- [ ] Every new file under 300 lines

### Quality

- [ ] TypeScript strict mode passing (no `any`)
- [ ] No `console.log` in committed code
- [ ] No hardcoded colors/spacing (use tokens)
- [ ] All enum values from Enums, not magic strings
- [ ] FormRequest for every mutating endpoint

### Testing

- [ ] New service method has a test
- [ ] New policy method has a test
- [ ] New UI interaction has a component test

### Security

- [ ] $request->validated() used (never $request->all())
- [ ] Policy authorization on every controller action
- [ ] No secrets in committed code

### Accessibility

- [ ] Images have alt text
- [ ] Icon-only buttons have aria-label
- [ ] Keyboard navigation works
```

### Pull Request Standards

| Rule                      | Threshold                                               |
| ------------------------- | ------------------------------------------------------- |
| Max lines changed per PR  | 400 (excluding auto-generated)                          |
| Required reviewers        | 1 minimum, 2 for infrastructure/auth                    |
| Branch naming             | `feature/INV-123-add-chemical-filter`                   |
| Commit format             | `feat(chemicals): add category filter to list endpoint` |
| Squash on merge           | Required                                                |
| Delete branch after merge | Required                                                |

### Architecture Review Triggers

An architecture review is required when:

- A new database table is added
- A new domain/feature module is added
- The routing configuration changes
- An API response shape changes
- A new third-party dependency is added
- Any file exceeds 300 lines after the change
- A shared component's props interface changes

### Technical Debt Tracking

| Severity                                     | Response                                     | Timeline      |
| -------------------------------------------- | -------------------------------------------- | ------------- |
| **Critical** (security, data loss)           | Stop current work. Fix immediately.          | Same day      |
| **High** (broken feature, N+1 in production) | Schedule in next sprint.                     | 1 week        |
| **Medium** (code smell, missing test)        | Add to backlog with `// TODO(debt):` comment | 1 month       |
| **Low** (naming inconsistency, style)        | Fix when touching the file.                  | Opportunistic |

Every `// TODO` must include:

```
// TODO(debt): [severity] [description] [date-added]
// TODO(debt): MEDIUM — Extract inline form to ChemicalForm.tsx — 2026-03-04
```

---

## 8. Brutal Truth Section

### What Happens If Nothing Changes

**Month 1–3:** The solo developer continues adding features. The Research and Business sections look impressive in demos. Nobody realizes they're static mock data.

**Month 3–6:** A second developer joins. They spend 2 weeks understanding which service layer to use. They accidentally import hooks from `services/chemicalService.ts` instead of `hooks/useChemicalQuery.ts`. Data caching breaks silently. The bug isn't discovered for weeks because there are no tests.

**Month 6–9:** A client asks why their chemical edits don't appear in the Research section. The answer is: Research has no backend. The feature was never real. Trust erodes.

**Month 9–12:** The original developer leaves or gets sick. The 793-line Equipment.tsx breaks. Nobody can fix it because nobody understands the interaction between the inline form, the status filter, the view toggle, and the table sort — all in one file. The fix takes a week instead of an hour.

**Month 12–18:** The codebase is rewritten. The rewrite costs 3x what the refactoring would have.

### Why Solo-Knowledge Systems Are Dangerous

This system has a **bus factor of one**. One person wrote every line. One person knows where the mock data ends and the real data begins. One person understands why `plantSpeciesApi.ts` exists alongside `plantSpeciesService.ts`.

This is not a code quality problem. This is a **business continuity risk**.

If that person is unavailable for any reason — vacation, illness, departure — feature development stops. Bug fixes take 5x longer. The system becomes a liability instead of an asset.

### How This Affects Business Scalability

- **Hiring:** You cannot hire a frontend developer and expect them to be productive in under a month. The codebase has no consistent patterns to learn from.
- **Features:** Adding a new entity (e.g., "Lab Instruments") requires touching App.tsx (routes), creating a service file AND a query hook file AND a page file AND a view hook, figuring out which pattern to follow (the Equipment 793-line pattern or the Research widget-registry pattern), and hoping nothing breaks.
- **Revenue:** The Research and Business modules — presumably the differentiating features — are non-functional. They ship visual demos, not working software.
- **Quality:** Zero tests means zero confidence. Every deployment is a gamble.

### The Good News

The foundation is sound. The backend uses correct Laravel patterns (enums, policies, form requests, API resources, services). The frontend chose the right tools (TanStack Query, react-hook-form, Zod, shadcn/ui). The recent UI architecture work (composed components, design tokens, governance docs) shows intent toward quality.

This system needs **discipline and extraction**, not a rewrite. The Phase 1–4 roadmap above can be executed incrementally while continuing feature development. Every phase delivers measurable improvement. No big-bang required.

The difference between this codebase in its current state and a system that can sustain a team of 20 is approximately **4–6 weeks of focused structural work**.

That investment compounds. Skip it, and the interest payments are permanent.
