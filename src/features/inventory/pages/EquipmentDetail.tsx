// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT DETAIL PAGE — Composition Root
// ═══════════════════════════════════════════════════════════════════════════
//
// This is a thin shell: hook → config → renderer.
// Zero business logic. Zero layout. Zero formatting.
// ═══════════════════════════════════════════════════════════════════════════

import AppLayout from "@/core/layouts/AppLayout";
import {
  DetailNotFound,
  DetailSkeleton,
} from "@/shared/components/detail/DetailPageShell";
import { EquipmentFormDialog } from "./EquipmentFormDialog";
import EquipmentDetailRenderer from "./equipment-detail/EquipmentDetailRenderer";
import { useEquipmentDetail } from "./equipment-detail/useEquipmentDetail";
import { useEquipmentView } from "./useEquipmentView";

const EquipmentDetailPage = () => {
  const detail = useEquipmentDetail();
  const equipmentView = useEquipmentView();

  if (detail.state === "loading") return <DetailSkeleton />;

  if (detail.state === "not-found" || !detail.config) {
    return (
      <DetailNotFound
        category="Equipment"
        id={detail.id}
        backTo="/inventory/equipment"
        backLabel="All Equipment"
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
              equipmentView.openEditForm(
                detail.rawData as Parameters<
                  typeof equipmentView.openEditForm
                >[0],
              ),
          }
        : a,
    ),
  };

  return (
    <AppLayout>
      <EquipmentDetailRenderer config={config} />
      <EquipmentFormDialog view={equipmentView} />
    </AppLayout>
  );
};

export default EquipmentDetailPage;
