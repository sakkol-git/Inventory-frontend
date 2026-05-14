/* ═══════════════════════════════════════════════════════════════════════════
 * usePlantVarietiesView — State + logic for the Plant Varieties page.
 *
 * Connects to Laravel backend via React Query + plantVarietyService.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { usePlantSpeciesList } from "@/features/inventory/services/plantSpeciesService";
import {
    useCreatePlantVariety,
    useDeletePlantVariety,
    usePlantVarietyList,
    useUpdatePlantVariety,
} from "@/features/inventory/services/plantVarietyService";
import type {
    PlantVarietyApi,
    PlantVarietyPayload,
} from "@/features/inventory/types";
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
import { isValidationError } from "@/shared/types/api-error";
import type { LucideIcon } from "lucide-react";
import { Leaf } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

export type VarietyItem = PlantVarietyApi & {
  icon: LucideIcon;
  color: string;
};

export interface VarietyForm {
  name: string;
  speciesId: string; // string for Select component, converted to number for API
  varietyCode: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  imagePreviewUrl: string;
}

const EMPTY_FORM: VarietyForm = {
  name: "",
  speciesId: "",
  varietyCode: "",
  description: "",
  imageUrl: "",
  imageFile: null,
  imagePreviewUrl: "",
};

// ─── Constants ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Active:
    "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  Archived: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
  Destroyed: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
};

export { STATUS_COLORS };

// ─── Helpers ───────────────────────────────────────────────────────────────

function toVarietyItem(v: PlantVarietyApi): VarietyItem {
  return { ...v, icon: Leaf, color: "text-emerald-600" };
}

function formToPayload(form: VarietyForm): PlantVarietyPayload {
  return {
    plant_species_id: Number(form.speciesId),
    name: form.name,
    variety_code: form.varietyCode,
    description: form.description || null,
    image_url: form.imageUrl || null,
    ...(form.imageFile ? { image: form.imageFile } : {}),
  };
}

function varietyToForm(item: PlantVarietyApi): VarietyForm {
  return {
    name: item.name,
    speciesId: String(item.plant_species_id),
    varietyCode: item.variety_code,
    description: item.description || "",
    imageUrl: item.image_url || "",
    imageFile: null,
    imagePreviewUrl: item.image_url || "",
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────

const BACKEND_FIELD_MAP: Record<string, keyof VarietyForm> = {
  plant_species_id: "speciesId",
  name: "name",
  variety_code: "varietyCode",
  description: "description",
  image_url: "imageUrl",
};

type FormErrors = Partial<Record<keyof VarietyForm, string>>;

function mapBackendErrors(errors: Record<string, string[]>): FormErrors {
  const mapped: FormErrors = {};
  for (const [key, msgs] of Object.entries(errors)) {
    const field = BACKEND_FIELD_MAP[key];
    if (field) mapped[field] = msgs[0];
  }
  return mapped;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function usePlantVarietiesView() {
  const navigate = useNavigate();

  // ── Data from backend (paginated) ──
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;

  const {
    data: response,
    isLoading,
    isError,
  } = usePlantVarietyList(queryParams);

  const rawItems = response?.data ?? [];
  const meta = response?.meta;
  // sort by id to maintain stable order regardless of backend's sort key
  const items: VarietyItem[] = rawItems
    .map(toVarietyItem)
    .sort((a, b) => a.id - b.id);

  // ── Species list for dropdown ──
  const { data: speciesResponse } = usePlantSpeciesList({ per_page: 100 });
  const species = speciesResponse?.data ?? [];

  // ── Mutations ──
  const createMutation = useCreatePlantVariety();
  const updateMutation = useUpdatePlantVariety();
  const deleteMutation = useDeletePlantVariety();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VarietyForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // ── Delete confirmation ──
  const deleteDialog = useConfirmDialog();

  // ── Derived ──
  const filteredItems = items; // Server-side filtering via queryParams

  const stats: Stat[] = [
    {
      label: "Total Varieties",
      value: meta?.total ?? items.length,
      color: "primary",
    },
    { label: "On Page", value: items.length, color: "primary" },
  ];

  // ── Actions ──
  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditForm = (item: VarietyItem) => {
    setEditingId(item.id);
    setForm(varietyToForm(item));
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.speciesId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setFormErrors({});

    const payload = formToPayload(form);

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setForm(EMPTY_FORM);
            setEditingId(null);
            toast.success(`Variety "${form.name}" updated successfully`);
          },
          onError: (err) => {
            if (isValidationError(err)) {
              setFormErrors(mapBackendErrors(err.response.data.errors));
            }
            toast.error(
              isValidationError(err)
                ? err.response.data.message
                : "Failed to update variety",
            );
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false);
          setForm(EMPTY_FORM);
          setEditingId(null);
          toast.success(`Variety "${form.name}" added successfully`);
        },
        onError: (err) => {
          if (isValidationError(err)) {
            setFormErrors(mapBackendErrors(err.response.data.errors));
          }
          toast.error(
            isValidationError(err)
              ? err.response.data.message
              : "Failed to create variety",
          );
        },
      });
    }
  };

  const requestDeleteVariety = (item: VarietyItem) => {
    deleteDialog.requestConfirm(String(item.id), {
      title: `Delete ${item.name}?`,
      description: `This will permanently remove variety ${item.name} (#${item.id}).`,
    });
  };

  const confirmDeleteVariety = () => {
    deleteDialog.confirm((id) => {
      deleteMutation.mutate(Number(id), {
        onSuccess: () => toast.success("Variety deleted"),
        onError: () => toast.error("Failed to delete variety"),
      });
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    dialogOpen,
    setDialogOpen,
    editingId,
    form,
    formErrors,
    setForm,
    items,
    filteredItems,
    stats,
    species,
    openCreateForm,
    openEditForm,
    handleSave,
    deleteDialog,
    requestDeleteVariety,
    confirmDeleteVariety,
    navigate,
    isLoading,
    isError,
    isSubmitting,
    page,
    setPage,
    meta,
  } as const;
}
