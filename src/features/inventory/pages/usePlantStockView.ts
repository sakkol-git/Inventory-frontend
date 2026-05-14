/* ═══════════════════════════════════════════════════════════════════════════
 * usePlantStockView — All state + logic for the Plant Stock Management page.
 *
 * Connects to Laravel backend via React Query + plantStockService.
 * API response is nested (inventory/relations).
 * ═══════════════════════════════════════════════════════════════════════════ */

import { usePlantSpeciesList } from "@/features/inventory/services/plantSpeciesService";
import {
    useCreatePlantStock,
    useDeletePlantStock,
    usePlantStockList,
    useUpdatePlantStock,
} from "@/features/inventory/services/plantStockService";
import type {
    PlantStockApi,
    PlantStockCreatePayload,
} from "@/features/inventory/types";
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
import { isValidationError } from "@/shared/types/api-error";
import type { StockStatus } from "@/shared/types/enums";
import { formatEnumLabel, STOCK_STATUSES } from "@/shared/types/enums";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

export type StockItem = PlantStockApi;

export interface StockForm {
  speciesId: string;
  varietyId: string;
  sampleId: string;
  quantity: string;
  reservedQuantity: string;
  status: string;
}

const EMPTY_FORM: StockForm = {
  speciesId: "",
  varietyId: "",
  sampleId: "",
  quantity: "",
  reservedQuantity: "0",
  status: "available",
};

// ─── Constants ─────────────────────────────────────────────────────────────

export const statusStyle = (status: string): string => {
  switch (status) {
    case "available":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950 px-2 py-1 rounded-lg text-xs font-medium";
    case "reserved":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950 px-2 py-1 rounded-lg text-xs font-medium";
    case "out_of_stock":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950 px-2 py-1 rounded-lg text-xs font-medium";
    default:
      return "text-muted-foreground bg-muted px-2 py-1 rounded-lg text-xs font-medium";
  }
};

export { formatEnumLabel, STOCK_STATUSES };

// ─── Helpers ───────────────────────────────────────────────────────────────

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

// ─── Backend Error Field Map ────────────────────────────────────────────────

const BACKEND_FIELD_MAP: Record<string, keyof StockForm> = {
  plant_species_id: "speciesId",
  plant_variety_id: "varietyId",
  plant_sample_id: "sampleId",
  quantity: "quantity",
  reserved_quantity: "reservedQuantity",
  status: "status",
};

type FormErrors = Partial<Record<keyof StockForm, string>>;

function mapBackendErrors(errors: Record<string, string[]>): FormErrors {
  const mapped: FormErrors = {};
  for (const [key, msgs] of Object.entries(errors)) {
    const field = BACKEND_FIELD_MAP[key];
    if (field) mapped[field] = msgs[0];
  }
  return mapped;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function usePlantStockView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const speciesParam = searchParams.get("species") || "";

  // ── Data from backend (paginated) ──
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(speciesParam);
  const [statusFilter, setStatusFilter] = useState("all");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;
  if (statusFilter !== "all") queryParams.status = statusFilter;

  const { data: response, isLoading, isError } = usePlantStockList(queryParams);

  const rawItems = response?.data ?? [];
  const meta = response?.meta;
  const items: StockItem[] = [...rawItems].sort((a, b) => a.id - b.id);

  // ── Species for dropdown ──
  const { data: speciesResponse } = usePlantSpeciesList({ per_page: 100 });
  const species = speciesResponse?.data ?? [];

  // ── Mutations ──
  const createMutation = useCreatePlantStock();
  const updateMutation = useUpdatePlantStock();
  const deleteMutation = useDeletePlantStock();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState<StockForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // ── Delete confirmation ──
  const deleteDialog = useConfirmDialog();

  // ── Derived ──
  const filteredItems = items; // Server-side filtering

  const totalPlants = items.reduce((sum, s) => sum + s.inventory.total, 0);
  const totalAvailable = items.reduce(
    (sum, s) => sum + s.inventory.net_available,
    0,
  );

  const quickStats: Stat[] = [
    {
      label: "Total Stock",
      value: meta?.total ?? items.length,
      color: "primary",
    },
    {
      label: "Total Plants",
      value: totalPlants.toLocaleString(),
      color: "primary",
    },
    {
      label: "Available",
      value: totalAvailable.toLocaleString(),
      color: "muted",
    },
    {
      label: "Out of Stock",
      value: items.filter((s) => s.inventory.status === "out_of_stock").length,
      color: "destructive",
    },
  ];

  const isEditing = editingItem !== null;
  const formTitle = isEditing ? "Edit Stock Entry" : "Add New Stock";
  const formDescription = isEditing
    ? `Update details for stock #${editingItem!.id}.`
    : "Fill in the details to start tracking a new plant stock entry.";

  const canSubmitForm = Boolean(form.speciesId && form.quantity);

  // ── Actions ──
  const navigateToDetail = (id: number) =>
    navigate(`/inventory/products/stock/${id}`);
  const updateSearchQuery = (q: string) => setSearchQuery(q);
  const switchViewMode = (mode: ViewMode) => setViewMode(mode);
  const updateStatusFilter = (s: string) => setStatusFilter(s);

  const openCreateForm = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const openEditForm = (stock: StockItem) => {
    setEditingItem(stock);
    setForm(stockToForm(stock));
    setFormErrors({});
    setFormOpen(true);
  };

  const updateFormField = <K extends keyof StockForm>(
    field: K,
    value: StockForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitStockForm = () => {
    if (!form.speciesId || !form.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }
    setFormErrors({});

    const payload = formToPayload(form);

    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, payload },
        {
          onSuccess: () => {
            setFormOpen(false);
            setForm(EMPTY_FORM);
            setEditingItem(null);
            toast.success("Stock entry updated successfully");
          },
          onError: (err) => {
            if (isValidationError(err)) {
              setFormErrors(mapBackendErrors(err.response.data.errors));
            }
            toast.error(
              isValidationError(err)
                ? err.response.data.message
                : "Failed to update stock entry",
            );
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setFormOpen(false);
          setForm(EMPTY_FORM);
          setEditingItem(null);
          toast.success("Stock entry added successfully");
        },
        onError: (err) => {
          if (isValidationError(err)) {
            setFormErrors(mapBackendErrors(err.response.data.errors));
          }
          toast.error(
            isValidationError(err)
              ? err.response.data.message
              : "Failed to create stock entry",
          );
        },
      });
    }
  };

  // ── Delete Stock (with confirmation) ──
  const requestDeleteStock = (stock: StockItem) => {
    const speciesName =
      stock.relations.species?.common_name || `Stock #${stock.id}`;
    deleteDialog.requestConfirm(String(stock.id), {
      title: `Delete ${speciesName} stock?`,
      description: `This will permanently remove stock entry #${stock.id}.`,
    });
  };

  const confirmDeleteStock = () => {
    deleteDialog.confirm((id) => {
      deleteMutation.mutate(Number(id), {
        onSuccess: () => toast.success("Stock entry deleted"),
        onError: () => toast.error("Failed to delete stock entry"),
      });
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    filteredItems,
    totalCount: meta?.total ?? items.length,
    quickStats,
    searchQuery,
    updateSearchQuery,
    viewMode,
    switchViewMode,
    statusFilter,
    updateStatusFilter,
    navigateToDetail,
    formOpen,
    isEditing,
    formTitle,
    formDescription,
    form,
    formErrors,
    canSubmitForm,
    openCreateForm,
    openEditForm,
    closeForm,
    updateFormField,
    submitStockForm,
    species,
    // Delete
    deleteDialog,
    requestDeleteStock,
    confirmDeleteStock,
    isLoading,
    isError,
    isSubmitting,
    page,
    setPage,
    meta,
  };
}
