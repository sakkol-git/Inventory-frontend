/* ═══════════════════════════════════════════════════════════════════════════
 * useChemicalsView — All state + logic for the Chemicals listing page.
 *
 * Refactored to use shared abstractions:
 * - useEntityForm for form state management
 * - useImageUpload for image handling
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    useChemicalList,
    useCreateChemical,
    useDeleteChemical,
    useUpdateChemical,
} from "@/features/inventory/services/chemicalService";
import type { ChemicalApi, ChemicalPayload } from "@/features/inventory/types";
import { useEntityForm } from "@/hooks/useEntityForm";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
import type { ChemicalCategory, DangerLevel } from "@/shared/types/enums";
import {
    CHEMICAL_CATEGORIES,
    DANGER_LEVELS,
    formatEnumLabel,
} from "@/shared/types/enums";
import type { LucideIcon } from "lucide-react";
import { Atom, Droplets, FlaskConical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

export type ChemicalItem = ChemicalApi & {
  icon: LucideIcon;
  color: string;
  daysLeft: number;
};

export interface ChemicalForm {
  name: string;
  chemicalCode: string;
  category: string;
  quantity: string;
  storageLocation: string;
  expiryDate: string;
  dangerLevel: string;
  safetyMeasures: string;
  description: string;
  imageUrl: string;
  imageFile?: File | null;
  imagePreviewUrl?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

export const HAZARD_ICONS: Record<string, { icon: LucideIcon; color: string }> =
  {
    high: { icon: Droplets, color: "hsl(0, 72%, 51%)" },
    medium: { icon: FlaskConical, color: "hsl(38, 92%, 50%)" },
    low: { icon: Atom, color: "hsl(145, 63%, 32%)" },
  };

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

export { CHEMICAL_CATEGORIES, DANGER_LEVELS, formatEnumLabel };

// ─── Helpers (exported for sub-components) ─────────────────────────────────

export const hazardBackground = (danger: string): string => {
  switch (danger) {
    case "high":
      return "bg-destructive/5 border-destructive/20";
    case "medium":
      return "bg-warning/5 border-warning/20";
    case "low":
      return "bg-primary/5 border-primary/20";
    default:
      return "bg-muted/50 border-border";
  }
};

export const hazardBadge = (danger: string): string => {
  switch (danger) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-primary text-primary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

function computeDaysLeft(expiryDate: string | null): number {
  if (!expiryDate) return 999; // no expiry = safe
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const expiryStatus = (daysLeft: number) => {
  if (daysLeft < 0)
    return {
      label: "Expired",
      className: "bg-destructive text-destructive-foreground",
    };
  if (daysLeft <= 14)
    return {
      label: `${daysLeft}d left`,
      className: "bg-destructive/10 text-destructive",
    };
  if (daysLeft <= 30)
    return {
      label: `${daysLeft}d left`,
      className: "bg-warning/10 text-warning",
    };
  return { label: "OK", className: "bg-muted text-primary" };
};

export const formatDisplayDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function toChemicalItem(c: ChemicalApi): ChemicalItem {
  const meta = HAZARD_ICONS[c.danger_level] || HAZARD_ICONS.low;
  return {
    ...c,
    icon: meta.icon,
    color: meta.color,
    daysLeft: computeDaysLeft(c.expiry_date),
  };
}

function formToPayload(form: ChemicalForm): ChemicalPayload {
  return {
    common_name: form.name,
    chemical_code: form.chemicalCode || null,
    category: form.category as ChemicalCategory,
    quantity: Number(form.quantity) || 0,
    storage_location: form.storageLocation || null,
    expiry_date: form.expiryDate || null,
    danger_level: form.dangerLevel as DangerLevel,
    safety_measures: form.safetyMeasures || null,
    description: form.description || null,
    image_url: form.imageUrl || null,
    ...(form.imageFile ? { image: form.imageFile } : {}),
  };
}

function chemicalToForm(item: ChemicalApi): ChemicalForm {
  return {
    name: item.common_name,
    chemicalCode: item.chemical_code || "",
    category: item.category,
    quantity: String(item.quantity),
    storageLocation: item.storage_location || "",
    expiryDate: item.expiry_date || "",
    dangerLevel: item.danger_level,
    safetyMeasures: item.safety_measures || "",
    description: item.description || "",
    imageUrl: item.image_url || "",
    imageFile: null,
    imagePreviewUrl: item.image_url || "",
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────
// Maps backend field names to form field names for useEntityForm hook

const CHEMICAL_FIELD_MAP: Record<string, keyof ChemicalForm> = {
  common_name: "name",
  chemical_code: "chemicalCode",
  category: "category",
  quantity: "quantity",
  storage_location: "storageLocation",
  expiry_date: "expiryDate",
  danger_level: "dangerLevel",
  safety_measures: "safetyMeasures",
  description: "description",
  image_url: "imageUrl",
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useChemicalsView() {
  const navigate = useNavigate();

  // ── Data from backend (paginated) ──
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;

  const { data: response, isLoading, isError } = useChemicalList(queryParams);

  const rawItems = response?.data ?? [];
  const meta = response?.meta;
  const items: ChemicalItem[] = rawItems
    .map(toChemicalItem)
    .sort((a, b) => a.id - b.id);

  // ── Mutations ──
  const createMutation = useCreateChemical();
  const updateMutation = useUpdateChemical();
  const deleteMutation = useDeleteChemical();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChemicalItem | null>(null);

  // ── Using new abstractions ──
  const image = useImageUpload();

  const form = useEntityForm({
    initialData: EMPTY_FORM,
    fieldMap: CHEMICAL_FIELD_MAP,
    onSubmit: async (formData) => {
      const payload: ChemicalPayload = {
        common_name: formData.name,
        chemical_code: formData.chemicalCode || null,
        category: formData.category as ChemicalCategory,
        quantity: Number(formData.quantity) || 0,
        storage_location: formData.storageLocation || null,
        expiry_date: formData.expiryDate || null,
        danger_level: formData.dangerLevel as DangerLevel,
        safety_measures: formData.safetyMeasures || null,
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

  // ── Actions ──
  const navigateToDetail = (id: number) =>
    navigate(`/inventory/products/chemicals/${id}`);
  const updateSearchQuery = (q: string) => setSearchQuery(q);
  const switchViewMode = (mode: ViewMode) => setViewMode(mode);

  const openCreateForm = () => {
    setEditingItem(null);
    form.reset();
    image.clearImage();
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    form.reset();
    image.clearImage();
    setEditingItem(null);
  };

  const openEditForm = (chem: ChemicalItem) => {
    setEditingItem(chem);
    const formData: ChemicalForm = {
      name: chem.common_name,
      chemicalCode: chem.chemical_code || "",
      category: chem.category,
      quantity: String(chem.quantity),
      storageLocation: chem.storage_location || "",
      expiryDate: chem.expiry_date || "",
      dangerLevel: chem.danger_level,
      safetyMeasures: chem.safety_measures || "",
      description: chem.description || "",
      imageUrl: chem.image_url || "",
    };
    form.reset();
    Object.entries(formData).forEach(([key, value]) => {
      form.updateField(key as keyof ChemicalForm, value);
    });
    if (chem.image_url) {
      image.setInitialUrl(chem.image_url);
    }
    setFormOpen(true);
  };

  // ── Delete ──
  const requestDeleteChemical = (chem: ChemicalItem) => {
    deleteDialog.requestConfirm(String(chem.id), {
      title: `Delete ${chem.common_name}?`,
      description: `This will permanently remove ${chem.common_name} (#${chem.id}).`,
    });
  };

  const confirmDeleteChemical = () => {
    deleteDialog.confirm((id) => {
      deleteMutation.mutate(Number(id), {
        onSuccess: () => toast.success("Chemical deleted"),
        onError: () => toast.error("Failed to delete chemical"),
      });
    });
  };

  // ── Derived state ──
  const filteredItems = items; // Server-side filtering

  const expiredCount = items.filter((c) => c.is_expired).length;
  const expiringSoonCount = items.filter(
    (c) => !c.is_expired && c.daysLeft > 0 && c.daysLeft <= 14,
  ).length;

  const quickStats: Stat[] = [
    {
      label: "Total Chemicals",
      value: meta?.total ?? items.length,
      color: "primary",
    },
    { label: "Expired", value: expiredCount, color: "destructive" },
    { label: "Expiring (14d)", value: expiringSoonCount, color: "warning" },
    {
      label: "Safe",
      value: items.length - expiredCount - expiringSoonCount,
      color: "muted",
    },
  ];

  const isEditing = editingItem !== null;
  const formTitle = isEditing ? "Edit Chemical" : "Add New Chemical";
  const formDescription = isEditing
    ? `Update details for ${editingItem!.common_name}.`
    : "Fill in the details to register a new chemical.";

  const canSubmitForm = Boolean(form.form.name && form.form.quantity);

  const isSubmitting = form.isSubmitting || createMutation.isPending || updateMutation.isPending;

  return {
    filteredItems,
    totalCount: meta?.total ?? items.length,
    quickStats,
    searchQuery,
    updateSearchQuery,
    viewMode,
    switchViewMode,
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
    expiredCount,
    expiringSoonCount,
    // Delete
    deleteDialog,
    requestDeleteChemical,
    confirmDeleteChemical,
    isLoading,
    isError,
    isSubmitting,
    page,
    setPage,
    meta,
  };
}
