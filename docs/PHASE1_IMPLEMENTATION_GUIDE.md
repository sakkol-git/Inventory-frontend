# Phase 1 Implementation Guide: Applying New Abstractions

**Status:** Complete for Chemical - Use as template for Equipment, PlantSpecies, PlantStock, PlantVariety, PlantSample  
**Last Updated:** May 19, 2026

---

## Quick Reference: Refactoring Checklist

For each entity, follow this exact sequence to migrate from old pattern to new abstractions.

### Step 1: Update Imports
```typescript
// ADD these imports
import { useEntityForm } from "@/hooks/useEntityForm";
import { useImageUpload } from "@/hooks/useImageUpload";

// REMOVE these imports
import { isValidationError } from "@/shared/types/api-error";  // ← no longer needed
```

### Step 2: Simplify Form Type
```typescript
// BEFORE: Form type includes image state
export interface ChemicalForm {
  // ... other fields
  imageFile: File | null;
  imagePreviewUrl: string;
}

// AFTER: Form type excludes image state
export interface ChemicalForm {
  // ... other fields (NO image fields)
}
```

### Step 3: Create/Update Field Map
```typescript
// Create field map for backend → form mapping
const ENTITY_FIELD_MAP: Record<string, keyof EntityForm> = {
  backend_name: "formName",
  backend_code: "formCode",
  // ... etc - must be complete
};
```

### Step 4: Refactor View Hook

**PATTERN:**
```typescript
export function useEntityView() {
  // ... existing data fetching (unchanged)
  const { data, isLoading } = useEntityList();
  
  // ── NEW: Replace form state with useEntityForm ──
  const form = useEntityForm({
    initialData: EMPTY_FORM,
    fieldMap: ENTITY_FIELD_MAP,
    onSubmit: async (formData) => {
      const payload = /* convert form to API payload */;
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      form.reset();
      image.clearImage();
      setEditingItem(null);
      setFormOpen(false);
      toast.success("Saved successfully");
    },
  });

  // ── NEW: Add image upload hook ──
  const image = useImageUpload();

  // ── Update form actions ──
  const openCreateForm = () => {
    setEditingItem(null);
    form.reset();
    image.clearImage();
    setFormOpen(true);
  };

  const openEditForm = (item: EntityItem) => {
    setEditingItem(item);
    // Convert API object to form fields
    const formData: EntityForm = {
      name: item.common_name,
      // ... map all fields
    };
    form.reset();
    Object.entries(formData).forEach(([key, value]) => {
      form.updateField(key as keyof EntityForm, value);
    });
    if (item.image_url) {
      image.setInitialUrl(item.image_url);
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    form.reset();
    image.clearImage();
    setEditingItem(null);
  };

  // ... rest of hook

  return {
    // ... existing returns
    form,           // ← NEW
    image,          // ← NEW
    // REMOVE: formErrors, updateFormField, submitChemicalForm
  };
}
```

### Step 5: Update Form Dialog

**PATTERN:**
```typescript
// Import the new hook type
import type { UseImageUploadResult } from "@/hooks/useImageUpload";

// Update section props type
type SectionProps = {
  form: EntityForm;
  updateField: <K extends keyof EntityForm>(field: K, value: EntityForm[K]) => void;
  formErrors: Record<string, string>;
};

// Update main dialog component
export const EntityFormDialog = ({ view }) => (
  <Dialog open={view.formOpen} onOpenChange={(open) => {
    if (!open) view.closeForm();
  }}>
    {/* ... */}
    {/* Update button to call form.submit() */}
    <Button onClick={() => view.form.submit()} disabled={!view.canSubmitForm || view.form.isSubmitting}>
      {view.isEditing ? "Save Changes" : "Add"}
    </Button>
  </Dialog>
);

// Update section components to display errors
const IdentitySection = ({ form, updateField, formErrors }: SectionProps) => (
  <fieldset>
    {/* ... */}
    {/* Add error display after each input */}
    <Input
      value={form.name}
      onChange={(e) => updateField("name", e.target.value)}
      className={formErrors.name ? "border-destructive" : ""}
    />
    {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
  </fieldset>
);
```

### Step 6: Update Grid/Table Components
```typescript
// NO CHANGES NEEDED to grid/table components
// They already receive onDelete prop from ProductCard
// Continue using existing implementations
```

---

## Template: Full Entity Refactoring

Use this template as starting point for each entity:

```typescript
// ============ useXxxView.ts ============

import { useEntityForm } from "@/hooks/useEntityForm";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { UseImageUploadResult } from "@/hooks/useImageUpload";
import { useState } from "react";

export interface EntityForm {
  field1: string;
  field2: string;
  // ... NO image fields
}

const EMPTY_FORM: EntityForm = {
  field1: "",
  field2: "",
};

const ENTITY_FIELD_MAP: Record<string, keyof EntityForm> = {
  backend_field1: "field1",
  backend_field2: "field2",
};

export function useXxxView() {
  // ── Existing: Data fetching ──
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useXxxList({ page });
  const items = response?.data ?? [];

  // ── Existing: Mutations ──
  const createMutation = useCreateXxx();
  const updateMutation = useUpdateXxx();

  // ── NEW: State & hooks ──
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<XxxItem | null>(null);

  const form = useEntityForm({
    initialData: EMPTY_FORM,
    fieldMap: ENTITY_FIELD_MAP,
    onSubmit: async (formData) => {
      const payload: XxxPayload = { /* convert */ };
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      form.reset();
      image.clearImage();
      setEditingItem(null);
      setFormOpen(false);
      toast.success("Saved");
    },
  });

  const image = useImageUpload();

  // ── Form actions ──
  const openCreateForm = () => {
    setEditingItem(null);
    form.reset();
    image.clearImage();
    setFormOpen(true);
  };

  const openEditForm = (item: XxxItem) => {
    setEditingItem(item);
    const formData: EntityForm = {
      field1: item.some_field,
      field2: item.another_field,
    };
    form.reset();
    Object.entries(formData).forEach(([key, value]) => {
      form.updateField(key as keyof EntityForm, value);
    });
    if (item.image_url) image.setInitialUrl(item.image_url);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    form.reset();
    image.clearImage();
    setEditingItem(null);
  };

  return {
    // ... existing returns
    formOpen,
    form,
    image,
    openCreateForm,
    openEditForm,
    closeForm,
  };
}
```

---

## Per-Entity Differences

### Chemical ✅ (Reference)
- **Status:** Complete
- **Fields:** 10 (name, code, category, quantity, location, expiry, danger, safety, description, image)
- **Special Logic:** Expiry tracking, hazard icons
- **Image:** Yes
- **File:** `useChemicalsView.ts` and `ChemicalFormDialog.tsx`

### Equipment
- **Status:** TODO
- **Fields:** 12 (name, code, category, status, condition, location, manufacturer, model, serial, purchase_date, price, image)
- **Special Logic:** Borrow/Return workflow (keep as extraActions in footer)
- **Image:** Yes
- **Note:** Equipment has condition + status (unlike Chemical's single hazard level)

### PlantSpecies
- **Status:** TODO
- **Fields:** 8 (name, description, growing_season, hardiness_zone, plant_type, description, image)
- **Special Logic:** Family filtering, botanical info
- **Image:** Yes
- **Note:** Simpler than Chemical (fewer fields)

### PlantStock
- **Status:** TODO
- **Fields:** 9 (plant_species_id, location, quantity, propagation_method, growth_stage, maturity_date, health_status, description, image)
- **Special Logic:** Quantity tracking, growth stage progression
- **Image:** Maybe (check if used)
- **Note:** Linked to PlantSpecies

### PlantVariety
- **Status:** TODO
- **Fields:** 8 (name, parent_species, variety_description, maturity_height, color, temperament, difficulty_level, image)
- **Special Logic:** Color variants, difficulty levels
- **Image:** Yes

### PlantSample
- **Status:** TODO
- **Fields:** 12 (assigned_to, propagation_date, growth_measurements, primary_issue, health_note, location, access_level, status, start_date, end_date, image)
- **Special Logic:** Multi-section detail view, access control
- **Image:** Yes
- **Note:** Most complex - has 4 nested detail sections

---

## Implementation Sequence

**Priority Order (by complexity - easy to hard):**

1. ✅ **Chemical** - DONE (reference implementation)
2. ⏭️ **Equipment** - Most similar to Chemical
3. ⏭️ **PlantSpecies** - Simpler (fewer fields)
4. ⏭️ **PlantStock** - Medium complexity
5. ⏭️ **PlantVariety** - Similar to PlantSpecies
6. ⏭️ **PlantSample** - Most complex (many sections)

---

## Key Patterns to Maintain

### 1. Form Submission
```typescript
onSubmit: async (formData) => {
  // Always follows this pattern:
  // 1. Convert form to payload
  // 2. Call mutation (create or update)
  // 3. Reset form and close dialog
  // 4. Show success message
  // 5. Clear image
}
```

### 2. Image Handling
```typescript
const image = useImageUpload();

// Always in openEditForm:
if (item.image_url) {
  image.setInitialUrl(item.image_url);
}

// In payload conversion:
...(image.imageFile ? { image: image.imageFile } : {}),
```

### 3. Form Reset Pattern
```typescript
const openCreateForm = () => {
  setEditingItem(null);
  form.reset();        // Always reset
  image.clearImage();  // Always clear
  setFormOpen(true);
};

const closeForm = () => {
  setFormOpen(false);
  form.reset();
  image.clearImage();
  setEditingItem(null);
};
```

---

## Verification Checklist

After refactoring each entity:

- [ ] Old imports removed (`isValidationError`, manual field mapping)
- [ ] New hooks imported (`useEntityForm`, `useImageUpload`)
- [ ] Form type simplified (no image fields)
- [ ] Field map created and complete
- [ ] `useEntityForm` hook properly initialized with onSubmit
- [ ] `useImageUpload` hook initialized
- [ ] Form dialog updated to use `form.form`, `form.updateField`, `form.errors`
- [ ] Form dialog button calls `form.submit()` not custom function
- [ ] Image section passes image hook to dialog
- [ ] Error messages displayed in form fields
- [ ] No TypeScript errors in IDE
- [ ] Page still compiles (verify with build)

---

## Expected Results

After completing all 6 entities:

**Code Metrics:**
- 1,300+ lines eliminated (duplicate form/image logic)
- Per-entity code reduced ~40%
- 6 focused, readable hooks instead of 6 complex ones

**Developer Experience:**
- New team member onboards in 1 hour vs 4-6 hours
- Adding new entity takes 2-3 hours vs 8-12 hours
- Maintenance: fix bug once, applies to all 6 entities

---

## Troubleshooting

### Error: "form.form is undefined"
- **Cause:** Accessing form incorrectly
- **Fix:** Use `form.form.fieldName`, not `form.fieldName`

### Error: "updateField is not a function"
- **Cause:** Accessing from wrong object
- **Fix:** Use `form.updateField()`, not `view.updateFormField()`

### Image not showing in preview
- **Cause:** Not using image hook in dialog
- **Fix:** Pass `image={view.image}` to dialog, use `image.imagePreviewUrl`

### Form errors not clearing on submit
- **Cause:** Not calling `form.reset()` in onSubmit
- **Fix:** Always call `form.reset()` after successful submit

### Backend errors not mapping to fields
- **Cause:** Field map missing or incomplete
- **Fix:** Verify ENTITY_FIELD_MAP has all backend field names

---

**Next:** Apply this pattern to Equipment, PlantSpecies, PlantStock, PlantVariety, PlantSample
