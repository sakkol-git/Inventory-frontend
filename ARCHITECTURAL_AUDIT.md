op# Comprehensive Architectural Audit: Inventory System

**Date:** May 19, 2026  
**Scope:** Frontend React/TypeScript inventory management system  
**Entities Audited:** Chemical, Equipment, Plant Species, Plant Stock, Plant Variety, Plant Sample

---

## Table of Contents

1. [Hook Patterns](#1-hook-patterns)
2. [API Service Patterns](#2-api-service-patterns)
3. [Type Definition Patterns](#3-type-definition-patterns)
4. [Page Implementation Patterns](#4-page-implementation-patterns)
5. [Form Handling](#5-form-handling)
6. [Detail View Patterns](#6-detail-view-patterns)
7. [State & Dialog Patterns](#7-state--dialog-patterns)
8. [Inconsistencies & Deviations](#8-inconsistencies--deviations)
9. [Cross-Cutting Patterns](#9-cross-cutting-patterns)

---

## 1. Hook Patterns

### Overview
All entity modules follow a consistent hook-based state management pattern. Each entity has a single `useXxxView()` hook that encapsulates all page-level state and logic.

### 1.1 Naming Conventions

**Pattern:** `use{EntityName}View`

Examples:
- `useChemicalsView()` → Chemical inventory page
- `useEquipmentView()` → Equipment inventory page
- `usePlantSpeciesView()` → Plant Species page
- `usePlantStockView()` → Plant Stock page
- `usePlantVarietiesView()` → Plant Varieties page
- `usePlantSamplesView()` → Plant Samples page

**Location:** `src/features/inventory/pages/{entity}/use{Entity}View.ts`

### 1.2 State Management Approach

All hooks follow the same internal structure:

```typescript
export function useChemicalsView() {
  const navigate = useNavigate();
  
  // ── Pagination ──
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("all");
  
  // ── View Mode ──
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  // ── Form State ──
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form, setForm] = useState<FormType>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // ── Backend Data ──
  const { data: response, isLoading, isError } = useXxxList(queryParams);
  
  // ── Mutations ──
  const createMutation = useCreateXxx();
  const updateMutation = useUpdateXxx();
  const deleteMutation = useDeleteXxx();
  
  // ── Confirmation Dialogs ──
  const deleteDialog = useConfirmDialog();
  
  // ... helpers and return object
}
```

**Key Characteristics:**
- **Single source of truth:** All state for a page lives in one hook
- **Modular state slices:** Separate concerns (pagination, form, view mode)
- **React Query integration:** Data queries and mutations via custom hooks
- **Navigation:** Uses `useNavigate()` for routing
- **Confirmation dialogs:** Uses `useConfirmDialog()` for delete operations

### 1.3 Return Structure

All view hooks return a consistent object structure:

```typescript
return {
  // ── Data ──
  filteredItems: Item[],
  totalCount: number,
  quickStats: Stat[],
  
  // ── Filters ──
  searchQuery: string,
  updateSearchQuery: (q: string) => void,
  [filterName]Filter: string,
  update[FilterName]Filter: (v: string) => void,
  
  // ── View Mode ──
  viewMode: ViewMode,
  switchViewMode: (mode: ViewMode) => void,
  
  // ── Navigation ──
  navigateToDetail: (id: number) => void,
  
  // ── Form State ──
  formOpen: boolean,
  isEditing: boolean,
  formTitle: string,
  formDescription: string,
  form: FormType,
  formErrors: FormErrors,
  canSubmitForm: boolean,
  
  // ── Form Actions ──
  openCreateForm: () => void,
  openEditForm: (item: Item) => void,
  closeForm: () => void,
  updateFormField: <K extends keyof FormType>(field: K, value: FormType[K]) => void,
  submitXxxForm: () => void,
  
  // ── Delete ──
  deleteDialog: ConfirmDialogState,
  requestDeleteXxx: (item: Item) => void,
  confirmDeleteXxx: () => void,
  
  // ── Metadata ──
  isLoading: boolean,
  isError: boolean,
  isSubmitting: boolean,
  page: number,
  setPage: (page: number) => void,
  meta?: PaginationMeta,
};
```

### 1.4 Query Key Patterns

**Parent hook structure:**
```typescript
// useChemicalsView.ts
const queryParams: Record<string, unknown> = { page };
if (searchQuery) queryParams.search = searchQuery;
if (filterState !== "all") queryParams.status = filterState;

const { data: response } = useChemicalList(queryParams);
```

**Query hooks automatically use hierarchical cache keys:**
- `["chemicals"]` — Root
- `["chemicals", "list"]` — All lists
- `["chemicals", "list", { page: 1, search: "..." }]` — Specific list
- `["chemicals", "detail", id]` — Individual item

Managed by `createEntityService` factory in `src/core/api/createEntityService.ts`.

### 1.5 Dialog/Confirmation Handling

**Delete Confirmation Pattern:**

```typescript
// Request phase (user clicks delete button)
const requestDeleteChemical = (chem: ChemicalItem) => {
  deleteDialog.requestConfirm(String(chem.id), {
    title: `Delete ${chem.common_name}?`,
    description: `This will permanently remove ${chem.common_name} (#${chem.id}).`,
  });
};

// Confirm phase (user clicks "Delete" in dialog)
const confirmDeleteChemical = () => {
  deleteDialog.confirm((id) => {
    deleteMutation.mutate(Number(id), {
      onSuccess: () => toast.success("Chemical deleted"),
      onError: () => toast.error("Failed to delete chemical"),
    });
  });
};
```

Uses `useConfirmDialog()` hook that manages:
- Dialog open/close state
- Pending ID storage
- Metadata (title, description)
- Callback execution

### 1.6 Delete/Mutation Patterns

**Consistent mutation approach:**

```typescript
const deleteMutation = useDeleteChemical();

// In delete confirm handler:
deleteMutation.mutate(id, {
  onSuccess: () => {
    toast.success("Item deleted");
    // Query cache automatically invalidated
  },
  onError: () => {
    toast.error("Failed to delete");
  },
});
```

**Create/Update pattern:**

```typescript
createMutation.mutate(payload, {
  onSuccess: () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setEditingItem(null);
    toast.success(`${form.name} added successfully`);
  },
  onError: (err) => {
    if (isValidationError(err)) {
      setFormErrors(mapBackendErrors(err.response.data.errors));
    }
    toast.error(
      isValidationError(err)
        ? err.response.data.message
        : "Failed to create item"
    );
  },
});
```

**Key characteristics:**
- Automatic query cache invalidation via `onSuccess`
- Validation error handling with field mapping
- Toast notifications for user feedback
- Form state reset on success

---

## 2. API Service Patterns

### 2.1 Service File Structure

All entity services follow the same minimal wrapper pattern:

**Example: chemicalService.ts**
```typescript
import type { ChemicalApi, ChemicalPayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";

const entity = createEntityService<ChemicalApi, ChemicalPayload>(
  "chemicals",
  "/chemicals",
);

export const chemicalKeys    = entity.keys;
export const chemicalService = entity.service;

export const useChemicalList   = entity.useList;
export const useChemicalById   = entity.useById;
export const useCreateChemical = entity.useCreate;
export const useUpdateChemical = entity.useUpdate;
export const useDeleteChemical = entity.useDelete;
```

**All entity services follow this pattern:**
- `chemicalService.ts`
- `equipmentService.ts`
- `plantSpeciesService.ts`
- `plantStockService.ts`
- `plantVarietyService.ts`
- `plantSampleService.ts`

### 2.2 Factory: createEntityService

**Location:** `src/core/api/createEntityService.ts`

**Type parameters:**
```typescript
createEntityService<TApi, TPayload>(baseKey, endpoint)
```

**Returns:**
```typescript
{
  keys: EntityKeys,
  service: EntityService<TApi, TPayload>,
  useList: (params?) => UseQueryResult<PaginatedResponse<TApi>>,
  useById: (id?) => UseQueryResult<TApi>,
  useCreate: () => UseMutationResult,
  useUpdate: () => UseMutationResult,
  useDelete: () => UseMutationResult,
}
```

### 2.3 How Query Hooks Are Defined

**useList Pattern:**
```typescript
function useList(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<TApi>>({
    queryKey: keys.list(params ?? {}),
    queryFn: () => service.list(params),
  });
}
```

**useById Pattern:**
```typescript
function useById(id: number | undefined) {
  return useQuery<TApi>({
    queryKey: keys.detail(id!),
    queryFn: () => service.show(id!),
    enabled: !!id,  // Only fetch if id is defined
  });
}
```

**Key characteristics:**
- Hierarchical cache keys for efficient invalidation
- Conditional enabling (`enabled` flag for useById)
- Server-side pagination via `params`
- Automatic serialization of params into cache key

### 2.4 How Mutations Are Defined

**useCreate Pattern:**
```typescript
function useCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TPayload) => service.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}
```

**useUpdate Pattern:**
```typescript
function useUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<TPayload>;
    }) => service.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}
```

**useDelete Pattern:**
```typescript
function useDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => service.destroy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}
```

**Key characteristics:**
- All mutations invalidate the root key to refresh all queries
- Query client automatically handles cache updates
- Type-safe parameter passing

### 2.5 Error Handling Patterns

**HTTP layer:** `src/core/api/api.ts` (Axios instance)

**Error types in:** `src/shared/types/api-error.ts`

**Validation error pattern:**
```typescript
export function isValidationError(
  error: unknown,
): error is { response: { data: ApiValidationError; status: 422 } }

// Usage in view hook:
if (isValidationError(err)) {
  setFormErrors(mapBackendErrors(err.response.data.errors));
}
toast.error(
  isValidationError(err)
    ? err.response.data.message
    : "Failed to create item"
);
```

**Error types:**
- **422 Validation Error:** `{ message: string, errors: Record<string, string[]> }`
- **400 Business Error:** `{ error: string, message: string, details?: ... }`
- **Other:** Generic error handling

### 2.6 Query Key Structure

**Hierarchical structure:**
```typescript
const keys: EntityKeys = {
  all: ["chemicals"] as const,
  lists: () => ["chemicals", "list"] as const,
  list: (params) => ["chemicals", "list", params] as const,
  detail: (id) => ["chemicals", "detail", id] as const,
};
```

**Usage for invalidation:**
```typescript
// Invalidate all chemical queries
queryClient.invalidateQueries({ queryKey: keys.all })

// Invalidate only list queries
queryClient.invalidateQueries({ queryKey: keys.lists() })

// Invalidate specific detail
queryClient.invalidateQueries({ queryKey: keys.detail(5) })
```

### 2.7 Type Usage & Parameter Handling

**All mutations use flat parameters:**
```typescript
// Create: full payload
service.create(payload: TPayload)

// Update: ID + partial payload
service.update(id: number, payload: Partial<TPayload>)

// Delete: ID only
service.destroy(id: number)
```

**Parameter passing to useList:**
```typescript
const queryParams: Record<string, unknown> = { page: 1 };
if (searchQuery) queryParams.search = searchQuery;
if (filter !== "all") queryParams.status = filter;

const { data } = useChemicalList(queryParams);
```

### 2.8 Return Types

**List response:**
```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}
```

**Detail response:**
```typescript
interface DetailResponse<T> {
  data: T;
}
```

**Mutation response:**
```typescript
interface MutationResponse<T> {
  data: T;
}
```

---

## 3. Type Definition Patterns

### 3.1 Location & Organization

**Pattern:** `src/features/inventory/types/{entity}.ts`

**Files:**
- `chemical.ts` - Chemical types
- `equipment.ts` - Equipment types
- `plant-species.ts` - Plant Species types
- `plant-stock.ts` - Plant Stock types
- `plant-variety.ts` - Plant Variety types
- `plant-sample.ts` - Plant Sample types

**Central export:** `src/features/inventory/types/index.ts`

### 3.2 Api vs Payload vs Form Types

**Three-tier type system:**

#### Tier 1: API Types (`*Api`)
- Exact shape of backend response
- Includes IDs, timestamps, computed fields
- Snake_case field names
- All fields present (backend might return null)

**Example:**
```typescript
export interface ChemicalApi {
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
  is_expired: boolean;  // Computed
  created_at: string;
  updated_at: string;
}
```

#### Tier 2: Payload Types (`*Payload`)
- Shape sent to backend for create/update
- Excludes IDs and timestamps
- Includes optional `image: File` for uploads
- Uses same field names as API response

**Example:**
```typescript
export interface ChemicalPayload {
  common_name: string;
  chemical_code?: string | null;
  category: ChemicalCategory;
  quantity: number;
  storage_location?: string | null;
  expiry_date?: string | null;
  danger_level: DangerLevel;
  safety_measures?: string | null;
  description?: string | null;
  image_url?: string | null;
  image?: File;  // For upload
}
```

#### Tier 3: Form Types (in view hooks)
- Intermediate between UI and payload
- CamelCase field names for form inputs
- All fields are strings for controlled inputs
- Preview URLs for images

**Example from useChemicalsView:**
```typescript
export interface ChemicalForm {
  name: string;                   // ← camelCase
  chemicalCode: string;
  category: string;
  quantity: string;               // ← string (form input)
  storageLocation: string;
  expiryDate: string;
  dangerLevel: string;
  safetyMeasures: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  imagePreviewUrl: string;        // ← for preview
}
```

### 3.3 Naming Conventions

**API Response Fields:**
- Snake_case: `common_name`, `chemical_code`, `storage_location`
- Computed: `is_expired`, `variety_count`, `sample_count`
- Timestamps: `created_at`, `updated_at`

**Payload Field Names:**
- Match API field names exactly
- Include optional File: `image?: File`

**Form Field Names:**
- CamelCase for consistency with React conventions
- Field map required for backend error mapping:

```typescript
const BACKEND_FIELD_MAP: Record<string, keyof ChemicalForm> = {
  common_name: "name",
  chemical_code: "chemicalCode",
  category: "category",
  quantity: "quantity",
  storage_location: "storageLocation",
  // ... etc
};
```

### 3.4 Nesting & Relationships

**Flat API Response (Chemical, Equipment, Species, Variety):**
```typescript
export interface ChemicalApi {
  id: number;
  common_name: string;
  // ... flat fields
}
```

**Nested Relations - Plant Stock:**
```typescript
export interface PlantStockApi {
  id: number;
  inventory: {
    total: number;
    reserved: number;
    net_available: number;
    status: StockStatus;
  };
  relations: {
    species: PlantSpeciesApi | null;
    variety: PlantVarietyApi | null;
    sample: PlantSampleApi | null;
  };
  created_at: string;
  updated_at: string;
}
```

**Nested Relations - Plant Sample (most complex):**
```typescript
export interface PlantSampleApi {
  id: number;
  identity: {
    name: string;
    code: string;
    status: SampleStatus;
  };
  relationships: {
    species: PlantSpeciesApi | null;
    variety: PlantVarietyApi | null;
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
```

**But payloads flatten everything:**
```typescript
export interface PlantSamplePayload {
  sample_name: string;
  sample_code: string;
  plant_species_id: number;
  plant_variety_id?: number | null;
  owner_name?: string | null;
  department?: string | null;
  origin_location?: string | null;
  brought_at?: string | null;
  lab_location?: LabLocation | null;
  status: SampleStatus;
  quantity: number;
  description?: string | null;
  image_url?: string | null;
  image?: File;
}
```

### 3.5 Required vs Optional Fields

**API Types:**
- Required fields have no `| null`
- Optional nullable fields: `string | null`
- Computed fields always present

**Payload Types:**
- Required: `common_name: string`
- Optional: `chemical_code?: string | null`
- Rule: Properties with default values are optional

**Pattern:**
```typescript
// Payload
export interface ChemicalPayload {
  common_name: string;           // Required
  chemical_code?: string | null; // Optional (often null)
  image?: File;                  // Optional
}
```

### 3.6 Special Properties (icon, color, etc.)

**Extended types in view hooks** (not in type definitions):

```typescript
export type ChemicalItem = ChemicalApi & {
  icon: LucideIcon;     // Computed from category
  color: string;        // Hex color for UI
  daysLeft: number;     // Computed from expiry date
};
```

**Similar pattern for other entities:**
```typescript
export type EquipmentItem = EquipmentApi & {
  icon: LucideIcon;
  color: string;
};

export type SpeciesItem = PlantSpeciesApi & {
  icon: LucideIcon;
  color: string;
};
```

**Mapping function:**
```typescript
function toChemicalItem(c: ChemicalApi): ChemicalItem {
  const meta = HAZARD_ICONS[c.danger_level] || HAZARD_ICONS.low;
  return {
    ...c,
    icon: meta.icon,
    color: meta.color,
    daysLeft: computeDaysLeft(c.expiry_date),
  };
}
```

---

## 4. Page Implementation Patterns

### 4.1 Overall Structure

All entity pages follow this composition pattern:

**File structure:**
```
pages/{entity}/
├── {Entity}.tsx              # Main page (composition root)
├── {Entity}FormDialog.tsx    # Create/edit dialog
├── {Entity}Grid.tsx          # Grid view component
├── {Entity}Table.tsx         # Table view component
├── {Entity}Detail.tsx        # Detail page
├── use{Entity}View.ts        # All state/logic
└── entity-detail/            # Detail page sections
    ├── {Entity}DetailRenderer.tsx
    ├── domain.ts
    ├── sectionRegistry.ts
    ├── types.ts
    ├── use{Entity}Detail.tsx
    └── sections/
```

### 4.2 Main Page Component Pattern

**Example: Chemicals.tsx**
```typescript
const Chemicals = () => {
  const view = useChemicalsView();

  return (
    <ListPage
      icon={FlaskConical}
      title="Chemical Inventory"
      description="Track chemicals..."
      addLabel="Add Chemical"
      onAdd={view.openCreateForm}
      stats={view.quickStats}
      searchPlaceholder="Search..."
      searchQuery={view.searchQuery}
      onSearchChange={view.updateSearchQuery}
      viewMode={view.viewMode}
      onViewModeChange={view.switchViewMode}
      items={view.filteredItems}
      emptyTitle="No chemicals found"
      emptyDescription="Try adjusting your search."
      renderGrid={(items) => (
        <ChemicalGrid
          items={items}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteChemical}
        />
      )}
      renderTable={(items) => (
        <ChemicalTable
          items={items}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteChemical}
        />
      )}
    >
      <ChemicalFormDialog view={view} />
      <ConfirmDialog
        open={view.deleteDialog.open}
        onOpenChange={view.deleteDialog.setOpen}
        onConfirm={view.confirmDeleteChemical}
        title={view.deleteDialog.pendingMeta.title}
        description={view.deleteDialog.pendingMeta.description}
        confirmLabel="Delete"
        variant="destructive"
      />
    </ListPage>
  );
};
```

**Key characteristics:**
- Uses shared `ListPage` component shell
- Renders dialogs as children (form + confirm)
- All state passed via view object
- Conditional rendering via `renderGrid`/`renderTable` props

### 4.3 View Modes Supported

**All entities support:**
- **grid** - Card-based layout (ProductCard component)
- **table** - Tabular layout

**Extra features:**
- **Equipment** - Has `BorrowEquipmentDialog` for special workflow
- **Plant Stock** - Supports species filter + status filter
- **All** - Support search + optional entity-specific filters

### 4.4 Form Handling

**Dialog-based forms:**
- All forms are modal dialogs
- Single form per entity handles both create + edit
- Form opens/closes via view hook methods
- Field-level error handling with backend mapping

**Example: ChemicalFormDialog**
```typescript
export const ChemicalFormDialog = ({ view }: { view: ReturnType<typeof useChemicalsView> }) => (
  <Dialog
    open={view.formOpen}
    onOpenChange={(open) => {
      if (!open) view.closeForm();
    }}
  >
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{view.formTitle}</DialogTitle>
        <DialogDescription>{view.formDescription}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <IdentitySection form={view.form} updateField={view.updateFormField} />
        <PropertiesSection form={view.form} updateField={view.updateFormField} />
        {/* ... more sections ... */}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={view.closeForm}>Cancel</Button>
        <Button onClick={view.submitChemicalForm} disabled={!view.canSubmitForm}>
          {view.isEditing ? "Save Changes" : "Add Chemical"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

### 4.5 Detail Views

**Pattern: Render entity details with sections**

**Files:**
- `{Entity}Detail.tsx` - Page wrapper, fetches data, renders sections
- `entity-detail/use{Entity}Detail.tsx` - Loads entity from backend
- `entity-detail/domain.ts` - Pure functions for config assembly
- `entity-detail/sectionRegistry.ts` - Maps section kinds to renderers
- `entity-detail/sections/{SectionType}Renderer.tsx` - Individual section UI

**Flow:**
```
1. Route to /inventory/products/{entity}/{id}
2. {Entity}Detail.tsx mounts
3. useEntityDetail() fetches data via useEntityById()
4. domain.assembleConfig(data) creates section definitions
5. {Entity}DetailRenderer maps sections via sectionRegistry
6. Individual renderers display content
```

### 4.6 Grid Component Pattern

**Common interface:**
```typescript
interface EntityGridProps {
  items: Item[];
  onNavigate: (id: number) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}
```

**Uses ProductCard component:**
```typescript
<ProductCard
  title={item.common_name}
  imageUrl={item.image_url}
  badges={[...]}
  onClick={() => onNavigate(item.id)}
  onEdit={() => onEdit(item)}
  onDelete={() => onDelete(item.common_name)}  // ← passes title as param
/>
```

### 4.7 Table Component Pattern

**Shadcn Table component** with:
- Sortable columns (id, name, status)
- Action column (Edit, Delete buttons)
- Responsive design
- Pagination controls

---

## 5. Form Handling

### 5.1 FormDialog Components

All form dialogs follow a three-section pattern:

**Sections pattern (example: ChemicalFormDialog):**
```typescript
<IdentitySection form={form} updateField={updateField} />
<PropertiesSection form={form} updateField={updateField} />
<SafetySection form={form} updateField={updateField} />
```

**Section component signature:**
```typescript
type SectionProps = {
  form: FormType;
  updateField: <K extends keyof FormType>(field: K, value: FormType[K]) => void;
  errors?: Partial<Record<keyof FormType, string>>;
};
```

### 5.2 Validation Approach

**Client-side validation (pre-submit):**
```typescript
const canSubmitForm = Boolean(form.name && form.quantity);
```

**Server-side validation (post-submit):**
```typescript
onError: (err) => {
  if (isValidationError(err)) {
    setFormErrors(mapBackendErrors(err.response.data.errors));
  }
  toast.error(...);
};
```

**Field mapping for backend errors:**
```typescript
const BACKEND_FIELD_MAP: Record<string, keyof ChemicalForm> = {
  common_name: "name",
  chemical_code: "chemicalCode",
  // ... maps snake_case to camelCase
};

function mapBackendErrors(errors): FormErrors {
  const mapped: FormErrors = {};
  for (const [key, msgs] of Object.entries(errors)) {
    const field = BACKEND_FIELD_MAP[key];
    if (field) mapped[field] = msgs[0];
  }
  return mapped;
}
```

### 5.3 State Management

**Form state structure:**
```typescript
const [editingItem, setEditingItem] = useState<ChemicalItem | null>(null);
const [form, setForm] = useState<ChemicalForm>(EMPTY_FORM);
const [formErrors, setFormErrors] = useState<FormErrors>({});
const [formOpen, setFormOpen] = useState(false);
```

**Form lifecycle:**

1. **Open Create:** `setEditingItem(null)` + `setForm(EMPTY_FORM)` + `setFormOpen(true)`
2. **Open Edit:** `setEditingItem(item)` + `setForm(itemToForm(item))` + `setFormOpen(true)`
3. **Submit:** Validate → Mutate → OnSuccess: Close + Reset + Toast
4. **Close:** `setFormOpen(false)` + `setEditingItem(null)`

### 5.4 Default Values Handling

**Empty form constants:**
```typescript
const EMPTY_FORM: ChemicalForm = {
  name: "",
  chemicalCode: "",
  category: "other",
  quantity: "",
  storageLocation: "",
  expiryDate: "",
  dangerLevel: "low",
  safetyMeasures: "",
  description: "",
  imageUrl: "",
  imageFile: null,
  imagePreviewUrl: "",
};
```

**Converting API to form:**
```typescript
function chemicalToForm(item: ChemicalApi): ChemicalForm {
  return {
    name: item.common_name,
    chemicalCode: item.chemical_code || "",
    category: item.category,
    quantity: String(item.quantity),
    // ... etc
    imageFile: null,  // Always reset file input
    imagePreviewUrl: item.image_url || "",
  };
}
```

### 5.5 Form Libraries Used

**No form library** (not using React Hook Form, Formik, etc.)

Instead:
- Manual form state with `useState`
- Manual field updates via `updateFormField`
- Manual validation with field mapping
- Custom error handling per field

**Rationale:** Simple forms with predictable structure; library overhead not justified.

### 5.6 Submission Handling

**Create flow:**
```typescript
const submitChemicalForm = () => {
  if (!form.name || !form.quantity) {
    toast.error("Please fill in all required fields");
    return;
  }
  setFormErrors({});

  const payload = formToPayload(form);

  createMutation.mutate(payload, {
    onSuccess: () => {
      setFormOpen(false);
      setForm(EMPTY_FORM);
      setEditingItem(null);
      toast.success(`${form.name} added successfully`);
    },
    onError: (err) => {
      if (isValidationError(err)) {
        setFormErrors(mapBackendErrors(err.response.data.errors));
      }
      toast.error(...);
    },
  });
};
```

**Update flow:** Identical except `updateMutation.mutate({ id, payload }, ...)`

### 5.7 Image Upload Handling

**In form:**
```typescript
<ImageUpload
  label="Chemical Image"
  imageFile={view.form.imageFile}
  imageUrl={view.form.imageUrl}
  previewUrl={view.form.imagePreviewUrl}
  onFileChange={(file) => {
    view.updateFormField("imageFile", file);
    view.updateFormField(
      "imagePreviewUrl",
      file ? URL.createObjectURL(file) : view.form.imageUrl || ""
    );
  }}
  onUrlChange={(url) => {
    view.updateFormField("imageUrl", url);
    if (!view.form.imageFile)
      view.updateFormField("imagePreviewUrl", url);
  }}
/>
```

**Payload conversion (automatic multipart):**
```typescript
// In createEntityService.ts
if (hasFile(raw)) {
  return api.post(endpoint, toFormData(raw)).then(r => r.data);
}
```

---

## 6. Detail View Patterns

### 6.1 Detail Page Structure

**Files per entity:**
```
entity-detail/
├── {Entity}DetailRenderer.tsx  # Main renderer
├── domain.ts                   # Pure config functions
├── sectionRegistry.ts          # Maps kind → component
├── types.ts                    # Section types
├── use{Entity}Detail.tsx       # Fetches + assembles config
└── sections/
    ├── SectionTypeARenderer.tsx
    ├── SectionTypeBRenderer.tsx
    └── ...
```

### 6.2 Domain Functions vs Renderers

**Two-phase approach:**

**Phase 1: domain.ts (Pure functions, no React)**
```typescript
export const hazardColor = (hazard: string): string => {
  switch (hazard) {
    case "high": return "hsl(0, 72%, 51%)";
    case "medium": return "hsl(38, 92%, 50%)";
    case "low": return "hsl(145, 63%, 32%)";
    default: return "hsl(210, 20%, 50%)";
  }
};

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString("en-US", {...});
};

export const buildActions = (): ActionButton[] => [...];
```

**Phase 2: useEntityDetail.tsx (React hook)**
```typescript
export function useChemicalDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: chemical } = useChemicalById(Number(id));

  const config = useMemo(
    () => chemical ? assembleConfig(chemical) : null,
    [chemical]
  );

  return config;
}

function assembleConfig(data: ChemicalApi): ChemicalPageConfig {
  const hazColor = hazardColor(data.danger_level);
  return {
    header: {...},
    mainSections: [...],
    sidebarSections: [...],
  };
}
```

### 6.3 useDetail Hooks Structure

**Returns configuration object:**
```typescript
interface ChemicalPageConfig {
  header: {
    backTo: string;
    backLabel: string;
    icon: LucideIcon;
    iconColor: string;
    title: string;
    subtitle: string | null;
    badge: React.ReactNode;
  };
  mainSections: DetailSection[];
  sidebarSections: DetailSection[];
  actions?: ActionButton[];
  alerts?: Alert[];
}
```

**Section structure:**
```typescript
interface DetailSection {
  kind: SectionKind;
  title: string;
  icon: LucideIcon;
  fields: Field[];
  ghsTags?: string[];
  notes?: string | null;
}

interface Field {
  label: string;
  value: string | React.ReactNode;
  mono?: boolean;
}
```

### 6.4 Types in Detail Folders

**types.ts structure:**
```typescript
// Section renderer map
export type SectionRendererMap = Record<SectionKind, React.ComponentType<SectionProps>>;

// Page configuration
export interface ChemicalPageConfig {
  header: HeaderConfig;
  mainSections: DetailSection[];
  sidebarSections: DetailSection[];
  actions?: ActionButton[];
  alerts?: Alert[];
}

// Individual section
export interface DetailSection {
  kind: SectionKind;
  title: string;
  icon: LucideIcon;
  fields: Field[];
  // ... more type-specific fields
}
```

### 6.5 Section Organization

**Main sections** (content area, full width):
- Chemical Properties (name, code, category, quantity)
- Safety & Hazard Information (danger level, GHS tags, safety measures)
- Storage Requirements (location, temp, humidity)

**Sidebar sections** (right column, narrower):
- Dates (created, updated, expiry)
- Related Items (varieties, batches, etc.)
- Status indicators

### 6.6 Section Registry Pattern

**sectionRegistry.ts:**
```typescript
export const sectionRegistry = {
  "chemical-properties": ChemicalPropertiesRenderer,
  "safety-hazard": SafetyHazardRenderer,
  "storage-requirements": StorageRequirementsRenderer,
  dates: DatesRenderer,
} satisfies SectionRendererMap;
```

**Renderer usage:**
```typescript
const Renderer = sectionRegistry[section.kind];
<Renderer key={section.kind} section={section} />
```

### 6.7 Individual Section Renderers

**Pattern:**
```typescript
interface SectionProps {
  section: DetailSection;
}

const ChemicalPropertiesRenderer = ({ section }: SectionProps) => (
  <DetailSection title={section.title} icon={section.icon}>
    {section.fields.map((field) => (
      <DetailField key={field.label} label={field.label} value={field.value} mono={field.mono} />
    ))}
  </DetailSection>
);

export default ChemicalPropertiesRenderer;
```

---

## 7. State & Dialog Patterns

### 7.1 Delete Operations

**Three-phase pattern:**

**Phase 1: Request Delete**
```typescript
const requestDeleteChemical = (chem: ChemicalItem) => {
  deleteDialog.requestConfirm(String(chem.id), {
    title: `Delete ${chem.common_name}?`,
    description: `This will permanently remove ${chem.common_name} (#${chem.id}).`,
  });
};
```

**Phase 2: Confirm Dialog**
```typescript
<ConfirmDialog
  open={view.deleteDialog.open}
  onOpenChange={view.deleteDialog.setOpen}
  onConfirm={view.confirmDeleteChemical}
  title={view.deleteDialog.pendingMeta.title}
  description={view.deleteDialog.pendingMeta.description}
  confirmLabel="Delete"
  variant="destructive"
/>
```

**Phase 3: Execute**
```typescript
const confirmDeleteChemical = () => {
  deleteDialog.confirm((id) => {
    deleteMutation.mutate(Number(id), {
      onSuccess: () => toast.success("Chemical deleted"),
      onError: () => toast.error("Failed to delete chemical"),
    });
  });
};
```

### 7.2 Edit/Create Forms

**Two-mode form:**

**Create mode:**
```typescript
const openCreateForm = () => {
  setEditingItem(null);
  setForm(EMPTY_FORM);
  setFormErrors({});
  setFormOpen(true);
};

// UI shows: "Add New Chemical"
// Button text: "Add Chemical"
```

**Edit mode:**
```typescript
const openEditForm = (chem: ChemicalItem) => {
  setEditingItem(chem);
  setForm(chemicalToForm(chem));
  setFormErrors({});
  setFormOpen(true);
};

// UI shows: "Edit Chemical" + entity name
// Button text: "Save Changes"
```

### 7.3 Success/Error Notifications

**Pattern: Toast notifications for all operations**

```typescript
// Create success
toast.success(`${form.name} added successfully`);

// Update success
toast.success(`${form.name} updated successfully`);

// Delete success
toast.success("Chemical deleted");

// Validation error
toast.error(err.response.data.message);

// Generic error
toast.error("Failed to create chemical");
```

**Using:** `sonner` library for toast notifications

### 7.4 Confirmation Dialog Hook

**useConfirmDialog() structure:**
```typescript
export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingMeta, setPendingMeta] = useState<{
    title: string;
    description: string;
  }>();

  const requestConfirm = (id: string, meta?: {title?, description?}) => {
    setPendingId(id);
    setPendingMeta({...});
    setOpen(true);
  };

  const confirm = (onConfirm: (id: string) => void) => {
    if (pendingId) {
      onConfirm(pendingId);
    }
    setOpen(false);
    setPendingId(null);
  };

  return {
    open, setOpen,
    pendingId, pendingMeta,
    requestConfirm, confirm,
  };
}
```

### 7.5 Dialog/Form Interaction

**Confirm Dialog:** AlertDialog from Shadcn UI
- Disruptive (modal)
- Only for destructive actions
- Alternative: Approve positive/neutral actions inline

**Form Dialog:** Dialog from Shadcn UI
- Modal dialog
- Contains form sections
- Scrollable for long forms
- Cancel/Submit buttons

---

## 8. Inconsistencies & Deviations

### 8.1 Equipment - Special Borrow/Return Workflow

**Deviates from standard pattern:**

```typescript
// In Equipment.tsx (unique to Equipment)
const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
const [borrowMode, setBorrowMode] = useState<"borrow" | "return">("borrow");
const [borrowTarget, setBorrowTarget] = useState<EquipmentItem | null>(null);

const handleBorrow = (eq: EquipmentItem) => {
  setBorrowTarget(eq);
  setBorrowMode("borrow");
  setBorrowDialogOpen(true);
};

const handleReturn = (eq: EquipmentItem) => {
  setBorrowTarget(eq);
  setBorrowMode("return");
  setBorrowDialogOpen(true);
};
```

**Has dedicated BorrowEquipmentDialog component**

**Reason:** Equipment has domain-specific workflow (borrow/return) not shared by other entities.

### 8.2 Plant Stock - Nested Response Shape

**API response is deeply nested:**
```typescript
export interface PlantStockApi {
  id: number;
  inventory: {
    total: number;
    reserved: number;
    net_available: number;
    status: StockStatus;
  };
  relations: {
    species: PlantSpeciesApi | null;
    variety: PlantVarietyApi | null;
    sample: PlantSampleApi | null;
  };
  created_at: string;
  updated_at: string;
}
```

**But payload is flat:**
```typescript
export interface PlantStockCreatePayload {
  plant_species_id: number;
  plant_variety_id?: number | null;
  plant_sample_id?: number | null;
  quantity: number;
  reserved_quantity: number;
  status: StockStatus;
}
```

**Impact:** Additional mapping required in form conversion:
```typescript
function formToPayload(form: StockForm): PlantStockCreatePayload {
  return {
    plant_species_id: Number(form.speciesId),
    plant_variety_id: form.varietyId ? Number(form.varietyId) : null,
    plant_sample_id: form.sampleId ? Number(form.sampleId) : null,
    quantity: Number(form.quantity) || 0,
    reserved_quantity: Number(form.reservedQuantity) || 0,
    status: form.status as StockStatus,
  };
}

function stockToForm(item: PlantStockApi): StockForm {
  return {
    speciesId: item.relations.species ? String(item.relations.species.id) : "",
    varietyId: item.relations.variety ? String(item.relations.variety.id) : "",
    sampleId: item.relations.sample ? String(item.relations.sample.id) : "",
    quantity: String(item.inventory.total),
    reservedQuantity: String(item.inventory.reserved),
    status: item.inventory.status,
  };
}
```

### 8.3 Plant Sample - Most Complex Nesting

**Has four nested sections:**
```typescript
export interface PlantSampleApi {
  id: number;
  identity: { name, code, status }
  relationships: { species, variety }
  details: { owner, department, origin, quantity }
  lab_info: { brought_at, location }
  meta: { description, image, created_at, updated_at }
}
```

**Form mirrors flat structure:**
```typescript
export interface SampleForm {
  name: string;
  sampleCode: string;
  speciesId: string;
  varietyId: string;
  ownerName: string;
  department: string;
  originLocation: string;
  broughtAt: string;
  labLocation: string;
  status: string;
  quantity: string;
  description: string;
  // ...
}
```

### 8.4 View Mode Naming

**Most entities:** `viewMode: ViewMode` with values `"grid" | "table"`

**Pattern:** Consistent across all entities

### 8.5 Form State Type Names

**Inconsistency in naming:**
- `ChemicalForm` - Chemical-specific
- `EquipmentForm` - Equipment-specific
- `SpeciesForm` - Plant-specific (vs `PlantSpeciesForm`)
- `StockForm` - Plant-specific (vs `PlantStockForm`)
- `VarietyForm` - Plant-specific (vs `PlantVarietyForm`)
- `SampleForm` - Plant-specific (vs `PlantSampleForm`)

**Pattern:** Shorter names for form types within entity modules (ambiguity resolved by file location)

### 8.6 Filter Types

**Different filters per entity:**
- **Chemical:** No filters (server-side search only)
- **Equipment:** `statusFilter` ("all" | "available" | "borrowed" | "in_use" | "under_maintenance")
- **Plant Species:** `familyFilter` ("all" | specific family names)
- **Plant Stock:** `statusFilter` ("all" | "available" | "reserved" | "out_of_stock")
- **Plant Variety:** No filters
- **Plant Sample:** `statusFilter` ("all" | "active" | "inactive" | "archived")

**Reason:** Different business requirements per entity

### 8.7 Quick Stats Calculations

**Different metrics per entity:**
- **Chemical:** Total count, Expired count, Expiring soon, Safe
- **Equipment:** Total, Available, Borrowed, Under maintenance
- **Species:** Total species, Active (with varieties), Total varieties, Total samples
- **Stock:** Total stock entries, Total plants, Available, Out of stock
- **Variety:** Total varieties, Items on page (placeholder pattern)
- **Sample:** Total samples, On page (minimal stats)

### 8.8 Error Field Mapping Inconsistency

**Most entities use:** `BACKEND_FIELD_MAP` within the view hook

**But names vary:**
- `BACKEND_FIELD_MAP` - Chemical, Equipment, Species, Stock, Sample
- `BACKEND_FIELD_MAP` - Variety

**Type names vary too:**
- `FormErrors` - Most
- `FieldErrors` - Some

---

## 9. Cross-Cutting Patterns

### 9.1 Pagination

**All list queries support pagination:**

```typescript
const [page, setPage] = useState(1);
const queryParams: Record<string, unknown> = { page };
const { data: response } = useChemicalList(queryParams);
const meta = response?.meta;
```

**Return meta info:**
```typescript
return {
  // ...
  page,
  setPage,
  meta,
  totalCount: meta?.total ?? items.length,
};
```

**Usage in ListPage component:**
```typescript
<Pagination
  page={page}
  totalPages={meta?.last_page ?? 1}
  onPageChange={setPage}
/>
```

### 9.2 Search Implementation

**Server-side search:**
```typescript
const [searchQuery, setSearchQuery] = useState("");
const queryParams: Record<string, unknown> = { page };
if (searchQuery) queryParams.search = searchQuery;

const { data: response } = useChemicalList(queryParams);
```

**Query key includes search:**
- `["chemicals", "list", { page: 1, search: "sodium" }]`

**Search persists across filter changes but not page changes**

### 9.3 Image Handling

**Storage:** All images use `image_url: string | null` in API

**Upload process:**
1. User selects file via FileInput
2. Create object URL for preview: `URL.createObjectURL(file)`
3. Include in payload as `image: File`
4. Factory detects File and sends multipart FormData
5. Backend processes and stores URL
6. Update form with returned `image_url`

**On update with file:**
```typescript
if (hasFile(raw)) {
  // POST with _method=PUT (Laravel workaround)
  return api.post(endpoint + '/' + id, toFormData(raw, 'PUT'));
}
```

### 9.4 Enum Handling

**All enums centralized:** `src/shared/types/enums.ts`

**Pattern:**
```typescript
export const CHEMICAL_CATEGORIES = ['acid', 'base', 'solvent', 'other'] as const;
export type ChemicalCategory = typeof CHEMICAL_CATEGORIES[number];

export const formatEnumLabel = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
```

**Usage in form selects:**
```typescript
<Select value={form.category} onValueChange={...}>
  <SelectContent>
    {CHEMICAL_CATEGORIES.map((c) => (
      <SelectItem key={c} value={c}>
        {formatEnumLabel(c)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 9.5 Computed Fields

**Fields computed during item transformation:**

```typescript
function toChemicalItem(c: ChemicalApi): ChemicalItem {
  const meta = HAZARD_ICONS[c.danger_level] || HAZARD_ICONS.low;
  return {
    ...c,
    icon: meta.icon,
    color: meta.color,
    daysLeft: computeDaysLeft(c.expiry_date),
  };
}

function computeDaysLeft(expiryDate: string | null): number {
  if (!expiryDate) return 999;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
```

**Not stored in cache, recomputed on every list render**

### 9.6 Query Invalidation

**All mutations invalidate root key:**

```typescript
onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all })
```

**Result:** All queries with that root key are marked stale and refetched

**Hierarchy:**
```
["chemicals"]
├── ["chemicals", "list"]
│   ├── ["chemicals", "list", { page: 1 }]
│   ├── ["chemicals", "list", { page: 2 }]
│   └── ["chemicals", "list", { page: 1, search: "..." }]
└── ["chemicals", "detail"]
    ├── ["chemicals", "detail", 1]
    ├── ["chemicals", "detail", 2]
    └── ["chemicals", "detail", 3]
```

**Single invalidation clears everything**

### 9.7 Notification Patterns

**Using sonner toast library:**

```typescript
import { toast } from "sonner";

// Success
toast.success("Chemical deleted");

// Error
toast.error("Failed to delete chemical");

// Info
toast.info("Updating...");

// With description
toast.success("Chemical added", {
  description: "ID: 123",
  duration: 3000,
});
```

### 9.8 Navigation Patterns

**Router setup:** `src/app/router.tsx` (Vite with React Router)

**Entity list pages:**
- `/inventory/chemicals` → Chemicals.tsx
- `/inventory/equipment` → Equipment.tsx
- `/inventory/plant-species` → PlantSpecies.tsx
- `/inventory/plant-stock` → PlantStock.tsx
- `/inventory/plant-varieties` → PlantVarieties.tsx
- `/inventory/plant-samples` → PlantSamples.tsx

**Entity detail pages:**
- `/inventory/products/chemicals/:id` → ChemicalDetail.tsx
- `/inventory/products/equipment/:id` → EquipmentDetail.tsx
- `/inventory/products/species/:id` → PlantSpeciesDetail.tsx
- `/inventory/products/stock/:id` → PlantStockDetail.tsx

**Navigation in hooks:**
```typescript
const navigate = useNavigate();

const navigateToDetail = (id: number) =>
  navigate(`/inventory/products/chemicals/${id}`);
```

### 9.9 Type Safety

**Full end-to-end type safety:**

1. **API types** - Exact backend response shape
2. **Payload types** - Validated at compile time
3. **Form types** - CamelCase for UI
4. **View return type** - Entire hook is typed

**No `any` types used in entity modules**

### 9.10 Error Handling Hierarchy

```
Backend Error → Axios interceptor → Form mutation handler
    ↓
isValidationError? → mapBackendErrors → setFormErrors → show per-field
    ↓
Show field error under input

Other error? → toast.error(message)
```

**Per-field errors display:**
```typescript
{view.formErrors.name && (
  <p className="text-xs text-destructive">
    {view.formErrors.name}
  </p>
)}
```

---

## 10. Summary of Key Architectural Decisions

### 10.1 Factory Pattern for Services

**Why:** Eliminate duplication of 5+ identical CRUD hooks across 6+ entities

**How:** `createEntityService<TApi, TPayload>(baseKey, endpoint)`

**Result:** Service files are 14-16 lines (thin wrappers)

### 10.2 Three-Tier Type System

**Why:** Different needs at different layers (API ↔ Payload ↔ Form)

**Result:** Explicit field mappings, compile-time safety

### 10.3 Single-Hook State Management

**Why:** All page state in one place = predictable, composable, testable

**Result:** No scattered state across components, clear data flow

### 10.4 Confirmation Dialogs for Deletes

**Why:** Addresses UI-005 (prevent accidental deletions)

**Result:** Two-phase delete with confirmation + optional metadata

### 10.5 Domain Functions (Pure)

**Why:** Separate logic from React rendering

**Result:** Testable calculations (colors, labels, configs) in pure functions

### 10.6 Section Registry for Details

**Why:** Decouple section definitions from renderers

**Result:** Flexible detail page layout, easy to add new sections

### 10.7 Server-Side Filtering

**Why:** Scale with large datasets

**Result:** Frontend sends filter params, backend returns paginated results

---

## 11. Recommendations for Future Consistency

1. **Standardize filter naming:** All `xxxFilter` / `updateXxxFilter` (currently inconsistent)
2. **Standardize stats:** Define minimum metrics (id, name, created, status)
3. **Consolidate equipment borrow:** Consider moving BorrowEquipmentDialog into generic workflow
4. **Add disabled state tracking:** `isSubmitting` for form submission button disable
5. **Consider form library:** If forms grow more complex (validation, dynamic fields, nested objects)
6. **Centralize date formatting:** Extract to `src/shared/lib/date-format.ts`
7. **Add error boundaries:** Wrap detail pages with error boundary (currently no safety net)
8. **Document enum extensions:** Plant entities have computed fields (variety_count, etc.)

---

**End of Architectural Audit**

Generated: May 19, 2026  
Audit Scope: 6 entity modules, 2000+ lines of service/hook code analyzed
