// ═══════════════════════════════════════════════════════════════════════════
// PLANT SPECIES DETAIL PAGE — Composition Root
// ═══════════════════════════════════════════════════════════════════════════
//
// Thin shell: hook → config → renderer.
// Zero business logic. Zero layout. Zero formatting.
// ═══════════════════════════════════════════════════════════════════════════

import AppLayout from "@/core/layouts/AppLayout";
import {
    DetailNotFound,
    DetailSkeleton,
} from "@/shared/components/detail/DetailPageShell";
import { SpeciesFormDialog } from "./SpeciesFormDialog";
import SpeciesDetailRenderer from "./plant-species-detail/SpeciesDetailRenderer";
import { useSpeciesDetail } from "./plant-species-detail/useSpeciesDetail";
import { usePlantSpeciesView } from "./usePlantSpeciesView";

const PlantSpeciesDetailPage = () => {
  const detail = useSpeciesDetail();
  const speciesView = usePlantSpeciesView();

  if (detail.state === "loading") return <DetailSkeleton />;

  if (detail.state === "not-found" || !detail.config) {
    return (
      <DetailNotFound
        category="Plant Species"
        id={detail.id}
        backTo="/inventory/plant-species"
        backLabel="All Species"
      />
    );
  }

  const config = {
    ...detail.config,
    actions: detail.config.actions.map((a) =>
      a.label === "Edit"
        ? {
            ...a,
            onClick: () =>
              speciesView.openEditForm(
                detail.rawData as Parameters<
                  typeof speciesView.openEditForm
                >[0],
              ),
          }
        : a,
    ),
  };

  return (
    <AppLayout>
      <SpeciesDetailRenderer config={config} />
      <SpeciesFormDialog view={speciesView} />
    </AppLayout>
  );
};

export default PlantSpeciesDetailPage;
