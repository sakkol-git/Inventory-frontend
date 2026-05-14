// ═══════════════════════════════════════════════════════════════════════════
// PLANT VARIETY DETAIL PAGE — Composition Root
// ═══════════════════════════════════════════════════════════════════════════

import AppLayout from "@/core/layouts/AppLayout";
import {
  DetailNotFound,
  DetailSkeleton,
} from "@/shared/components/detail/DetailPageShell";
import { VarietyFormDialog } from "./VarietyFormDialog";
import VarietyDetailRenderer from "./plant-variety-detail/VarietyDetailRenderer";
import { useVarietyDetail } from "./plant-variety-detail/useVarietyDetail";
import { usePlantVarietiesView } from "./usePlantVarietiesView";

const PlantVarietyDetailPage = () => {
  const detail = useVarietyDetail();
  const varietiesView = usePlantVarietiesView();

  if (detail.state === "loading") return <DetailSkeleton />;

  if (detail.state === "not-found" || !detail.config) {
    return (
      <DetailNotFound
        category="Plant Variety"
        id={detail.id}
        backTo="/inventory/plant-varieties"
        backLabel="All Varieties"
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
              varietiesView.openEditForm(
                detail.rawData as Parameters<
                  typeof varietiesView.openEditForm
                >[0],
              ),
          }
        : a,
    ),
  };

  return (
    <AppLayout>
      <VarietyDetailRenderer config={config} />
      <VarietyFormDialog view={varietiesView} />
    </AppLayout>
  );
};

export default PlantVarietyDetailPage;
