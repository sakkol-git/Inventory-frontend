// ═══════════════════════════════════════════════════════════════════════════
// PLANT STOCK DETAIL PAGE — Composition Root
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
import { StockFormDialog } from "./StockFormDialog";
import StockDetailRenderer from "./plant-stock-detail/StockDetailRenderer";
import { useStockDetail } from "./plant-stock-detail/useStockDetail";
import { usePlantStockView } from "./usePlantStockView";

const PlantStockDetailPage = () => {
  const detail = useStockDetail();
  const stockView = usePlantStockView();

  if (detail.state === "loading") return <DetailSkeleton />;

  if (detail.state === "not-found" || !detail.config) {
    return (
      <DetailNotFound
        category="Plant Stock"
        id={detail.id}
        backTo="/inventory/plant-stock"
        backLabel="All Stock"
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
              stockView.openEditForm(
                detail.rawData as Parameters<typeof stockView.openEditForm>[0],
              ),
          }
        : a,
    ),
  };

  return (
    <AppLayout>
      <StockDetailRenderer config={config} />
      <StockFormDialog view={stockView} />
    </AppLayout>
  );
};

export default PlantStockDetailPage;
