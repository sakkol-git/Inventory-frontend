/* ═══════════════════════════════════════════════════════════════════════════
 * Equipment — Inventory listing page (composition root).
 *
 * Uses ListPage shell. All state lives in useEquipmentView().
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ListPage } from "@/shared/components/ListPage";
import { Wrench } from "lucide-react";
import { useState } from "react";

import { BorrowEquipmentDialog } from "./BorrowEquipmentDialog";
import { EquipmentFormDialog } from "./EquipmentFormDialog";
import { EquipmentGrid } from "./EquipmentGrid";
import { EquipmentTable } from "./EquipmentTable";
import {
    EQUIPMENT_STATUSES,
    EquipmentItem,
    formatEnumLabel,
    useEquipmentView,
} from "./useEquipmentView";

/* ─── Status Filter (co-located — too small to extract) ─────────────────── */

const StatusFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-40">
      <SelectValue placeholder="All Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      {EQUIPMENT_STATUSES.map((s) => (
        <SelectItem key={s} value={s}>
          {formatEnumLabel(s)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

const Equipment = () => {
  const view = useEquipmentView();

  // ── Borrow / Return dialog state ──
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [borrowMode, setBorrowMode] = useState<"borrow" | "return">("borrow");
  const [borrowTarget, setBorrowTarget] = useState<EquipmentItem | null>(null);

  const handleBorrow = (eq: EquipmentItem) => {
    setBorrowTarget(eq);
    setBorrowMode("borrow");
    setBorrowDialogOpen(true);
  };

  const handleReturn = (eq: EquipmentItem) => {
    setBorrowTarget(eq);
    setBorrowMode("return");
    setBorrowDialogOpen(true);
  };

  return (
    <ListPage
      icon={Wrench}
      title="Equipment Inventory"
      description="Track lab equipment and manage availability"
      addLabel="Add Equipment"
      onAdd={view.openCreateForm}
      stats={view.quickStats}
      searchPlaceholder="Search equipment..."
      searchQuery={view.searchQuery}
      onSearchChange={view.updateSearchQuery}
      viewMode={view.viewMode}
      onViewModeChange={view.switchViewMode}
      items={view.filteredItems}
      isLoading={view.isLoading}
      isError={view.isError}
      emptyTitle="No equipment found"
      emptyDescription="Try adjusting your search or status filter."
      filterSlot={
        <StatusFilter
          value={view.statusFilter}
          onChange={view.updateStatusFilter}
        />
      }
      renderGrid={(items) => (
        <EquipmentGrid
          items={items}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteEquipment}
          onBorrow={handleBorrow}
          onReturn={handleReturn}
        />
      )}
      renderTable={(items) => (
        <EquipmentTable
          items={items}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteEquipment}
          onBorrow={handleBorrow}
          onReturn={handleReturn}
        />
      )}
    >
      <EquipmentFormDialog view={view} />
      <ConfirmDialog
        open={view.deleteDialog.open}
        onOpenChange={view.deleteDialog.setOpen}
        onConfirm={view.confirmDeleteEquipment}
        title={view.deleteDialog.pendingMeta.title}
        description={view.deleteDialog.pendingMeta.description}
      />
      <BorrowEquipmentDialog
        open={borrowDialogOpen}
        onOpenChange={setBorrowDialogOpen}
        equipment={borrowTarget}
        mode={borrowMode}
      />
    </ListPage>
  );
};

export default Equipment;
