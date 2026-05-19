/* ═══════════════════════════════════════════════════════════════════════════
 * useEquipmentView — All state + logic for the Equipment listing page.
 *
 * Connects to Laravel backend via React Query + equipmentService.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    useCreateEquipment,
    useDeleteEquipment,
    useEquipmentList,
    useUpdateEquipment,
} from "@/features/inventory/services/equipmentService";
import type {
    EquipmentApi,
    EquipmentPayload,
} from "@/features/inventory/types";
import { useEntityForm } from "@/hooks/useEntityForm";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
import type {
    EquipmentCategory,
    EquipmentCondition,
    EquipmentStatus,
} from "@/shared/types/enums";
import {
    EQUIPMENT_CATEGORIES,
    EQUIPMENT_CONDITIONS,
    EQUIPMENT_STATUSES,
    formatEnumLabel,
} from "@/shared/types/enums";
import type { LucideIcon } from "lucide-react";
import { Flame, Gauge, Microscope, Scan, Wrench } from "lucide-react";
// import { i } from "node_modules/vite/dist/node/chunks/moduleRunnerTransport";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

export type EquipmentItem = EquipmentApi & {
  icon: LucideIcon;
  color: string;
};

export type EquipmentForm = {
  name: string;
  equipmentCode: string;
  category: string;
  status: string;
  condition: string;
  location: string;
  manufacturer: string;
  modelName: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: string;
  description: string;
  imageUrl: string;
  imageFile?: File | null;
  imagePreviewUrl?: string;
};

// ─── Constants ─────────────────────────────────────────────────────────────

export const CATEGORY_ICONS: Record<
  string,
  { icon: LucideIcon; color: string }
> = {
  microscope: { icon: Microscope, color: "hsl(210, 60%, 50%)" },
  centrifuge: { icon: Scan, color: "hsl(270, 50%, 50%)" },
  incubator: { icon: Flame, color: "hsl(0, 72%, 51%)" },
  spectrophotometer: { icon: Gauge, color: "hsl(175, 65%, 35%)" },
  other: { icon: Wrench, color: "hsl(38, 92%, 50%)" },
};

const EMPTY_FORM: EquipmentForm = {
  name: "",
  equipmentCode: "",
  category: "other",
  status: "available",
  condition: "good",
  location: "",
  manufacturer: "",
  modelName: "",
  serialNumber: "",
  purchaseDate: "",
  purchasePrice: "",
  description: "",
  imageUrl: "",
  imageFile: null,
  imagePreviewUrl: "",
};

export {
    EQUIPMENT_CATEGORIES,
    EQUIPMENT_CONDITIONS,
    EQUIPMENT_STATUSES,
    formatEnumLabel
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export const statusBadgeClass = (status: string): string => {
  switch (status) {
    case "available":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
    case "borrowed":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950";
    case "in_use":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950";
    case "under_maintenance":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export const conditionBadgeClass = (condition: string): string => {
  switch (condition) {
    case "good":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
    case "normal":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950";
    case "broken":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    default:
      return "text-muted-foreground bg-muted";
  }
};

function toEquipmentItem(e: EquipmentApi): EquipmentItem {
  const meta = CATEGORY_ICONS[e.category] || CATEGORY_ICONS.other;
  return { ...e, icon: meta.icon, color: meta.color };
}

function equipmentToForm(item: EquipmentApi): EquipmentForm {
  return {
    name: item.equipment_name,
    equipmentCode: item.equipment_code || "",
    category: item.category,
    status: item.status,
    condition: item.condition,
    location: item.location || "",
    manufacturer: item.manufacturer || "",
    modelName: item.model_name || "",
    serialNumber: item.serial_number || "",
    purchaseDate: item.purchase_date || "",
    purchasePrice: item.purchase_price || "",
    description: item.description || "",
    imageUrl: item.image_url || "",
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────
// Maps backend field names to form field names for useEntityForm hook

const EQUIPMENT_FIELD_MAP: Record<string, keyof EquipmentForm> = {
  equipment_name: "name",
  equipment_code: "equipmentCode",
  category: "category",
  status: "status",
  condition: "condition",
  location: "location",
  manufacturer: "manufacturer",
  model_name: "modelName",
  serial_number: "serialNumber",
  purchase_date: "purchaseDate",
  purchase_price: "purchasePrice",
  description: "description",
  image_url: "imageUrl",
  image: "imageFile",
  image_preview_url: "imagePreviewUrl",
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useEquipmentView() {
  const navigate = useNavigate();

  // ── Data from backend (paginated) ──
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;
  if (statusFilter !== "all") queryParams.status = statusFilter;

  const { data: response, isLoading, isError } = useEquipmentList(queryParams);

  const rawItems = response?.data ?? [];
  const meta = response?.meta;
  const items: EquipmentItem[] = rawItems
    .map(toEquipmentItem)
    .sort((a, b) => a.id - b.id);

  // ── Mutations ──
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

  // ── Using new abstractions ──
  const image = useImageUpload();

  const form = useEntityForm({
    initialData: EMPTY_FORM,
    fieldMap: EQUIPMENT_FIELD_MAP,
    onSubmit: async (formData) => {
      const payload: EquipmentPayload = {
        equipment_name: formData.name,
        equipment_code: formData.equipmentCode || null,
        category: formData.category as EquipmentCategory,
        status: formData.status as EquipmentStatus,
        condition: formData.condition as EquipmentCondition,
        location: formData.location || null,
        manufacturer: formData.manufacturer || null,
        model_name: formData.modelName || null,
        serial_number: formData.serialNumber || null,
        purchase_date: formData.purchaseDate || null,
        purchase_price: formData.purchasePrice ? Number(formData.purchasePrice) : null,
        description: formData.description || null,
        image_url: formData.imageUrl || null,
        ...(image.imageFile ? { image: image.imageFile } : {}),
      };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      form.reset();
      image.clearImage();
      setEditingItem(null);
      setFormOpen(false);
      toast.success(
        editingItem
          ? `${formData.name} updated successfully`
          : `${formData.name} added successfully`,
      );
    },
  });

  // ── Delete confirmation ──
  const deleteDialog = useConfirmDialog();

  // ── Derived state ──
  const filteredItems = items; // Server-side filtering

  const availableCount = items.filter((e) => e.status === "available").length;
  const borrowedCount = items.filter((e) => e.status === "borrowed").length;

  const quickStats: Stat[] = [
    {
      label: "Total Equipment",
      value: meta?.total ?? items.length,
      color: "primary",
    },
    { label: "Available", value: availableCount, color: "primary" },
    { label: "Borrowed", value: borrowedCount, color: "warning" },
    {
      label: "Maintenance",
      value: items.filter((e) => e.status === "under_maintenance").length,
      color: "destructive",
    },
  ];

  const isEditing = editingItem !== null;
  const formTitle = isEditing ? "Edit Equipment" : "Add New Equipment";
  const formDescription = isEditing
    ? `Update details for ${editingItem!.equipment_name}.`
    : "Fill in the details to register new equipment.";

  const canSubmitForm = Boolean(form.form.name && form.form.category);

  // ── Actions ──
  const navigateToDetail = (id: number) =>
    navigate(`/inventory/products/equipment/${id}`);
  const updateSearchQuery = (q: string) => setSearchQuery(q);
  const switchViewMode = (mode: ViewMode) => setViewMode(mode);
  const updateStatusFilter = (s: string) => setStatusFilter(s);

  const openCreateForm = () => {
    form.reset();
    image.clearImage();
    setEditingItem(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    form.reset();
    image.clearImage();
    setEditingItem(null);
  };

  const openEditForm = (eq: EquipmentItem) => {
    form.reset();
    setEditingItem(eq);
    Object.entries(equipmentToForm(eq)).forEach(([key, value]) => {
      form.updateField(key as keyof EquipmentForm, value);
    });
    if (eq.image_url) image.setInitialUrl(eq.image_url);
    setFormOpen(true);
  };

  // ── Delete ──
  const requestDeleteEquipment = (eq: EquipmentItem) => {
    deleteDialog.requestConfirm(String(eq.id), {
      title: `Delete ${eq.equipment_name}?`,
      description: `This will permanently remove ${eq.equipment_name} (#${eq.id}).`,
    });
  };

  const confirmDeleteEquipment = () => {
    deleteDialog.confirm((id) => {
      deleteMutation.mutate(Number(id), {
        onSuccess: () => toast.success("Equipment deleted"),
        onError: () => toast.error("Failed to delete equipment"),
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
    image,
    canSubmitForm,
    openCreateForm,
    openEditForm,
    closeForm,
    // Delete
    deleteDialog,
    requestDeleteEquipment,
    confirmDeleteEquipment,
    isLoading,
    isError,
    page,
    setPage,
    meta,
  };
}
