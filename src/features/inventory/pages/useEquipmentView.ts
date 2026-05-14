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
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
import { isValidationError } from "@/shared/types/api-error";
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
  imageFile: File | null;
  imagePreviewUrl: string;
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

function formToPayload(form: EquipmentForm): EquipmentPayload {
  return {
    equipment_name: form.name,
    equipment_code: form.equipmentCode || null,
    category: form.category as EquipmentCategory,
    status: form.status as EquipmentStatus,
    condition: form.condition as EquipmentCondition,
    location: form.location || null,
    manufacturer: form.manufacturer || null,
    model_name: form.modelName || null,
    serial_number: form.serialNumber || null,
    purchase_date: form.purchaseDate || null,
    purchase_price: form.purchasePrice ? Number(form.purchasePrice) : null,
    description: form.description || null,
    image_url: form.imageUrl || null,
    ...(form.imageFile ? { image: form.imageFile } : {}),
  };
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
    imageFile: null,
    imagePreviewUrl: item.image_url || "",
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────

const BACKEND_FIELD_MAP: Record<string, keyof EquipmentForm> = {
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
};

type FormErrors = Partial<Record<keyof EquipmentForm, string>>;

function mapBackendErrors(errors: Record<string, string[]>): FormErrors {
  const mapped: FormErrors = {};
  for (const [key, msgs] of Object.entries(errors)) {
    const field = BACKEND_FIELD_MAP[key];
    if (field) mapped[field] = msgs[0];
  }
  return mapped;
}

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
  const [form, setForm] = useState<EquipmentForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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

  const canSubmitForm = Boolean(form.name && form.category);

  // ── Actions ──
  const navigateToDetail = (id: number) =>
    navigate(`/inventory/products/equipment/${id}`);
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

  const openEditForm = (eq: EquipmentItem) => {
    setEditingItem(eq);
    setForm(equipmentToForm(eq));
    setFormErrors({});
    setFormOpen(true);
  };

  const updateFormField = <K extends keyof EquipmentForm>(
    field: K,
    value: EquipmentForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitEquipmentForm = () => {
    if (!form.name || !form.category) {
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
            toast.success(`${form.name} updated successfully`);
          },
          onError: (err) => {
            if (isValidationError(err)) {
              setFormErrors(mapBackendErrors(err.response.data.errors));
            }
            toast.error(
              isValidationError(err)
                ? err.response.data.message
                : "Failed to update equipment",
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
          toast.success(`${form.name} added successfully`);
        },
        onError: (err) => {
          if (isValidationError(err)) {
            setFormErrors(mapBackendErrors(err.response.data.errors));
          }
          toast.error(
            isValidationError(err)
              ? err.response.data.message
              : "Failed to create equipment",
          );
        },
      });
    }
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
    formErrors,
    canSubmitForm,
    openCreateForm,
    openEditForm,
    closeForm,
    updateFormField,
    submitEquipmentForm,
    // Delete
    deleteDialog,
    requestDeleteEquipment,
    confirmDeleteEquipment,
    isLoading,
    isError,
    isSubmitting,
    page,
    setPage,
    meta,
  };
}
