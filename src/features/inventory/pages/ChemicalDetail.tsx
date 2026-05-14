// ═══════════════════════════════════════════════════════════════════════════
// CHEMICAL DETAIL PAGE — Composition Root
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
import { ChemicalFormDialog } from "./ChemicalFormDialog";
import ChemicalDetailRenderer from "./chemical-detail/ChemicalDetailRenderer";
import { useChemicalDetail } from "./chemical-detail/useChemicalDetail";
import { useChemicalsView } from "./useChemicalsView";

const ChemicalDetailPage = () => {
  const detail = useChemicalDetail();
  const chemicalsView = useChemicalsView();

  if (detail.state === "loading") return <DetailSkeleton />;

  if (detail.state === "not-found" || !detail.config) {
    return (
      <DetailNotFound
        category="Chemical"
        id={detail.id}
        backTo="/inventory/chemicals"
        backLabel="All Chemicals"
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
              chemicalsView.openEditForm(
                detail.rawData as Parameters<
                  typeof chemicalsView.openEditForm
                >[0],
              ),
          }
        : a,
    ),
  };

  return (
    <AppLayout>
      <ChemicalDetailRenderer config={config} />
      <ChemicalFormDialog view={chemicalsView} />
    </AppLayout>
  );
};

export default ChemicalDetailPage;
