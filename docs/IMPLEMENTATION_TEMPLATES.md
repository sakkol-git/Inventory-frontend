# Implementation Templates: Reusable Abstractions

**Reference Guide for Creating Unified Patterns**

---

## Template 1: useEntityForm Hook

**Location:** `src/hooks/useEntityForm.ts`

### Purpose
Consolidates all form state management (fields, validation, errors, submission) for any entity.

### Implementation

```typescript
import { useState, useCallback } from "react";

export interface UseEntityFormOptions<T> {
  /** Initial form data */
  initialData: T;
  
  /** Maps backend field names to form field names */
  fieldMap: Record<string, keyof T>;
  
  /** Called when form is submitted */
  onSubmit: (payload: T) => Promise<void>;
  
  /** Optional validation function */
  validate?: (form: T) => Record<keyof T, string>;
}

export interface UseEntityFormResult<T> {
  form: T;
  errors: Partial<Record<keyof T, string>>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearErrors: () => void;
  
  setBackendErrors: (backendErrors: Record<string, string[]>) => void;
  
  submit: () => Promise<void>;
  reset: () => void;
}

export function useEntityForm<T>(
  options: UseEntityFormOptions<T>
): UseEntityFormResult<T> {
  const [form, setForm] = useState<T>(options.initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialForm] = useState<T>(options.initialData);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setBackendErrors = useCallback(
    (backendErrors: Record<string, string[]>) => {
      const mapped: Partial<Record<keyof T, string>> = {};
      
      Object.entries(backendErrors).forEach(([backendField, messages]) => {
        const formField = options.fieldMap[backendField];
        if (formField && messages.length > 0) {
          mapped[formField] = messages[0]; // Take first error message
        }
      });
      
      setErrors(mapped);
    },
    [options.fieldMap]
  );

  const isValid = useCallback(() => {
    if (options.validate) {
      const validationErrors = options.validate(form);
      const hasErrors = Object.keys(validationErrors).length > 0;
      if (hasErrors) {
        setErrors(validationErrors);
      }
      return !hasErrors;
    }
    return true;
  }, [form, options]);

  const submit = useCallback(async () => {
    if (!isValid()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await options.onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, options, isValid]);

  const reset = useCallback(() => {
    setForm(initialForm);
    setErrors({});
    setIsDirty(false);
  }, [initialForm]);

  return {
    form,
    errors,
    isDirty,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    updateField,
    setFieldError,
    clearFieldError,
    clearErrors,
    setBackendErrors,
    submit,
    reset,
  };
}
```

### Usage in View Hook

```typescript
// Before (60 lines)
export function useChemicalsView() {
  const [form, setForm] = useState<ChemicalForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingItem, setEditingItem] = useState<ChemicalItem | null>(null);
  
  const updateFormField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };
  
  const submitChemicalForm = async () => {
    if (!isFormValid()) return;
    const payload = toPayload(form);
    
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setForm(EMPTY_FORM);
      setEditingItem(null);
      toast.success("Chemical saved");
    } catch (err) {
      if (isValidationError(err)) {
        setFormErrors(mapBackendErrors(err.response.data.errors));
      }
      toast.error("Failed to save");
    }
  };
  
  // ... more form handlers
}

// After (20 lines)
export function useChemicalsView() {
  const [editingItem, setEditingItem] = useState<ChemicalItem | null>(null);
  
  const form = useEntityForm({
    initialData: EMPTY_CHEMICAL,
    fieldMap: CHEMICAL_FIELD_MAP,
    onSubmit: async (formData) => {
      const payload = toPayload(formData);
      
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      
      setEditingItem(null);
      toast.success("Chemical saved");
    },
  });
  
  // ... minimal additional logic
}
```

---

## Template 2: useImageUpload Hook

**Location:** `src/hooks/useImageUpload.ts`

### Purpose
Handles image file selection, preview URL generation, and file state management.

### Implementation

```typescript
import { useState, useCallback } from "react";

export interface UseImageUploadResult {
  /** Selected File object */
  imageFile: File | null;
  
  /** Data URL for preview */
  imagePreviewUrl: string;
  
  /** Original URL (from server) */
  imageUrl: string;
  
  /** Set image from file */
  handleImageChange: (file: File | null) => void;
  
  /** Set image URL (e.g., from server response) */
  setImageUrl: (url: string) => void;
  
  /** Clear all image data */
  clearImage: () => void;
  
  /** Set initial URL (for edit mode) */
  setInitialUrl: (url: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function useImageUpload(initialUrl?: string): UseImageUploadResult {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(initialUrl ?? "");
  const [imageUrl, setImageUrl] = useState<string>(initialUrl ?? "");

  const handleImageChange = useCallback((file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImagePreviewUrl("");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error("File too large. Maximum size is 5MB.");
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error("Invalid file type. Allowed types: JPEG, PNG, WebP, GIF.");
      return;
    }

    setImageFile(file);

    // Generate preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreviewUrl(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const setInitialUrl = useCallback((url: string) => {
    setImageUrl(url);
    setImagePreviewUrl(url);
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreviewUrl("");
    setImageUrl("");
  }, []);

  return {
    imageFile,
    imagePreviewUrl: imagePreviewUrl || imageUrl,
    imageUrl,
    handleImageChange,
    setImageUrl,
    clearImage,
    setInitialUrl,
  };
}
```

### Usage in View Hook

```typescript
export function useChemicalsView() {
  const image = useImageUpload();
  
  const openEditForm = (item: ChemicalItem) => {
    setEditingItem(item);
    // Pre-populate with existing image
    if (item.image_url) {
      image.setInitialUrl(item.image_url);
    }
  };
  
  return {
    image,
    // ... other properties
  };
}
```

### Usage in Form Dialog

```typescript
export const ChemicalFormDialog = ({ view, onClose }) => {
  return (
    <Dialog open={view.formOpen} onOpenChange={onClose}>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => view.image.handleImageChange(e.target.files?.[0] ?? null)}
        />
        {view.image.imagePreviewUrl && (
          <img
            src={view.image.imagePreviewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded"
          />
        )}
        <button onClick={() => view.image.clearImage()}>Clear Image</button>
      </div>
    </Dialog>
  );
};
```

---

## Template 3: GridTableRenderer Component

**Location:** `src/features/inventory/components/GridTableRenderer.tsx`

### Purpose
Unified component that handles view mode switching between grid and table views.

### Implementation

```typescript
import React from "react";
import { ViewMode } from "@/shared/components/ViewToggle";

export interface GridTableRendererProps<T> {
  /** Items to display */
  items: T[];
  
  /** Current view mode */
  viewMode: ViewMode;
  
  /** Whether to show empty state */
  isEmpty: boolean;
  
  /** Grid view component */
  GridComponent: React.ComponentType<any>;
  
  /** Table view component */
  TableComponent: React.ComponentType<any>;
  
  /** Props to pass to grid component */
  gridProps?: Record<string, any>;
  
  /** Props to pass to table component */
  tableProps?: Record<string, any>;
  
  /** Empty state view */
  emptyState: React.ReactNode;
}

export function GridTableRenderer<T>(
  props: GridTableRendererProps<T>
): React.ReactElement {
  const {
    items,
    viewMode,
    isEmpty,
    GridComponent,
    TableComponent,
    gridProps = {},
    tableProps = {},
    emptyState,
  } = props;

  if (isEmpty) {
    return <div>{emptyState}</div>;
  }

  if (viewMode === "grid") {
    return <GridComponent items={items} {...gridProps} />;
  }

  return <TableComponent items={items} {...tableProps} />;
}
```

### Usage in Page

```typescript
// Before (50 lines)
const Chemicals = () => {
  const view = useChemicalsView();

  return (
    <ListPage
      icon={FlaskConical}
      title="Chemicals"
      // ... other props
    >
      {view.isEmpty ? (
        <EmptyState
          icon={FlaskConical}
          title="No chemicals found"
          description="Try adjusting your search."
        />
      ) : view.viewMode === "grid" ? (
        <ChemicalGrid
          items={view.filteredItems}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteChemical}
        />
      ) : (
        <ChemicalTable
          items={view.filteredItems}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteChemical}
        />
      )}
    </ListPage>
  );
};

// After (30 lines)
const Chemicals = () => {
  const view = useChemicalsView();

  return (
    <ListPage
      icon={FlaskConical}
      title="Chemicals"
      // ... other props
    >
      <GridTableRenderer
        items={view.filteredItems}
        viewMode={view.viewMode}
        isEmpty={view.isEmpty}
        GridComponent={ChemicalGrid}
        TableComponent={ChemicalTable}
        gridProps={{
          onNavigate: view.navigateToDetail,
          onEdit: view.openEditForm,
          onDelete: view.requestDeleteChemical,
        }}
        tableProps={{
          onNavigate: view.navigateToDetail,
          onEdit: view.openEditForm,
          onDelete: view.requestDeleteChemical,
        }}
        emptyState={
          <EmptyState
            icon={FlaskConical}
            title="No chemicals found"
            description="Try adjusting your search."
          />
        }
      />
    </ListPage>
  );
};
```

---

## Template 4: useFormValidation Hook

**Location:** `src/hooks/useFormValidation.ts`

### Purpose
Centralizes validation error handling and field mapping logic.

### Implementation

```typescript
import { useState, useCallback } from "react";
import { isValidationError } from "@/shared/types/api-error";

export interface UseFormValidationOptions {
  /** Maps backend field names to form field names */
  fieldMap: Record<string, string>;
  
  /** Called when a field error is set */
  onFieldError?: (field: string, error: string) => void;
}

export interface UseFormValidationResult {
  /** Map of field → error message */
  fieldErrors: Record<string, string>;
  
  /** Handle backend validation error */
  handleValidationError: (err: unknown) => Record<string, string>;
  
  /** Set error for a specific field */
  setFieldError: (field: string, error: string) => void;
  
  /** Clear error for a specific field */
  clearFieldError: (field: string) => void;
  
  /** Clear all errors */
  clearAll: () => void;
  
  /** Check if specific field has error */
  hasError: (field: string) => boolean;
  
  /** Get error for specific field */
  getError: (field: string) => string | undefined;
}

export function useFormValidation(
  options: UseFormValidationOptions
): UseFormValidationResult {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleValidationError = useCallback(
    (err: unknown): Record<string, string> => {
      if (!isValidationError(err)) {
        return {};
      }

      const mapped: Record<string, string> = {};
      const backendErrors = err.response.data.errors;

      Object.entries(backendErrors).forEach(([backendField, messages]) => {
        const formField = options.fieldMap[backendField];
        if (formField && Array.isArray(messages) && messages.length > 0) {
          mapped[formField] = messages[0]; // Take first error message
        }
      });

      setFieldErrors(mapped);
      return mapped;
    },
    [options.fieldMap]
  );

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    options.onFieldError?.(field, error);
  }, [options]);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasError = useCallback(
    (field: string) => !!fieldErrors[field],
    [fieldErrors]
  );

  const getError = useCallback(
    (field: string) => fieldErrors[field],
    [fieldErrors]
  );

  return {
    fieldErrors,
    handleValidationError,
    setFieldError,
    clearFieldError,
    clearAll,
    hasError,
    getError,
  };
}
```

### Usage in View Hook

```typescript
export function useChemicalsView() {
  const validation = useFormValidation({
    fieldMap: CHEMICAL_FIELD_MAP,
  });

  const submitChemicalForm = async () => {
    try {
      // ... submission logic
    } catch (err) {
      validation.handleValidationError(err);
      toast.error("Failed to save chemical");
    }
  };

  return {
    formErrors: validation.fieldErrors,
    // ... other properties
  };
}
```

---

## Template 5: useEntityFilter Hook

**Location:** `src/hooks/useEntityFilter.ts`

### Purpose
Standardizes filter state management across all entities.

### Implementation

```typescript
import { useState, useCallback, useMemo } from "react";

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface UseEntityFilterOptions {
  /** Default filter values */
  defaultFilters: Record<string, string | number>;
  
  /** Available options per dimension */
  availableOptions: Record<string, FilterOption[]>;
  
  /** Dimension display names */
  dimensionLabels?: Record<string, string>;
}

export interface UseEntityFilterResult {
  /** Current filter values */
  filters: Record<string, string | number>;
  
  /** Update a single filter dimension */
  updateFilter: (dimension: string, value: string | number) => void;
  
  /** Update multiple filters at once */
  updateFilters: (updates: Record<string, string | number>) => void;
  
  /** Reset to default filters */
  resetFilters: () => void;
  
  /** Check if any filters are active (non-default) */
  hasActiveFilters: boolean;
  
  /** Get query params suitable for API calls */
  asQueryParams: () => Record<string, unknown>;
  
  /** Get display label for a filter dimension */
  getDimensionLabel: (dimension: string) => string;
  
  /** Get label for a specific filter value */
  getOptionLabel: (dimension: string, value: string | number) => string;
}

export function useEntityFilter(
  options: UseEntityFilterOptions
): UseEntityFilterResult {
  const [filters, setFilters] = useState<Record<string, string | number>>(
    options.defaultFilters
  );

  const updateFilter = useCallback((dimension: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [dimension]: value,
    }));
  }, []);

  const updateFilters = useCallback((updates: Record<string, string | number>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(options.defaultFilters);
  }, [options.defaultFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(
      ([key, value]) => options.defaultFilters[key] !== value
    );
  }, [filters, options.defaultFilters]);

  const asQueryParams = useCallback((): Record<string, unknown> => {
    const params: Record<string, unknown> = {};

    Object.entries(filters).forEach(([key, value]) => {
      // Don't include filters that match defaults
      if (value !== options.defaultFilters[key]) {
        params[key] = value;
      }
    });

    return params;
  }, [filters, options.defaultFilters]);

  const getDimensionLabel = useCallback(
    (dimension: string) => {
      return options.dimensionLabels?.[dimension] ?? dimension;
    },
    [options.dimensionLabels]
  );

  const getOptionLabel = useCallback(
    (dimension: string, value: string | number) => {
      const options_list = options.availableOptions[dimension] ?? [];
      return options_list.find((opt) => opt.value === value)?.label ?? String(value);
    },
    [options.availableOptions]
  );

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    asQueryParams,
    getDimensionLabel,
    getOptionLabel,
  };
}
```

### Usage in View Hook

```typescript
export function useChemicalsView() {
  const filters = useEntityFilter({
    defaultFilters: {
      status: "all",
      hazard: "all",
    },
    availableOptions: {
      status: [
        { value: "all", label: "All Chemicals" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      hazard: [
        { value: "all", label: "All Hazard Levels" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
  });

  const queryParams = useMemo(
    () => ({
      page,
      search: searchQuery,
      ...filters.asQueryParams(),
    }),
    [page, searchQuery, filters]
  );

  const { data } = useChemicalList(queryParams);

  return {
    filters,
    statusFilter: filters.filters.status,
    updateStatusFilter: (v) => filters.updateFilter("status", v),
    hazardFilter: filters.filters.hazard,
    updateHazardFilter: (v) => filters.updateFilter("hazard", v),
    // ... other properties
  };
}
```

---

## Template 6: EntityCardFooter Component

**Location:** `src/features/inventory/components/EntityCardFooter.tsx`

### Purpose
Unified footer for all entity cards with consistent action buttons.

### Implementation

```typescript
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EntityCardFooterProps {
  /** Edit handler */
  onEdit: () => void;
  
  /** Delete handler */
  onDelete: () => void;
  
  /** Extra actions (e.g., Borrow button for Equipment) */
  extraActions?: React.ReactNode;
  
  /** Visual variant */
  variant?: "standard" | "compact" | "with-actions";
  
  /** Additional CSS classes */
  className?: string;
}

export const EntityCardFooter = ({
  onEdit,
  onDelete,
  extraActions,
  variant = "standard",
  className,
}: EntityCardFooterProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handleEditClick}
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={handleDeleteClick}
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        {extraActions}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pt-3 mt-3 border-t border-border/40 flex items-center justify-between gap-2",
        className
      )}
    >
      <div className="flex-1" />

      {extraActions && <div className="flex items-center gap-1">{extraActions}</div>}

      <Button
        size="sm"
        variant="ghost"
        className="h-9 w-9 p-0 shrink-0"
        onClick={handleEditClick}
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className="h-9 w-9 p-0 shrink-0 text-destructive hover:text-destructive"
        onClick={handleDeleteClick}
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
```

### Usage in Grid Component

```typescript
export const ChemicalCard = ({ item, onNavigate, onEdit, onDelete }) => {
  return (
    <ProductCard
      image={item.image_url}
      title={item.common_name}
      // ... other props
      onClick={() => onNavigate(item.id)}
      onEdit={() => onEdit(item)}
      onDelete={() => onDelete(item)}
    >
      {/* Card content */}
    </ProductCard>
  );
};

// Alternative: If not using ProductCard
export const ChemicalCard = ({ item, onNavigate, onEdit, onDelete }) => {
  return (
    <div onClick={() => onNavigate(item.id)}>
      <div>{item.common_name}</div>
      {/* Card content */}
      <EntityCardFooter
        onEdit={() => onEdit(item)}
        onDelete={() => onDelete(item)}
      />
    </div>
  );
};
```

---

## Checklist: Implementing New Abstractions

### For Each Abstraction

- [ ] Create hook/component file
- [ ] Write comprehensive JSDoc comments
- [ ] Add TypeScript types
- [ ] Export from appropriate index.ts
- [ ] Write unit tests
- [ ] Update one entity implementation as reference
- [ ] Document usage examples
- [ ] Update ARCHITECTURAL_AUDIT.md

### For Entity Updates

- [ ] Replace duplicate logic with hook/component
- [ ] Update return object type
- [ ] Test form submission
- [ ] Test validation error handling
- [ ] Test view mode toggling
- [ ] Test edit/delete flows
- [ ] Verify no console errors

---

**Document Version:** 1.0  
**Last Updated:** May 19, 2026  
**Status:** Reference Implementation Ready
