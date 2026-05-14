# Page Migration Guide — Using the New Component System

> Step-by-step instructions for migrating existing pages to the production component architecture.

---

## Before & After: Typical Entity List Page

### BEFORE (400+ lines, repeated patterns)

```tsx
// src/pages/chemicals/ChemicalsPage.tsx — BEFORE

import { useState, useMemo } from "react";
import { Plus, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";
import SearchFilter from "@/components/shared/SearchFilter";
import { ViewToggle } from "@/components/shared/ViewToggle";
import {
  useChemicals,
  useCreateChemical,
  useDeleteChemical,
} from "@/hooks/useChemicalQuery";

export default function ChemicalsPage() {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: chemicals, isLoading, isError, refetch } = useChemicals();
  const createMutation = useCreateChemical();
  const deleteMutation = useDeleteChemical();

  const filtered = useMemo(() => {
    if (!chemicals) return [];
    return chemicals.filter(
      (c) =>
        c.common_name.toLowerCase().includes(query.toLowerCase()) &&
        (status === "all" || c.category === status),
    );
  }, [chemicals, query, status]);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <PageHeader
        icon={FlaskConical}
        title="Chemicals"
        description="Manage chemical inventory"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Chemical
          </Button>
        }
      />

      {/* Stats rendered manually... */}
      <div className="flex flex-row gap-4">
        {/* 4 stat cards copy-pasted... */}
      </div>

      <div className="flex items-center gap-3">
        <SearchFilter
          query={query}
          onQueryChange={setQuery}
          placeholder="Search..."
        >
          {/* Status filter inline... */}
        </SearchFilter>
        <ViewToggle current={viewMode} onChange={setViewMode} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-48" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p>Error loading chemicals</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p>No chemicals found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((chemical) => (
            <Card key={chemical.id}>
              <CardContent>{/* ... */}</CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <table>{/* ... table markup ... */}</table>
      )}

      {/* Dialog for create... */}
      {/* Dialog for delete confirm... */}
    </div>
  );
}
```

### AFTER (~80 lines, composed)

```tsx
// src/pages/chemicals/ChemicalsPage.tsx — AFTER

import { Plus, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListPage } from "@/components/composed";
import { EntityGrid, EntityGridSkeleton } from "@/components/composed";
import { StatusSelect } from "@/components/composed";
import { EntityFormDialog } from "@/components/composed";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useChemicalsView } from "./useChemicalsView";
import { ChemicalCard } from "./ChemicalCard";
import { ChemicalForm } from "./ChemicalForm";
import { CATEGORY_OPTIONS } from "./constants";

export default function ChemicalsPage() {
  const view = useChemicalsView();

  return (
    <>
      <ListPage
        header={{
          icon: FlaskConical,
          title: "Chemicals",
          description: "Manage chemical inventory",
        }}
        stats={view.stats}
        search={{
          query: view.query,
          onQueryChange: view.setQuery,
          placeholder: "Search chemicals...",
          entityName: "chemicals",
        }}
        viewToggle={{
          current: view.viewMode,
          onChange: view.setViewMode,
        }}
        async={{
          isLoading: view.isLoading,
          isError: view.isError,
          isEmpty: view.isEmpty,
          onRetry: view.refetch,
        }}
        actions={
          <Button onClick={view.openCreateForm}>
            <Plus className="h-4 w-4 mr-2" /> Add Chemical
          </Button>
        }
        filterChildren={
          <StatusSelect
            options={CATEGORY_OPTIONS}
            value={view.category}
            onChange={view.setCategory}
            aria-label="Filter by category"
          />
        }
        skeleton={<EntityGridSkeleton count={8} />}
        emptyState={
          <EmptyState
            icon="flask"
            title="No chemicals found"
            description="Try adjusting your search or add a new chemical."
          />
        }
      >
        <EntityGrid
          items={view.items}
          keyExtractor={(c) => c.id}
          renderItem={(chemical) => (
            <ChemicalCard
              chemical={chemical}
              onEdit={view.openEditForm}
              onDelete={view.openDeleteConfirm}
            />
          )}
        />
      </ListPage>

      <EntityFormDialog
        open={view.formOpen}
        onOpenChange={view.setFormOpen}
        title={view.editingItem ? "Edit Chemical" : "Add Chemical"}
        isPending={view.isSubmitting}
        onSubmit={view.handleSubmit}
      >
        <ChemicalForm
          defaultValues={view.editingItem}
          onSubmit={view.handleSubmit}
        />
      </EntityFormDialog>

      <ConfirmDialog
        open={view.deleteOpen}
        onOpenChange={view.setDeleteOpen}
        title="Delete Chemical"
        description="This action cannot be undone."
        isPending={view.isDeleting}
        onConfirm={view.handleDelete}
      />
    </>
  );
}
```

---

## Step-by-Step Migration Process

### Step 1: Extract the View Hook

Move ALL state, queries, mutations, and computed values into a `useXxxView` hook:

```tsx
// src/pages/chemicals/useChemicalsView.ts
import { useState, useMemo } from "react";
import type { ViewMode } from "@/components/shared/ViewToggle";
import type { Stat } from "@/components/shared/QuickStats";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useChemicals,
  useCreateChemical,
  useUpdateChemical,
  useDeleteChemical,
} from "@/hooks/useChemicalQuery";

export function useChemicalsView() {
  // ─── Queries ───────────────────────
  const { data: chemicals, isLoading, isError, refetch } = useChemicals();
  const createMutation = useCreateChemical();
  const updateMutation = useUpdateChemical();
  const deleteMutation = useDeleteChemical();

  // ─── UI State ──────────────────────
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Chemical | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // ─── Derived Data ──────────────────
  const filtered = useMemo(() => {
    if (!chemicals) return [];
    return chemicals.filter((c) => {
      const matchesQuery = c.common_name
        .toLowerCase()
        .includes(debouncedQuery.toLowerCase());
      const matchesCategory = category === "all" || c.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [chemicals, debouncedQuery, category]);

  const stats: Stat[] = useMemo(
    () => [
      {
        label: "Total",
        value: chemicals?.length ?? 0,
        color: "primary" as const,
      },
      {
        label: "Low Stock",
        value: chemicals?.filter((c) => c.quantity < 10).length ?? 0,
        color: "warning" as const,
      },
      {
        label: "Expired",
        value: chemicals?.filter((c) => c.is_expired).length ?? 0,
        color: "destructive" as const,
      },
      { label: "In Results", value: filtered.length, color: "info" as const },
    ],
    [chemicals, filtered],
  );

  // ─── Actions ───────────────────────
  const openCreateForm = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const openEditForm = (chemical: Chemical) => {
    setEditingItem(chemical);
    setFormOpen(true);
  };
  const openDeleteConfirm = (id: number) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleSubmit = async (data: ChemicalPayload) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeleteOpen(false);
    }
  };

  return {
    // Data
    items: filtered,
    stats,
    // Filters
    query,
    setQuery,
    category,
    setCategory,
    viewMode,
    setViewMode,
    // Async state
    isLoading,
    isError,
    isEmpty: !isLoading && filtered.length === 0,
    refetch,
    // Form state
    formOpen,
    setFormOpen,
    deleteOpen,
    setDeleteOpen,
    editingItem,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    // Actions
    openCreateForm,
    openEditForm,
    openDeleteConfirm,
    handleSubmit,
    handleDelete,
  };
}
```

### Step 2: Extract Entity Card

If the page has a grid view, extract the entity card:

```tsx
// src/pages/chemicals/ChemicalCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import type { Chemical } from "@/types/chemical";

interface ChemicalCardProps {
  chemical: Chemical;
  onEdit: (chemical: Chemical) => void;
  onDelete: (id: number) => void;
}

export function ChemicalCard({
  chemical,
  onEdit,
  onDelete,
}: ChemicalCardProps) {
  return (
    <Card className="hover-lift">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-base">{chemical.common_name}</CardTitle>
        <Badge variant={chemical.is_expired ? "destructive" : "secondary"}>
          {chemical.category}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Qty: {chemical.quantity} • {chemical.storage_location ?? "Unassigned"}
        </p>
        {chemical.expiry_date && (
          <p className="text-xs text-muted-foreground">
            Expires: {formatDate(chemical.expiry_date)}
          </p>
        )}
        <div className="flex gap-1 pt-2">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(chemical)}
            aria-label="Edit chemical"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(chemical.id)}
            aria-label="Delete chemical"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Replace Page Component

Replace the monolithic page with the `ListPage` composition (see "AFTER" above).

### Step 4: Accessibility Pass

- Verify tab order
- Check `aria-label` on icon buttons
- Run `npm run lint` to check a11y rules
- Test with keyboard only (no mouse)

---

## Checklist per Entity Page

Apply this migration to each page:

| Page            | Status                                     |
| --------------- | ------------------------------------------ |
| Chemicals       | ❌ Not migrated                            |
| Equipment       | ❌ Not migrated                            |
| Plant Samples   | ❌ Not migrated                            |
| Plant Species   | ❌ Not migrated                            |
| Plant Varieties | ❌ Not migrated                            |
| Plant Stocks    | ❌ Not migrated                            |
| Borrow Records  | ❌ Not migrated                            |
| Transactions    | ❌ Not migrated                            |
| Users (Admin)   | ❌ Not migrated                            |
| Dashboard       | ❌ (uses DashboardLayout, not ListPage)    |
| Reports         | ❌ (uses SecondaryPageShell, lazy loading) |

---

## Component Mapping Reference

| Old Pattern                                                            | New Component                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------ |
| `<div className="space-y-6 animate-fade-in p-6">`                      | `<PageShell>`                                    |
| `<PageHeader>` + `<QuickStats>` + `<SearchFilter>` + `if/else loading` | `<ListPage>`                                     |
| `<div className="grid grid-cols-1 md:grid-cols-2 ...">`                | `<EntityGrid>`                                   |
| Loading skeleton loop                                                  | `<EntityGridSkeleton>`                           |
| `<div className="overflow-x-auto"><table>`                             | `<DataTableWrapper>`                             |
| Loading/error/empty if-else chain                                      | `<AsyncContent>`                                 |
| Dialog for create/edit form                                            | `<EntityFormDialog>`                             |
| Delete confirmation dialog                                             | `<ConfirmDialog isPending={...}>`                |
| Breadcrumb + page content                                              | `<SecondaryPageShell>`                           |
| Dashboard widget grid                                                  | `<DashboardLayout>` / `<DashboardLayout.Widget>` |
| Auth form wrapper                                                      | `<AuthLayout>`                                   |
