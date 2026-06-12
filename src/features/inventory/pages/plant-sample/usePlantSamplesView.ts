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
import { useUserList } from "@/features/inventory/services/userService";
import { usePlantVarietyList } from "@/features/inventory/services/plantVarietyService";
import type {
    PlantSampleApi,
    PlantSamplePayload,
} from "@/features/inventory/types";
import { useEntityForm } from "@/hooks/useEntityForm";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
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
  varietyId: string;
  userId: string;
  department: string;
  originLocation: string;
  broughtAt: string;
  labLocation: string;
  status: string;
  description: string;
  imageUrl: string;
}

const EMPTY_FORM: SampleForm = {
  name: "",
  sampleCode: "",
  varietyId: "",
  userId: "",
  department: "",
  originLocation: "",
  broughtAt: "",
  labLocation: "",
  status: "active",
  description: "",
  imageUrl: "",
  
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

function formToPayload(form: SampleForm, imageFile: File | null): PlantSamplePayload {
  return {
    sample_name: form.name,
    sample_code: form.sampleCode,
    plant_variety_id: Number(form.varietyId),
    user_id: form.userId ? Number(form.userId) : null,
    department: form.department || null,
    origin_location: form.originLocation || null,
    brought_at: form.broughtAt || null,
    lab_location: (form.labLocation as LabLocation) || null,
    status: form.status as SampleStatus,
    description: form.description || null,
    image_url: form.imageUrl || null,
    ...(imageFile ? { image: imageFile } : {}),
  };
}

function sampleToForm(
  item: PlantSampleApi,
  users: { id: number; name: string }[] = [],
): SampleForm {
  const matchedUserId =
    item.relationships?.contributor?.id ??
    item.details?.user_id ??
    users.find((user) => user.name === item.details?.owner)?.id ??
    users.find((user) => user.name === item.relationships?.contributor?.name)
      ?.id ??
    null;

  return {
    name: item.identity?.name ?? "",
    sampleCode: item.identity?.code ?? "",
    varietyId: item.relationships?.variety
      ? String(item.relationships.variety.id)
      : "",
    userId: matchedUserId ? String(matchedUserId) : "",
    department: item.details?.department ?? "",
    originLocation: item.details?.origin ?? "",
    broughtAt: item.lab_info?.brought_at ?? "",
    labLocation: item.lab_info?.location ?? "",
    status: item.identity?.status ?? "active",
    description: item.meta?.description ?? "",
    imageUrl: item.meta?.image ?? "",
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────
// Maps backend field names to form field names for useEntityForm hook

const PLANT_SAMPLE_FIELD_MAP: Record<string, keyof SampleForm> = {
  sample_name: "name",
  sample_code: "sampleCode",
  plant_variety_id: "varietyId",
  user_id: "userId",
  department: "department",
  origin_location: "originLocation",
  brought_at: "broughtAt",
  lab_location: "labLocation",
  status: "status",
  description: "description",
  image_url: "imageUrl",
};

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

  const { data: userResponse } = useUserList({ per_page: 100 });

  const rawItems = response?.data ?? [];
  const meta = response?.meta;
  const items: SampleItem[] = rawItems
    .filter((item): item is PlantSampleApi => Boolean(item))
    .map(toSampleItem)
    .sort((a, b) => a.id - b.id);

  // ── Variety list for dropdown ──
  const { data: varietyResponse } = usePlantVarietyList({ per_page: 100 });
  const varieties = varietyResponse?.data ?? [];
  const users = (userResponse?.data ?? []).slice().sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // ── Mutations ──
  const createMutation = useCreatePlantSample();
  const updateMutation = useUpdatePlantSample();
  const deleteMutation = useDeletePlantSample();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ── Using new abstractions ──
  const imageUpload = useImageUpload();
  const form = useEntityForm({
    initialData: EMPTY_FORM,
    fieldMap: PLANT_SAMPLE_FIELD_MAP,
    onSubmit: async (formData) => {
      const payload = formToPayload(formData, imageUpload.imageFile);

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      form.reset();
      imageUpload.clearImage();
      setEditingId(null);
      setDialogOpen(false);
      toast.success(
        editingId
          ? `Sample "${formData.name}" updated successfully`
          : `Sample "${formData.name}" added successfully`,
      );
    },
  });

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
      value: items.filter((i) => i.identity?.status === "active").length,
      color: "primary",
    },
    {
      label: "Archived",
      value: items.filter((i) => i.identity?.status === "archived").length,
      color: "warning",
    },
  ];

  // ── Actions ──
  const openCreateForm = () => {
    form.reset();
    imageUpload.clearImage();
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEditForm = (item: SampleItem) => {
    form.reset();
    Object.entries(sampleToForm(item, users)).forEach(([key, value]) => {
      form.updateField(key as keyof SampleForm, value);
    });
    imageUpload.setInitialUrl(item.meta.image || "");
    setEditingId(item.id);
    setDialogOpen(true);
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
    imageUpload,
    items,
    filteredItems,
    stats,
    varieties,
    users,
    openCreateForm,
    openEditForm,
    deleteDialog,
    requestDeleteSample,
    confirmDeleteSample,
    navigate,
    isLoading,
    isError,
    page,
    setPage,
    meta,
  } as const;
}
