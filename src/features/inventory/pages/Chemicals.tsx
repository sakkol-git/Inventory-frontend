/* ═══════════════════════════════════════════════════════════════════════════
 * Chemicals — Chemical inventory listing page (composition root).
 *
 * Uses ListPage shell. All state lives in useChemicalsView().
 * ═══════════════════════════════════════════════════════════════════════════ */

import { AlertTriangle, FlaskConical } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ListPage } from "@/shared/components/ListPage";

import { ChemicalFormDialog } from "./ChemicalFormDialog";
import { ChemicalGrid } from "./ChemicalGrid";
import { ChemicalTable } from "./ChemicalTable";
import { useChemicalsView } from "./useChemicalsView";

/* ─── Safety Alert (co-located — too small to extract) ──────────────────── */

const SafetyAlert = ({
  expiredCount,
  expiringSoonCount,
}: {
  expiredCount: number;
  expiringSoonCount: number;
}) => {
  if (expiredCount === 0 && expiringSoonCount === 0) return null;
  return (
    <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
      <div>
        <p className="text-sm font-medium text-destructive">Safety Alert</p>
        <p className="text-sm text-muted-foreground">
          {expiredCount} expired chemical(s) and {expiringSoonCount} item(s)
          expiring within 14 days require attention.
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

const Chemicals = () => {
  const view = useChemicalsView();

  return (
    <ListPage
      icon={FlaskConical}
      title="Chemical Inventory"
      description="Track chemicals, reagents, and hazardous materials"
      addLabel="Add Chemical"
      onAdd={view.openCreateForm}
      stats={view.quickStats}
      searchPlaceholder="Search by name, code, or ID..."
      searchQuery={view.searchQuery}
      onSearchChange={view.updateSearchQuery}
      viewMode={view.viewMode}
      onViewModeChange={view.switchViewMode}
      items={view.filteredItems}
      emptyTitle="No chemicals found"
      emptyDescription="Try adjusting your search."
      alertSlot={
        <SafetyAlert
          expiredCount={view.expiredCount}
          expiringSoonCount={view.expiringSoonCount}
        />
      }
      renderGrid={(items) => (
        <ChemicalGrid
          items={items}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
        />
      )}
      renderTable={(items) => (
        <ChemicalTable
          items={items}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteChemical}
        />
      )}
    >
      <ChemicalFormDialog view={view} />
      <ConfirmDialog
        open={view.deleteDialog.open}
        onOpenChange={view.deleteDialog.setOpen}
        onConfirm={view.confirmDeleteChemical}
        title={view.deleteDialog.pendingMeta.title}
        description={view.deleteDialog.pendingMeta.description}
        confirmLabel="Delete"
        variant="destructive"
      />
    </ListPage>
  );
};

export default Chemicals;
