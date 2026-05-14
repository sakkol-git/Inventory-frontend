/* ═══════════════════════════════════════════════════════════════════════════
 * usePlantSamplesView — State + logic for the Plant Samples page.
 *
 * Connects to Laravel backend via React Query + plantSampleService.
 * API response is nested (identity/relationships/details/lab_info/meta),
 * but payload is flat.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    useCreatePlantSample,
    useDeletePlantSample,
    usePlantSampleList,
    useUpdatePlantSample,
} from "@/features/inventory/services/plantSampleService";
import { usePlantSpeciesList } from "@/features/inventory/services/plantSpeciesService";
import type {
    PlantSampleApi,
    PlantSamplePayload,
} from "@/features/inventory/types";
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
import { isValidationError } from "@/shared/types/api-error";
import type { LabLocation, SampleStatus } from "@/shared/types/enums";
import {
    formatEnumLabel,
    LAB_LOCATIONS,
    SAMPLE_STATUSES,
} from "@/shared/types/enums";
import type { LucideIcon } from "lucide-react";
import { TestTube } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

export type SampleItem = PlantSampleApi & {
  icon: LucideIcon;
  color: string;
};

export interface SampleForm {
  name: string;
  sampleCode: string;
  speciesId: string;
  varietyId: string;
  ownerName: string;
  department: string;
  originLocation: string;
  broughtAt: string;
  labLocation: string;
  status: string;
  quantity: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  imagePreviewUrl: string;
}

const EMPTY_FORM: SampleForm = {
  name: "",
  sampleCode: "",
  speciesId: "",
  varietyId: "",
  ownerName: "",
  department: "",
  originLocation: "",
  broughtAt: "",
  labLocation: "",
  status: "active",
  quantity: "",
  description: "",
  imageUrl: "",
  imageFile: null,
  imagePreviewUrl: "",
};

// ─── Constants ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active:
    "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  inactive: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
  archived: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
};

export { STATUS_COLORS };

    export { formatEnumLabel, LAB_LOCATIONS, SAMPLE_STATUSES };

// ─── Helpers ───────────────────────────────────────────────────────────────

function toSampleItem(s: PlantSampleApi): SampleItem {
  return { ...s, icon: TestTube, color: "text-blue-600" };
}

function formToPayload(form: SampleForm): PlantSamplePayload {
  return {
    sample_name: form.name,
    sample_code: form.sampleCode,
    plant_species_id: Number(form.speciesId),
    plant_variety_id: form.varietyId ? Number(form.varietyId) : null,
    owner_name: form.ownerName || null,
    department: form.department || null,
    origin_location: form.originLocation || null,
    brought_at: form.broughtAt || null,
    lab_location: (form.labLocation as LabLocation) || null,
    status: form.status as SampleStatus,
    quantity: Number(form.quantity) || 0,
    description: form.description || null,
    image_url: form.imageUrl || null,
    ...(form.imageFile ? { image: form.imageFile } : {}),
  };
}

function sampleToForm(item: PlantSampleApi): SampleForm {
  return {
    name: item.identity.name,
    sampleCode: item.identity.code,
    speciesId: item.relationships.species
      ? String(item.relationships.species.id)
      : "",
    varietyId: item.relationships.variety
      ? String(item.relationships.variety.id)
      : "",
    ownerName: item.details.owner || "",
    department: item.details.department || "",
    originLocation: item.details.origin || "",
    broughtAt: item.lab_info.brought_at || "",
    labLocation: item.lab_info.location || "",
    status: item.identity.status,
    quantity: String(item.details.quantity),
    description: item.meta.description || "",
    imageUrl: item.meta.image || "",
    imageFile: null,
    imagePreviewUrl: item.meta.image || "",
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────

const BACKEND_FIELD_MAP: Record<string, keyof SampleForm> = {
  sample_name: "name",
  sample_code: "sampleCode",
  plant_species_id: "speciesId",
  plant_variety_id: "varietyId",
  owner_name: "ownerName",
  department: "department",
  origin_location: "originLocation",
  brought_at: "broughtAt",
  lab_location: "labLocation",
  status: "status",
  quantity: "quantity",
  description: "description",
  image_url: "imageUrl",
};

type FormErrors = Partial<Record<keyof SampleForm, string>>;

function mapBackendErrors(errors: Record<string, string[]>): FormErrors {
  const mapped: FormErrors = {};
  for (const [key, msgs] of Object.entries(errors)) {
    const field = BACKEND_FIELD_MAP[key];
    if (field) mapped[field] = msgs[0];
  }
  return mapped;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function usePlantSamplesView() {
  const navigate = useNavigate();

  // ── Data from backend (paginated) ──
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;
  if (statusFilter !== "all") queryParams.status = statusFilter;

  const {
    data: response,
    isLoading,
    isError,
  } = usePlantSampleList(queryParams);

  const rawItems = response?.data ?? [];
  const meta = response?.meta;
  const items: SampleItem[] = rawItems
    .map(toSampleItem)
    .sort((a, b) => a.id - b.id);

  // ── Species list for dropdown ──
  const { data: speciesResponse } = usePlantSpeciesList({ per_page: 100 });
  const species = speciesResponse?.data ?? [];

  // ── Mutations ──
  const createMutation = useCreatePlantSample();
  const updateMutation = useUpdatePlantSample();
  const deleteMutation = useDeletePlantSample();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SampleForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // ── Delete confirmation ──
  const deleteDialog = useConfirmDialog();

  // ── Derived ──
  const filteredItems = items; // Server-side filtering

  const stats: Stat[] = [
    {
      label: "Total Samples",
      value: meta?.total ?? items.length,
      color: "primary",
    },
    {
      label: "Active",
      value: items.filter((i) => i.identity.status === "active").length,
      color: "primary",
    },
    {
      label: "Archived",
      value: items.filter((i) => i.identity.status === "archived").length,
      color: "warning",
    },
  ];

  // ── Actions ──
  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditForm = (item: SampleItem) => {
    setEditingId(item.id);
    setForm(sampleToForm(item));
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.speciesId || !form.quantity) {
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
            toast.success(`Sample "${form.name}" updated successfully`);
          },
          onError: (err) => {
            if (isValidationError(err)) {
              setFormErrors(mapBackendErrors(err.response.data.errors));
            }
            toast.error(
              isValidationError(err)
                ? err.response.data.message
                : "Failed to update sample",
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
          toast.success(`Sample "${form.name}" added successfully`);
        },
        onError: (err) => {
          if (isValidationError(err)) {
            setFormErrors(mapBackendErrors(err.response.data.errors));
          }
          toast.error(
            isValidationError(err)
              ? err.response.data.message
              : "Failed to create sample",
          );
        },
      });
    }
  };

  const requestDeleteSample = (item: SampleItem) => {
    deleteDialog.requestConfirm(String(item.id), {
      title: `Delete ${item.identity.name}?`,
      description: `This will permanently remove sample ${item.identity.name} (${item.identity.code}).`,
    });
  };

  const confirmDeleteSample = () => {
    deleteDialog.confirm((id) => {
      deleteMutation.mutate(Number(id), {
        onSuccess: () => toast.success("Sample deleted"),
        onError: () => toast.error("Failed to delete sample"),
      });
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
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
    requestDeleteSample,
    confirmDeleteSample,
    navigate,
    isLoading,
    isError,
    isSubmitting,
    page,
    setPage,
    meta,
  } as const;
}
