/* ═══════════════════════════════════════════════════════════════════════════
 * usePlantSpeciesView — All state + logic for the Plant Species page.
 *
 * Connects to Laravel backend via React Query + plantSpeciesService.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    useCreatePlantSpecies,
    useDeletePlantSpecies,
    usePlantSpeciesList,
    useUpdatePlantSpecies,
} from "@/features/inventory/services/plantSpeciesService";
import type {
    PlantSpeciesApi,
    PlantSpeciesPayload,
} from "@/features/inventory/types";
import { useEntityForm } from "@/hooks/useEntityForm";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Stat } from "@/shared/components/QuickStats";
import type { ViewMode } from "@/shared/components/ViewToggle";
import type { PlantGrowthType } from "@/shared/types/enums";
import { PLANT_GROWTH_TYPES, formatEnumLabel } from "@/shared/types/enums";
import type { LucideIcon } from "lucide-react";
import { Bean, Citrus, Flower2, Leaf, Wheat } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

export type SpeciesItem = PlantSpeciesApi & {
  icon: LucideIcon;
  color: string;
};

export interface SpeciesForm {
  commonName: string;
  khmerName: string;
  scientificName: string;
  family: string;
  growthType: string;
  nativeRegion: string;
  propagationMethod: string;
  description: string;
  imageUrl: string;
  imageFile?: File | null;
  imagePreviewUrl?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

export const GROWTH_TYPE_OPTIONS = PLANT_GROWTH_TYPES;
export { formatEnumLabel };

export const FAMILY_ICONS: Record<string, { icon: LucideIcon; color: string }> =
  {
    Solanaceae: { icon: Citrus, color: "hsl(0, 72%, 51%)" },
    Brassicaceae: { icon: Flower2, color: "hsl(145, 63%, 32%)" },
    Poaceae: { icon: Wheat, color: "hsl(38, 92%, 50%)" },
    Fabaceae: { icon: Bean, color: "hsl(210, 20%, 50%)" },
    Other: { icon: Leaf, color: "hsl(175, 65%, 35%)" },
  };

const EMPTY_FORM: SpeciesForm = {
  commonName: "",
  khmerName: "",
  scientificName: "",
  family: "",
  growthType: "herb",
  nativeRegion: "",
  propagationMethod: "",
  description: "",
  imageUrl: "",
  imageFile: null,
  imagePreviewUrl: "",
};

// Helper: enrich API species with UI icon/color
function toSpeciesItem(species: PlantSpeciesApi): SpeciesItem {
  return {
    ...species,
    icon: FAMILY_ICONS[species.family || "Other"]?.icon || Leaf,
    color:
      FAMILY_ICONS[species.family || "Other"]?.color || "hsl(175, 65%, 35%)",
  };
}

// ─── Form ↔ API Mappers ────────────────────────────────────────────────────

function formToPayload(form: SpeciesForm, imageFile: File | null): PlantSpeciesPayload {
  return {
    common_name: form.commonName,
    khmer_name: form.khmerName || null,
    scientific_name: form.scientificName,
    family: form.family || null,
    growth_type: (form.growthType as PlantGrowthType) || "other",
    native_region: form.nativeRegion || null,
    propagation_method: form.propagationMethod || null,
    description: form.description || null,
    image_url: form.imageUrl || null,
    ...(imageFile ? { image: imageFile } : {}),
  };
}

function speciesItemToForm(item: SpeciesItem): SpeciesForm {
  return {
    commonName: item.common_name,
    khmerName: item.khmer_name || "",
    scientificName: item.scientific_name,
    family: item.family || "",
    growthType: item.growth_type || "herb",
    nativeRegion: item.native_region || "",
    propagationMethod: item.propagation_method || "",
    description: item.description || "",
    imageUrl: item.image_url || "",
    imageFile: null,
    imagePreviewUrl: item.image_url || "",
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────
// Maps backend field names to form field names for useEntityForm hook

const PLANT_SPECIES_FIELD_MAP: Record<string, keyof SpeciesForm> = {
  common_name: "commonName",
  khmer_name: "khmerName",
  scientific_name: "scientificName",
  family: "family",
  growth_type: "growthType",
  native_region: "nativeRegion",
  propagation_method: "propagationMethod",
  description: "description",
  image_url: "imageUrl",
  image: "imageFile",
  image_preview_url: "imagePreviewUrl",
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export function usePlantSpeciesView() {
  const navigate = useNavigate();

  // ── Data from backend (paginated) ──
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;
  if (familyFilter !== "all") queryParams.family = familyFilter;

  const {
    data: response,
    isLoading,
    isError,
    error: fetchError,
  } = usePlantSpeciesList(queryParams);

  const rawItems = response?.data ?? [];
  const meta = response?.meta;
  const items: SpeciesItem[] = rawItems
    .map(toSpeciesItem)
    .sort((a, b) => a.id - b.id);

  // ── Mutations ──
  const createMutation = useCreatePlantSpecies();
  const updateMutation = useUpdatePlantSpecies();
  const deleteMutation = useDeletePlantSpecies();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SpeciesItem | null>(null);

  // ── Using new abstractions ──
  const image = useImageUpload();

  const form = useEntityForm({
    initialData: EMPTY_FORM,
    fieldMap: PLANT_SPECIES_FIELD_MAP,
    onSubmit: async (formData) => {
      const payload = formToPayload(formData, image.imageFile);

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
          ? `${formData.commonName} updated successfully`
          : `${formData.commonName} added successfully`,
      );
    },
  });

  // ── Delete confirmation ──
  const deleteDialog = useConfirmDialog();

  // ── Derived ──
  const families = [
    ...new Set(items.map((s) => s.family).filter(Boolean)),
  ] as string[];

  const filteredItems = items; // Filtering is done server-side via query params

  const totalVarieties = items.reduce(
    (sum, sp) => sum + (sp.variety_count ?? 0),
    0,
  );
  const totalSamples = items.reduce(
    (sum, sp) => sum + (sp.sample_count ?? 0),
    0,
  );
  const activeSpecies = items.filter(
    (sp) => (sp.variety_count ?? 0) > 0,
  ).length;

  const quickStats: Stat[] = [
    {
      label: "Total Species",
      value: meta?.total ?? items.length,
      color: "primary",
    },
    { label: "Active", value: activeSpecies, color: "primary" },
    {
      label: "Varieties",
      value: totalVarieties.toLocaleString(),
      color: "primary",
    },
    {
      label: "Samples",
      value: totalSamples.toLocaleString(),
      color: "muted",
    },
  ];

  const isEditing = editingItem !== null;
  const formTitle = isEditing ? "Edit Plant Species" : "Add New Species";
  const formDescription = isEditing
    ? `Update details for ${editingItem!.common_name}.`
    : "Fill in the details to register a new plant species.";

  const canSubmitForm = Boolean(
    form.form.commonName && form.form.scientificName && form.form.growthType,
  );

  // ── Actions ──
  const navigateToDetail = (id: number) =>
    navigate(`/inventory/products/species/${id}`);
  const navigateToBatches = (commonName: string) =>
    navigate(`/plant-stock?species=${encodeURIComponent(commonName)}`);
  const updateSearchQuery = (q: string) => setSearchQuery(q);
  const updateFamilyFilter = (f: string) => setFamilyFilter(f);
  const switchViewMode = (mode: ViewMode) => setViewMode(mode);

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

  const openEditForm = (species: SpeciesItem) => {
    form.reset();
    setEditingItem(species);
    Object.entries(speciesItemToForm(species)).forEach(([key, value]) => {
      form.updateField(key as keyof SpeciesForm, value);
    });
    if (species.image_url) image.setInitialUrl(species.image_url);
    setFormOpen(true);
  };

  // ── Delete Species (with confirmation) ──
  const requestDeleteSpecies = (species: SpeciesItem) => {
    deleteDialog.requestConfirm(String(species.id), {
      title: `Delete ${species.common_name}?`,
      description: `This will permanently remove ${species.scientific_name} (#${species.id}).`,
    });
  };

  const confirmDeleteSpecies = () => {
    deleteDialog.confirm((id) => {
      deleteMutation.mutate(Number(id), {
        onSuccess: () => toast.success("Species deleted"),
        onError: () => toast.error("Failed to delete species"),
      });
    });
  };

  return {
    filteredItems,
    totalCount: meta?.total ?? items.length,
    quickStats,
    families,
    searchQuery,
    updateSearchQuery,
    familyFilter,
    updateFamilyFilter,
    viewMode,
    switchViewMode,
    navigateToDetail,
    navigateToBatches,
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
    isLoading,
    isError,
    fetchError,
    // Delete
    deleteDialog,
    requestDeleteSpecies,
    confirmDeleteSpecies,
    // Pagination
    page,
    setPage,
    meta,
  };
}
