// ═══════════════════════════════════════════════════════════════════════════
// PLANT SAMPLE DETAIL PAGE — Composition Root
// ═══════════════════════════════════════════════════════════════════════════

import AppLayout from "@/core/layouts/AppLayout";
import {
  DetailNotFound,
  DetailSkeleton,
} from "@/shared/components/detail/DetailPageShell";
import { SampleFormDialog } from "./SampleFormDialog";
import SampleDetailRenderer from "./plant-sample-detail/SampleDetailRenderer";
import { useSampleDetail } from "./plant-sample-detail/useSampleDetail";
import { usePlantSamplesView } from "./usePlantSamplesView";

const PlantSampleDetailPage = () => {
  const detail = useSampleDetail();
  const samplesView = usePlantSamplesView();

  if (detail.state === "loading") return <DetailSkeleton />;

  if (detail.state === "not-found" || !detail.config) {
    return (
      <DetailNotFound
        category="Plant Sample"
        id={detail.id}
        backTo="/inventory/plant-samples"
        backLabel="All Samples"
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
              samplesView.openEditForm(
                detail.rawData as Parameters<
                  typeof samplesView.openEditForm
                >[0],
              ),
          }
        : a,
    ),
  };

  return (
    <AppLayout>
      <SampleDetailRenderer config={config} />
      <SampleFormDialog view={samplesView} />
    </AppLayout>
  );
};

export default PlantSampleDetailPage;
