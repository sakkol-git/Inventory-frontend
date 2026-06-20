/* ═══════════════════════════════════════════════════════════════════════════
 * usePlantStockView — All state + logic for the Plant Stock Management page.
 *
 * Connects to Laravel backend via React Query + plantStockService.
 * API response is nested (inventory/relations).
 * ═══════════════════════════════════════════════════════════════════════════ */

import { usePlantSampleList } from "../../services";
import {
    useCreatePlantStock,
    useDeletePlantStock,
    usePlantStockList,
    useUpdatePlantStock,
    type AdjustStockAction,
} from "@/features/inventory/services/plantStockService";
import type {
    PlantStockApi,
    PlantStockCreatePayload,
} from "@/features/inventory/types";
import { useEntityForm } from "@/hooks/useEntityForm";
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
import type { StockStatus } from "@/shared/types/enums";
import { formatEnumLabel, STOCK_STATUSES } from "@/shared/types/enums";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

export type StockItem = PlantStockApi;

export interface StockForm {
  sampleId: string;
  quantity: string;
  reservedQuantity: string;
  status: string;
}

const EMPTY_FORM: StockForm = {
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

function stockToForm(item: PlantStockApi): StockForm {
  return {
    sampleId: item.relations.sample ? String(item.relations.sample.id) : "",
    quantity: String(item.inventory.total),
    reservedQuantity: String(item.inventory.reserved),
    status: item.inventory.status,
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────
// Maps backend field names to form field names for useEntityForm hook

const PLANT_STOCK_FIELD_MAP: Record<string, keyof StockForm> = {
  plant_sample_id: "sampleId",
  quantity: "quantity",
  reserved_quantity: "reservedQuantity",
  status: "status",
};

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

  // ── Samples for dropdown ──
  const { data: samplesResponse } = usePlantSampleList({ per_page: 100 });
  const samples = samplesResponse?.data ?? [];

  // ── Mutations ──
  const createMutation = useCreatePlantStock();
  const updateMutation = useUpdatePlantStock();
  const deleteMutation = useDeletePlantStock();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustDialogItem, setAdjustDialogItem] = useState<StockItem | null>(null);
  const [adjustDialogAction, setAdjustDialogAction] = useState<AdjustStockAction | null>(null);

  // ── Using new abstractions ──
  const form = useEntityForm({
    initialData: EMPTY_FORM,
    fieldMap: PLANT_STOCK_FIELD_MAP,
    onSubmit: async (formData) => {
      const payload: PlantStockCreatePayload = {
        plant_sample_id: formData.sampleId ? Number(formData.sampleId) : null,
        quantity: Number(formData.quantity) || 0,
        reserved_quantity: Number(formData.reservedQuantity) || 0,
        status: formData.status as StockStatus,
      };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      form.reset();
      setEditingItem(null);
      setFormOpen(false);
      toast.success(
        editingItem
          ? "Stock entry updated successfully"
          : "Stock entry added successfully",
      );
    },
  });

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

  const canSubmitForm = Boolean(form.form.sampleId && form.form.quantity);

  // ── Actions ──
  const navigateToDetail = (id: number) =>
    navigate(`/inventory/products/stock/${id}`);
  const updateSearchQuery = (q: string) => setSearchQuery(q);
  const switchViewMode = (mode: ViewMode) => setViewMode(mode);
  const updateStatusFilter = (s: string) => setStatusFilter(s);

  const openCreateForm = () => {
    form.reset();
    setEditingItem(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    form.reset();
    setEditingItem(null);
  };

  const openEditForm = (stock: StockItem) => {
    form.reset();
    setEditingItem(stock);
    Object.entries(stockToForm(stock)).forEach(([key, value]) => {
      form.updateField(key as keyof StockForm, value);
    });
    setFormOpen(true);
  };

  const openAdjustDialog = (item: StockItem, action: AdjustStockAction) => {
    setAdjustDialogItem(item);
    setAdjustDialogAction(action);
    setAdjustDialogOpen(true);
  };

  const closeAdjustDialog = () => {
    setAdjustDialogOpen(false);
    setAdjustDialogItem(null);
    setAdjustDialogAction(null);
  };

  // ── Delete Stock (with confirmation) ──
  const requestDeleteStock = (stock: StockItem) => {
    const sampleName =
      stock.relations.sample?.identity?.name || `Stock #${stock.id}`;
    deleteDialog.requestConfirm(String(stock.id), {
      title: `Delete ${sampleName} stock?`,
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
    canSubmitForm,
    openCreateForm,
    openEditForm,
    closeForm,
    samples,
    // Delete
    deleteDialog,
    requestDeleteStock,
    confirmDeleteStock,
    isLoading,
    isError,
    page,
    setPage,
    meta,
    openAdjustDialog,
    closeAdjustDialog,
    adjustDialogOpen,
    adjustDialogItem,
    adjustDialogAction,
  };
}
