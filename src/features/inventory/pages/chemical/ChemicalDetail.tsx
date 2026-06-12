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
import ChemicalUsageFormDialog from "./ChemicalUsageFormDialog";
import ChemicalDetailRenderer from "./entity-detail/ChemicalDetailRenderer";
import { useChemicalDetail } from "./entity-detail/useChemicalDetail";
import { useChemicalsView } from "./useChemicalsView";
import { useState } from "react";

const ChemicalDetailPage = () => {
  const detail = useChemicalDetail();
  const chemicalsView = useChemicalsView();
  const [usageDialog, setUsageDialog] = useState<{ open: boolean; mode: "use" | "add" }>({ open: false, mode: "use" });

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
    actions: detail.config.actions.map((a) => {
      if (a.label === "Edit") {
        return {
          ...a,
          onClick: () =>
            chemicalsView.openEditForm(
              detail.rawData as Parameters<
                typeof chemicalsView.openEditForm
              >[0],
            ),
        };
      }
      if (a.label === "Use Chemical") {
        return {
          ...a,
          onClick: () => setUsageDialog({ open: true, mode: "use" }),
        };
      }
      if (a.label === "Add Chemical") {
        return {
          ...a,
          onClick: () => setUsageDialog({ open: true, mode: "add" }),
        };
      }
      return a;
    }),
  };

  return (
    <AppLayout>
      <ChemicalDetailRenderer config={config} />
      <ChemicalFormDialog view={chemicalsView} />
      <ChemicalUsageFormDialog
        open={usageDialog.open}
        onOpenChange={(open) => setUsageDialog((s) => ({ ...s, open }))}
        chemical={detail.rawData}
        mode={usageDialog.mode}
      />
    </AppLayout>
  );
};

export default ChemicalDetailPage;
