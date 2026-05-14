# UI and Business Logic Issues & Flaws

**System:** Plant Lap Laboratory  
**Version:** 2.0  
**Last Updated:** 2026-02-16  
**Status:** Non-Fixed Issues Inventory

---

## Table of Contents

1. [Critical Business Logic Flaws](#critical-business-logic-flaws)
2. [Type System Inconsistencies](#type-system-inconsistencies)
3. [Data Model Issues](#data-model-issues)
4. [UI/UX Issues](#uiux-issues)
5. [Validation & Security Issues](#validation--security-issues)
6. [State Management Issues](#state-management-issues)
7. [Missing Features](#missing-features)
8. [Code Quality Issues](#code-quality-issues)

---

## Critical Business Logic Flaws

### BL-001: Chemical Quantity Management Has No Stock Validation

**Severity:** 🔴 Critical  
**Location:** `src/pages/inventory/useChemicalsView.ts`

**Issue:**

- Chemical quantity adjustment allows reducing quantity beyond available stock
- No validation prevents negative quantities
- `submitQuantityAdjustment()` accepts any amount without checking current stock

**Example:**

```typescript
// Current code (lines ~200-250)
const submitQuantityAdjustment = () => {
  // Creates log entry but doesn't validate:
  // - adjustAmount could exceed available quantity
  // - No check for negative final quantity
  // - No atomic transaction handling
};
```

**Impact:**

- Can create invalid inventory states (negative stock)
- Chemical logs show incorrect inventory levels
- No audit trail for failed adjustments

**Fix Required:**

- Add `parseQuantity(quantityString)` helper to extract numeric value
- Validate `currentQuantity - adjustAmount >= 0` for "reduce" action
- Show error toast if validation fails
- Update quantity calculation to be numeric instead of string concatenation

---

### BL-002: No Relationship Validation (Species → Varieties → Samples)

**Severity:** 🔴 Critical  
**Location:** Multiple files

**Issue:**

- Plant Varieties can reference non-existent `speciesId`
- Plant Samples can reference non-existent `speciesId` or `varietyId`
- No cascading delete protection
- UI doesn't validate foreign key relationships before save

**Files Affected:**

- `src/pages/inventory/usePlantVarietiesView.ts`
- `src/pages/inventory/usePlantSamplesView.ts`

**Impact:**

- Orphaned records if species is deleted
- Can create variety for non-existent species
- Data integrity violations

**Fix Required:**

- Add `validateSpeciesExists(speciesId)` before saving varieties
- Add `validateVarietyExists(varietyId)` before saving samples
- Implement cascading delete or prevent deletion of referenced entities
- Add database foreign key constraints when implementing backend

---

### BL-003: RBAC Permissions Not Enforced in UI

**Severity:** 🟠 High  
**Location:** Throughout application

**Issue:**

- `useAuth()` hook provides `hasPermission()` and `isRole()` functions
- UI components don't check permissions before showing actions
- All routes are accessible regardless of role
- Delete buttons, edit forms, and admin functions visible to all users

**Examples:**

```typescript
// Types define permissions but UI doesn't use them:
// src/types/user.ts - ROLE_PERMISSIONS defined
// src/hooks/useAuth.ts - hasPermission() available

// But components don't check:
// ❌ Delete species button shown to Lab Assistant
// ❌ Manage Users page accessible to non-admin
// ❌ Chemical quantity adjustment available to Guest
```

**Impact:**

- Security risk if backend implemented without auth checks
- Confusing UX (users see actions they can't perform)
- Incomplete RBAC implementation

**Fix Required:**

- Wrap action buttons with permission checks: `{hasPermission('canDeleteSpecies') && <DeleteButton />}`
- Create `<ProtectedRoute>` component to guard routes by role
- Add `disabled` state to buttons when user lacks permission
- Show tooltips explaining why actions are disabled

---

### BL-004: UserRole Type Doesn't Match Database Schema

**Severity:** 🟠 High  
**Location:** `src/types/user.ts` vs `database-schema.sql`

**Issue:**
**TypeScript Definition:**

```typescript
// src/types/user.ts (line 6)
export type UserRole = "Admin" | "Lab Manager" | "Lab Assistant";
```

**Database Schema:**

```sql
-- database-schema.sql (lines 119-123)
CREATE TYPE enum_user_role AS ENUM (
  'Admin',
  'Lab Manager',
  'Lab Assistant'
);
```

**But conversation summary mentions:**

> Database schema v2.0 with 6 new enums including UserRole (Admin, Researcher, LabTechnician, Intern, Guest)

**Reality Check:**

- Current schema only has 3 roles
- Documentation mentions 5 roles
- Missing: Researcher, LabTechnician, Intern, Guest

**Impact:**

- Type system doesn't match intended design
- ROLE_PERMISSIONS map missing entries for additional roles
- Mock user data can't use Researcher/Intern/Guest roles

**Fix Required:**

1. Update `database-schema.sql` enum to include all 5 roles
2. Update TypeScript type to match
3. Define permissions for new roles in `ROLE_PERMISSIONS`
4. Update mock data to include users with new roles

---

### BL-005: PlantSample Uses Wrong Status Type

**Severity:** 🟡 Medium  
**Location:** `src/types/inventory.ts`

**Issue:**

```typescript
// PlantSample interface (line 31)
export interface PlantSample {
  // ... other fields
  status: PlantVarietyStatus; // ❌ WRONG TYPE
}
```

**Database Schema Defines Separate Status:**

```sql
-- database-schema.sql has:
CREATE TYPE enum_plant_variety_status AS ENUM ('Active', 'Archived', 'Destroyed');
-- Should also have:
CREATE TYPE enum_plant_sample_status AS ENUM (...);
```

**Impact:**

- Type confusion between varieties and samples
- Can't have sample-specific statuses (e.g., "In Testing", "Contaminated", "Consumed")
- Database schema doesn't define `enum_plant_sample_status`

**Fix Required:**

1. Add `PlantSampleStatus` type to `src/types/inventory.ts`
2. Add `enum_plant_sample_status` to `database-schema.sql`
3. Update `PlantSample.status` to use new type
4. Define appropriate sample statuses (Active, In Testing, Consumed, Contaminated, Archived, Destroyed)

---

### BL-006: Contract Milestones Don't Auto-Update Contract Status

**Severity:** 🟡 Medium  
**Location:** `src/types/business.ts`, contract management logic

**Issue:**

- `Contract` has `status` field
- `ContractMilestone` has `status` field
- No business logic links milestone completion to contract status
- Contract can show "In Production" while all milestones are "Completed"

**Expected Behavior:**

- When all milestones reach "Completed" → Contract status should auto-change to "Ready"
- If any milestone is "At Risk" or "Missed" → Contract should flag as delayed
- Milestone progression should update `progressPct`

**Impact:**

- Manual status updates prone to errors
- Contract dashboard shows incorrect status
- No automated workflow

**Fix Required:**

- Add `calculateContractStatus(milestones[])` function
- Add `calculateProgressPct(milestones[])` function
- Call on milestone update to auto-sync contract status
- Add business rule: "Delivered" status requires all milestones "Completed" + actualDeliveryDate set

---

### BL-007: Payment Tracking Doesn't Validate Against Contract Value

**Severity:** 🟡 Medium  
**Location:** `src/types/business.ts`, payment management

**Issue:**

- `Payment.amount` can exceed `Contract.totalValue`
- Multiple payments can sum to more than contract value
- No validation prevents overpayment
- No automatic payment status calculation based on total received

**Example Scenario:**

```typescript
Contract: totalValue = $10,000
Payment 1: $6,000 (Deposit)
Payment 2: $8,000 (Final)  // ❌ Total = $14,000 > $10,000
```

**Impact:**

- Accounting errors
- Can't trust payment status
- Manual reconciliation required

**Fix Required:**

- Add `getTotalPayments(contractId)` helper
- Validate `totalPayments + newPayment.amount <= contract.totalValue`
- Add `calculatePaymentStatus()` based on total received vs. total value:
  - 0% = "Pending"
  - 1-99% = "Partial"
  - 100% = "Paid"
  - > 100% = "Overpaid" (flag for review)

---

### BL-008: No Stock Reservation When Contracts Created

**Severity:** 🟡 Medium  
**Location:** Contract creation flow

**Issue:**

- Creating a contract for 1000 tomato seedlings doesn't reserve inventory
- Multiple contracts can promise the same stock
- No check if `quantityOrdered` exceeds available inventory
- `PlantStock` and `Contract` systems are disconnected

**Example:**

```typescript
// Available Tomato Stock: 500 seedlings
Contract A: 800 seedlings ordered  // ✅ Created successfully
Contract B: 600 seedlings ordered  // ✅ Also created - no validation!
// Total promised: 1400 > 500 available
```

**Impact:**

- Overcommitting inventory
- Delivery failures
- Manual tracking required

**Fix Required:**

- Add `reservedQuantity` field to plant_stock table
- Check `availableStock - reservedQuantity >= contract.quantityOrdered` before creating contract
- Update `reservedQuantity` when contract is created/cancelled/delivered
- Show "Available for Contracts" metric on inventory dashboard

---

### BL-009: Date Validation Missing in Forms

**Severity:** 🟡 Medium  
**Location:** All forms with date inputs

**Issue:**
**Contract Form:**

- `deliveryDeadline` can be before `contractDate`
- `actualDeliveryDate` can be in the future

**Chemical Form:**

- `expiry` can be in the past
- `dateReceived` can be in the future

**Experiment Form:**

- `endDate` can be before `startDate`

**Impact:**

- Invalid data states
- Confusing reports and dashboards
- Manual data cleanup required

**Fix Required:**

- Add date comparison validators:
  ```typescript
  validateDateRange(start, end) {
    if (new Date(end) < new Date(start)) {
      throw new Error("End date must be after start date");
    }
  }
  ```
- Add to all form submissions
- Show inline error messages on date inputs

---

### BL-010: No Duplicate Detection

**Severity:** 🟡 Medium  
**Location:** All create forms

**Issue:**

- Can create multiple varieties with same `varietyCode`
- Can create multiple chemicals with same `cas` number
- Can create multiple contracts with same `contractCode`
- No uniqueness validation

**Impact:**

- Data duplication
- Confusion in dropdowns and searches
- Manual deduplication required

**Fix Required:**

- Add `checkDuplicate(field, value, currentId?)` validation
- Check before form submission:
  ```typescript
  if (items.some((item) => item.code === form.code && item.id !== editingId)) {
    toast.error("Code already exists");
    return;
  }
  ```
- Add unique constraints to database schema
- Show suggestion: "Did you mean to edit {existing item}?"

---

### BL-011: Variety vs. Sample Distinction Unclear

**Severity:** 🟡 Medium  
**Location:** `src/types/inventory.ts`, data model design

**Issue:**

- `PlantVariety` and `PlantSample` have nearly identical fields
- Both have: `id, code, speciesId, name, uniqueCode, ownership, origin, description, dateBrought, status, images, notes, createdAt`
- No clear semantic difference in data model
- Users confused about when to create variety vs. sample

**Current State:**

```typescript
export interface PlantVariety {
  /* 14 fields */
}
export interface PlantSample {
  /* 14 identical fields */
}
```

**Recommended Distinction:**

**PlantVariety** (Genetic Definition):

- Genetic/phenotypic characteristics
- Breeding info, traits, disease resistance
- Growth parameters (germination rate, maturity days)
- One-to-many relationship with samples
- Immutable characteristics

**PlantSample** (Physical Inventory):

- Physical quantity, location, condition
- Batch tracking, harvest date, storage conditions
- References parent variety via `varietyId`
- Mutable (quantity consumed, status changes)

**Impact:**

- Conceptual confusion
- Redundant data entry
- Can't track variety → sample relationships
- Missing useful variety metadata (traits, germination rate, etc.)

**Fix Required:**

1. Refine `PlantVariety` interface to include genetic/trait fields
2. Refine `PlantSample` interface to include inventory/location fields
3. Add `varietyId?` to `PlantSample` (optional relationship)
4. Update UI to explain difference
5. Add fallback: samples can inherit variety images if not set

---

## Type System Inconsistencies

### TY-001: ChemicalLog Mock Data Field Name Mismatch

**Severity:** 🟡 Medium  
**Location:** `src/data/mockInventoryData.ts`

**Issue:**

```typescript
// src/types/inventory.ts defines:
export interface ChemicalLog {
  actionType: ChemicalActionType; // "add" | "reduce"
}

// But mock data might use:
// { action: "add" }  // ❌ Wrong field name
```

**Fix Required:**

- Audit `chemicalLogsData` in mockInventoryData.ts
- Ensure all fields match `ChemicalLog` interface exactly
- Enable TypeScript strict mode to catch these automatically

---

### TY-002: LabService Missing from inventory.ts

**Severity:** 🟡 Medium  
**Location:** `src/types/`

**Issue:**

- `LabService` interface exists in `src/types/business.ts`
- But conceptually it's an inventory/service module, not pure business
- Type organization inconsistent

**Current:**

```typescript
// src/types/business.ts
export interface LabService { ... }
```

**Question:**

- Should it be in `business.ts` (revenue-generating services)?
- Or in new `services.ts` (lab capabilities)?
- Or in `inventory.ts` (available services inventory)?

**Impact:**

- Minor - just organizational confusion
- Affects future refactoring

**Fix Required:**

- Decide on type file organization strategy
- Consider creating `src/types/services.ts` for lab service offerings
- Update imports accordingly

---

### TY-003: ResearchAchievement in user.ts Instead of research.ts

**Severity:** 🟢 Low  
**Location:** `src/types/user.ts`

**Issue:**

```typescript
// src/types/user.ts contains:
export interface ResearchAchievement { ... }
```

**Alternative:**

- Could be in `src/types/research.ts` since it's research domain
- Or keep in `user.ts` since it's tied to user profiles

**Current Logic:**

- Lives in `user.ts` because it's shown on user profile page
- Has `userId` foreign key

**Impact:**

- Organizational preference only
- No functional issue

**Recommendation:**

- Keep in `user.ts` - current location is reasonable
- Achievement is user-centric (portfolio/CV)

---

## Data Model Issues

### DM-001: No Audit Trail for Entity Changes

**Severity:** 🟠 High  
**Location:** All entities

**Issue:**

- Entities only have `createdAt` timestamp
- No `updatedAt` field
- No `updatedBy` user tracking
- Can't see edit history

**Example:**

```typescript
export interface PlantVariety {
  createdAt: string;
  // ❌ Missing: updatedAt?: string;
  // ❌ Missing: updatedBy?: string;
  // ❌ Missing: history?: ChangeLog[];
}
```

**Impact:**

- Can't answer: "Who changed this chemical's location?"
- Can't track data quality issues
- No compliance audit trail

**Fix Required:**

1. Add `updatedAt?: string` to all main interfaces
2. Add `updatedBy?: string` to track last editor
3. Update timestamp on every edit
4. Consider adding `ChangeLog[]` for full history

---

### DM-002: Chemical Quantity as String Instead of Number

**Severity:** 🟡 Medium  
**Location:** `src/types/` (inferred from seed data)

**Issue:**

```typescript
// Current: quantity stored as string
{
  quantity: "2.5L";
}
{
  quantity: "500g";
}

// Problems:
// 1. Can't do arithmetic: quantity - 100
// 2. Can't sort numerically
// 3. Can't aggregate for reports
```

**Better Approach:**

```typescript
interface Chemical {
  quantity: number; // Numeric value
  quantityUnit: string; // "L", "g", "mL", "kg"
  displayQuantity: string; // Computed: `${quantity}${unit}`
}
```

**Impact:**

- Current string approach prevents:
  - Automatic stock alerts (quantity < reorderLevel)
  - Quantity-based sorting
  - Total inventory calculations
  - Consumption rate analysis

**Fix Required:**

1. Split `quantity` into `quantityValue` (number) + `quantityUnit` (string)
2. Update ChemicalItem interface
3. Update mock data
4. Add unit conversion helper for mixed units

---

### DM-003: Hazard Level Inconsistency

**Severity:** 🟡 Medium  
**Location:** Database schema vs. TypeScript

**Database Schema:**

```sql
CREATE TYPE enum_hazard_level AS ENUM ('low', 'medium', 'high');
```

**TypeScript:**

```typescript
// No exported HazardLevel type
// Using string literals in code
hazard: "high" | "medium" | "low"; // Not enforced by type
```

**Fix Required:**

- Add `export type HazardLevel = "low" | "medium" | "high";`
- Use in ChemicalItem interface
- Ensures consistency with database

---

### DM-004: Missing Foreign Key Relationships

**Severity:** 🟠 High  
**Location:** Type interfaces

**Issue:**

- Interfaces store foreign keys but don't define relationships
- No type-safe way to join data

**Example:**

```typescript
interface PlantVariety {
  speciesId: string; // Points to PlantSpecies
  // But no: species?: PlantSpecies; (joined data)
}
```

**Impact:**

- Manual lookups required: `species.find(s => s.id === variety.speciesId)`
- Can't leverage TypeScript for data integrity
- Denormalized data (storing both `speciesId` and `speciesName`)

**Fix Required:**

- Consider adding optional joined fields:
  ```typescript
  interface PlantVariety {
    speciesId: string;
    speciesName: string; // Denormalized for display
    _species?: PlantSpecies; // Optional joined data
  }
  ```
- Or use a type-safe ORM when backend is implemented

---

## UI/UX Issues

### UI-001: Type Coercion Using "as any"

**Severity:** 🟡 Medium  
**Location:** Multiple files

**Files:**

- `src/pages/inventory/PlantVarieties.tsx` (line 143)
- `src/pages/inventory/PlantSamples.tsx` (line 140)
- `src/pages/inventory/Equipment.tsx` (line 208)
- `src/pages/business/LabServices.tsx` (lines 399, 418)

**Issue:**

```typescript
// Example from PlantVarieties.tsx
meta: [
  /* ... */
].filter(Boolean) as any; // ❌ Bypasses type safety
```

**Why It Exists:**

- `filter(Boolean)` creates type `(MetaItem | null | undefined)[]`
- TypeScript can't narrow to `MetaItem[]` automatically
- Using `as any` to bypass error

**Fix Required:**

```typescript
// Proper type guard
meta: [
  /* ... */
].filter((item): item is MetaItem => item !== null && item !== undefined);
```

**Impact:**

- Loses type safety
- Runtime errors possible if null leaks through
- Bad TypeScript practice

---

### UI-002: Missing Image URLs in Mock Data

**Severity:** 🟢 Low  
**Location:** `src/data/mockInventoryData.ts`

**Issue:**

- All varieties use same placeholder image
- All samples use same placeholder image
- Not realistic for demo purposes

**Current:**

```typescript
{
  id: "PV-001",
  name: "Cherry Tomato - Sweet 100",
  images: ["https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400"],
  // ❌ Same URL used for all tomato varieties
}
```

**Fix Required:**

- Find unique Unsplash images for each variety
- Or use different angles/styles of same plant
- Makes UI demos more realistic

---

### UI-003: No Form Validation Messages

**Severity:** 🟡 Medium  
**Location:** All forms

**Issue:**

- Forms show "\* indicates required field" text
- But no inline validation errors
- No field-level error messages
- Button click shows toast only

**Example:**

```tsx
// From PlantSpecies.tsx, Chemicals.tsx, Equipment.tsx
<span className="text-destructive">*</span> indicates a required field

// But no:
{errors.name && <p className="text-destructive">{errors.name}</p>}
```

**Impact:**

- Poor UX - user must guess what's wrong
- Toast message disappears quickly
- Can't see multiple errors at once

**Fix Required:**

1. Add `errors` state: `Record<string, string>`
2. Validate on blur or submit
3. Show error below each field:
   ```tsx
   {
     errors.name && <p className="text-sm text-destructive">{errors.name}</p>;
   }
   ```
4. Consider integrating React Hook Form + Zod for robust validation

---

### UI-004: No Loading States for Forms

**Severity:** 🟡 Medium  
**Location:** All dialogs with forms

**Issue:**

- Save button doesn't show loading spinner
- User can click multiple times during async operation
- No visual feedback that save is in progress

**Current:**

```tsx
<Button onClick={saveForm}>
  <Plus className="h-4 w-4" />
  Save
</Button>
```

**Expected:**

```tsx
<Button onClick={saveForm} disabled={isSaving}>
  {isSaving ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Plus className="h-4 w-4" />
  )}
  {isSaving ? "Saving..." : "Save"}
</Button>
```

**Fix Required:**

- Add `isSaving` state to all forms
- Set true on submit, false on complete
- Disable button during save
- Show spinner icon

---

### UI-005: No Confirmation Dialogs for Destructive Actions

**Severity:** 🟠 High  
**Location:** Delete actions throughout app

**Issue:**

- Clicking delete immediately removes item
- No "Are you sure?" confirmation
- No undo functionality
- Easy to accidentally delete important data

**Example:**

```typescript
// Current delete flow:
const handleDelete = (id: string) => {
  setItems(items.filter((i) => i.id !== id));
  toast.success("Deleted");
};
```

**Expected:**

```typescript
// Should show confirmation dialog:
const handleDelete = (id: string) => {
  setDeleteConfirmOpen(true);
  setDeleteTargetId(id);
};

const confirmDelete = () => {
  setItems(items.filter((i) => i.id !== deleteTargetId));
  toast.success("Deleted");
  setDeleteConfirmOpen(false);
};
```

**Fix Required:**

1. Add `<AlertDialog>` for delete confirmations
2. Show item details in dialog
3. Require explicit "Confirm Delete" click
4. Optional: Add soft delete (archive) instead of hard delete

---

### UI-006: No Pagination on Large Lists

**Severity:** 🟠 High  
**Location:** All list pages

**Issue:**

- Lists render all items at once
- No pagination controls
- Poor performance with 100+ items
- Difficult to navigate large datasets

**Files Affected:**

- PlantSpecies, PlantStock, Chemicals, Equipment
- Experiments, Protocols, Contracts, Payments

**Impact:**

- Slow rendering with large datasets
- Overwhelming UI
- Hard to find specific items

**Fix Required:**

1. Add pagination state:
   ```typescript
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage] = useState(20);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const paginatedItems = filteredItems.slice(
     startIndex,
     startIndex + itemsPerPage,
   );
   ```
2. Add `<Pagination>` component at bottom
3. Show "Showing 1-20 of 156 results"
4. Add items-per-page selector (10, 20, 50, 100)

---

### UI-007: No Empty States on Some Pages

**Severity:** 🟡 Medium  
**Location:** Various pages

**Issue:**

- Some pages handle empty data well
- Others show blank space with just headers
- Inconsistent empty state experience

**Example:**

```tsx
// Good (using EmptyState component):
{filteredItems.length === 0 && (
  <EmptyState
    icon={Beaker}
    title="No chemicals found"
    description="Add your first chemical..."
  />
)}

// Bad (just empty grid):
{filteredItems.map(item => <Card key={item.id} ... />)}
// Shows nothing if filteredItems is empty
```

**Fix Required:**

- Audit all pages for empty state handling
- Use `<EmptyState>` component consistently
- Add helpful CTAs: "Add your first {entity}"

---

### UI-008: Inconsistent Card Padding

**Severity:** 🟢 Low  
**Location:** Throughout application

**Issue (from UI_UX_CONSISTENCY_AUDIT.md):**

- Some cards use `p-5`
- Some cards use `p-6`
- Some use `p-4`
- No clear pattern

**Impact:**

- Visual inconsistency
- Unprofessional appearance

**Fix Required:**

- Standardize on `p-5` for all cards
- Use `p-4` only for dense layouts (tables, compact grids)
- Document in design system

---

### UI-009: No Keyboard Navigation on Interactive Cards

**Severity:** 🟡 Medium  
**Location:** ProductCard components

**Issue:**

- Cards are clickable but not keyboard-accessible
- Missing `tabIndex={0}`
- Missing `onKeyDown` handlers for Enter/Space
- Can't navigate with keyboard alone

**Current:**

```tsx
<div onClick={navigateToDetail}>{/* card content */}</div>
```

**Expected:**

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={navigateToDetail}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigateToDetail();
    }
  }}
>
  {/* card content */}
</div>
```

**Fix Required:**

- Add keyboard support to all clickable cards
- Add focus styles
- Ensure tab order is logical

---

### UI-010: Missing Breadcrumbs on Some Pages

**Severity:** 🟢 Low  
**Location:** Detail pages

**Issue:**

- Some detail pages have breadcrumbs
- Others don't
- Inconsistent navigation experience

**Fix Required:**

- Add breadcrumbs to all detail pages
- Use consistent pattern: Module > List > Detail
- Example: `Inventory > Plant Species > Tomato`

---

## Validation & Security Issues

### VS-001: No Input Sanitization

**Severity:** 🟠 High  
**Location:** All forms

**Issue:**

- Form inputs accept any string
- No XSS prevention
- No SQL injection prevention (for future backend)
- No HTML escaping

**Example:**

```typescript
// User can input:
name: "<script>alert('xss')</script>";
notes: "'; DROP TABLE users; --";
```

**Impact:**

- XSS attacks possible if data rendered as HTML
- SQL injection risk when backend is added
- Malformed data in database

**Fix Required:**

1. Add input sanitization library (DOMPurify)
2. Sanitize all user inputs before saving
3. Use parameterized queries in backend (when implemented)
4. Validate input patterns (e.g., email format, phone format)

---

### VS-002: No File Upload Validation

**Severity:** 🟠 High  
**Location:** `src/components/ImageUpload.tsx` (if used)

**Issue:**

- No file size limits
- No file type validation
- No malware scanning
- Can upload 100MB files or executable files

**Impact:**

- Server storage exhaustion
- Malware upload risk
- Poor UX (slow uploads)

**Fix Required:**

1. Add max file size: 5MB for images
2. Validate MIME types: only image/jpeg, image/png, image/webp
3. Validate file extensions
4. Show error for invalid files

---

### VS-003: No Rate Limiting

**Severity:** 🟡 Medium  
**Location:** Form submissions

**Issue:**

- User can click "Add Chemical" 100 times rapidly
- No debouncing or throttling
- Can create duplicate entries quickly

**Impact:**

- Accidental duplicates
- Backend overload (when implemented)

**Fix Required:**

- Add debouncing to submit buttons (500ms)
- Disable button on first click
- Add loading state during submission

---

## State Management Issues

### SM-001: No Data Persistence

**Severity:** 🔴 Critical  
**Location:** Entire application

**Issue:**

- All data stored in React useState
- Page reload loses all changes
- No localStorage backup
- No backend integration

**Impact:**

- All edits lost on browser refresh
- Can't share data between users
- Not a usable production system

**Fix Required:**
**Short-term (Demo/Dev):**

1. Add localStorage persistence:
   ```typescript
   useEffect(() => {
     localStorage.setItem("chemicals", JSON.stringify(items));
   }, [items]);
   ```

**Long-term (Production):**

1. Implement Supabase backend
2. Use React Query for data fetching
3. Add mutation hooks for CRUD operations

---

### SM-002: No Optimistic Updates

**Severity:** 🟡 Medium  
**Location:** All mutations

**Issue:**

- After edit, UI waits for "save" to update
- No optimistic UI updates
- Feels slow even with mock data

**Example:**

```typescript
// Current:
const handleSave = async () => {
  await saveToBackend(data); // Wait
  refetch(); // Then update UI
};

// Better:
const handleSave = async () => {
  setItems((prev) => [...prev, newItem]); // Update UI immediately
  await saveToBackend(data); // Save in background
  // Rollback if error
};
```

**Fix Required:**

- Implement optimistic updates pattern
- Rollback on error
- Use React Query mutations

---

### SM-003: No Global State Management

**Severity:** 🟡 Medium  
**Location:** Cross-page data sharing

**Issue:**

- Each page has isolated state
- Can't share data between modules
- Example: Selecting species in inventory should update experiment form
- Prop drilling required for shared state

**Impact:**

- Can't implement features like:
  - "Recently viewed items"
  - "Shopping cart" for bulk operations
  - Global notifications

**Fix Required:**

- Add Zustand for global state:
  ```typescript
  const useAppStore = create((set) => ({
    recentItems: [],
    addRecentItem: (item) =>
      set((state) => ({
        recentItems: [item, ...state.recentItems].slice(0, 10),
      })),
  }));
  ```

---

## Missing Features

### MF-001: No Export Functionality

**Severity:** 🟡 Medium  
**Location:** All list pages

**Issue:**

- Can't export data to CSV/Excel
- Can't generate reports
- Can't backup data

**Fix Required:**

- Add "Export to CSV" button
- Use `papaparse` library
- Export filtered/sorted data

---

### MF-002: No Bulk Import from CSV

**Severity:** 🟡 Medium  
**Location:** All list pages

**Issue:**

- Must add each item manually
- No way to import existing inventory from spreadsheet
- Time-consuming for large datasets

**Fix Required:**

- Add "Import CSV" button
- Parse CSV and validate
- Show preview before committing
- Report errors for invalid rows

---

### MF-003: No Print/PDF Generation

**Severity:** 🟡 Medium  
**Location:** Detail pages, reports

**Issue:**

- Can't print lab reports
- Can't generate PDF of contract details
- Can't create delivery slips

**Fix Required:**

- Add "Print" button
- Use `react-to-print` library
- Add print stylesheet
- Optional: Generate PDF with jsPDF

---

### MF-004: No Global Search

**Severity:** 🟡 Medium  
**Location:** Navigation

**Issue:**

- Each page has own search (species, chemicals, etc.)
- Can't search across all modules
- Can't find "tomato" across species, varieties, samples, experiments

**Fix Required:**

- Add global search bar in header
- Search all entities
- Show grouped results
- Implement with Fuse.js for fuzzy matching

---

### MF-005: No Recent Items / History

**Severity:** 🟢 Low  
**Location:** Navigation

**Issue:**

- No "Recently Viewed" list
- Must navigate from scratch each time
- Poor UX for frequent access to same items

**Fix Required:**

- Track last 10 viewed items in localStorage
- Show dropdown in header
- Clear on logout

---

### MF-006: No Favorites / Bookmarks

**Severity:** 🟢 Low  
**Location:** Throughout app

**Issue:**

- Can't bookmark frequently used items
- Can't pin important experiments
- No "star" functionality

**Fix Required:**

- Add star icon to cards
- Store favorites in localStorage (or user profile)
- Add "Favorites" quick filter

---

### MF-007: No Notifications System

**Severity:** 🟡 Medium  
**Location:** Global

**Issue:**

- No notification center
- No alerts for:
  - Chemicals expiring soon
  - Equipment due for maintenance
  - Contracts approaching deadline

**Fix Required:**

1. Add notification state management
2. Add bell icon in header with badge count
3. Create notification drawer
4. Implement notification rules engine

---

### MF-008: No Activity Logging

**Severity:** 🟡 Medium  
**Location:** Throughout app

**Issue:**

- No audit trail of user actions
- Can't see "who changed what when"
- No activity feed

**Fix Required:**

1. Add `ActivityLog` table/type
2. Log all CRUD operations
3. Add "Recent Activity" widget to dashboards
4. Show user avatar + timestamp + action

---

### MF-009: No Batch Operations

**Severity:** 🟡 Medium  
**Location:** All list pages

**Issue:**

- Can't select multiple items
- Can't bulk delete, bulk edit, bulk export
- Must process items one by one

**Fix Required:**

1. Add checkboxes to list items
2. Add `<BatchActionBar>` when items selected
3. Implement actions: Delete, Export, Change Status, Assign Owner

---

### MF-010: No Mobile Responsiveness Testing

**Severity:** 🟡 Medium  
**Location:** Throughout app

**Issue:**

- Unclear if all pages are mobile-friendly
- Some tables may overflow on mobile
- Dialogs might not fit small screens

**Fix Required:**

- Test all pages on mobile viewport
- Add responsive breakpoints
- Consider mobile-specific layouts for complex pages

---

## Code Quality Issues

### CQ-001: TypeScript Strict Mode Disabled

**Severity:** 🟠 High  
**Location:** `tsconfig.json`

**Issue:**

```json
{
  "compilerOptions": {
    "strict": false, // ❌ Should be true
    "noImplicitAny": false // ❌ Should be true
  }
}
```

**Impact:**

- Loses many TypeScript benefits
- Implicit any types allowed
- Null/undefined not checked strictly
- More runtime errors

**Fix Required:**

1. Enable `"strict": true`
2. Fix resulting errors incrementally
3. Enable `"noImplicitAny": true`

---

### CQ-002: Large Page Files (600+ Lines)

**Severity:** 🟡 Medium  
**Location:** Many page files

**Issue (from SYSTEM_DESIGN_DOCUMENT.md):**

- Monolithic page files: 636-844 lines
- Hard to maintain
- Mixing concerns (forms, tables, state)

**Fix Required:**

- Extract form components to separate files
- Extract table components
- Use custom hooks for state
- Keep page files < 300 lines

---

### CQ-003: Unused Dependencies

**Severity:** 🟢 Low  
**Location:** `package.json`

**Issue (from SYSTEM_DESIGN_DOCUMENT.md):**

- `@tanstack/react-query` installed but barely used
- Should be used for all data fetching
- Currently just wraps app in QueryClientProvider

**Fix Required:**

- Use React Query properly:
  ```typescript
  const { data, isLoading } = useQuery({
    queryKey: ["chemicals"],
    queryFn: fetchChemicals,
  });
  ```

---

### CQ-004: Inconsistent Code Formatting

**Severity:** 🟢 Low  
**Location:** Throughout codebase

**Issue:**

- Some files use 2-space indent
- Some use 4-space
- Inconsistent quote styles

**Fix Required:**

- Configure Prettier
- Run `prettier --write src/**/*.{ts,tsx}`
- Add pre-commit hook

---

### CQ-005: Missing Error Boundaries

**Severity:** 🟡 Medium  
**Location:** Page components

**Issue:**

- ErrorBoundary component exists
- But not used on pages
- One error crashes entire app

**Fix Required:**

```tsx
// Wrap each page:
<ErrorBoundary>
  <PlantSpeciesPage />
</ErrorBoundary>
```

---

## Summary Statistics

| Category            | Critical | High   | Medium | Low   | Total  |
| ------------------- | -------- | ------ | ------ | ----- | ------ |
| Business Logic      | 2        | 3      | 6      | 0     | 11     |
| Type System         | 0        | 0      | 2      | 1     | 3      |
| Data Model          | 0        | 2      | 2      | 0     | 4      |
| UI/UX               | 0        | 2      | 5      | 3     | 10     |
| Validation/Security | 0        | 2      | 1      | 0     | 3      |
| State Management    | 1        | 0      | 2      | 0     | 3      |
| Missing Features    | 0        | 0      | 7      | 3     | 10     |
| Code Quality        | 0        | 1      | 2      | 2     | 5      |
| **TOTAL**           | **3**    | **10** | **27** | **9** | **49** |

---

## Prioritization Recommendations

### Phase 1: Critical Fixes (1-2 weeks)

1. **BL-001**: Add chemical quantity validation
2. **BL-003**: Enforce RBAC permissions in UI
3. **SM-001**: Add data persistence (localStorage + backend planning)

### Phase 2: High Priority (2-3 weeks)

4. **BL-002**: Add foreign key relationship validation
5. **BL-004**: Fix UserRole type mismatch
6. **DM-001**: Add audit trail fields (updatedAt, updatedBy)
7. **UI-005**: Add confirmation dialogs for delete
8. **UI-006**: Implement pagination
9. **VS-001**: Add input sanitization
10. **VS-002**: Add file upload validation

### Phase 3: Medium Priority (3-4 weeks)

11. **BL-005** to **BL-011**: Business logic improvements
12. **UI-001** to **UI-004**: UI improvements
13. **MF-007**: Notifications system
14. **MF-008**: Activity logging
15. **CQ-001**: Enable TypeScript strict mode

### Phase 4: Polish (Ongoing)

16. Missing features (export, import, print, search)
17. Code quality improvements
18. UI consistency refinements

---

## Notes

- This document catalogs **non-fixed** issues only
- Fixed issues are documented in commit history
- Issues marked as 🔴 Critical should block production deployment
- Issues marked as 🟢 Low can be addressed in maintenance cycles

**Last Reviewed:** 2026-02-16  
**Next Review:** After Phase 1 completion
