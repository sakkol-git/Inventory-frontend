/* ═══════════════════════════════════════════════════════════════════════════
 * PlantStock — Plant Stock Management page.
 *
 * All state lives in usePlantStockView().
 * This file is pure declarative JSX — no useState, no business logic.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Pencil, Plus, Sprout, Trash2, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/ui/ProductCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import EmptyState from "@/shared/components/EmptyState";
import PageHeader from "@/shared/components/PageHeader";
import { QuickStats } from "@/shared/components/QuickStats";
import SearchFilter from "@/shared/components/SearchFilter";
import { ViewToggle } from "@/shared/components/ViewToggle";

import {
    formatEnumLabel,
    statusStyle,
    STOCK_STATUSES,
    usePlantStockView,
    type StockItem,
} from "./usePlantStockView";

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

const PlantStock = () => {
  const view = usePlantStockView();
  const hasResults = view.filteredItems.length > 0;

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={Warehouse}
          title="Plant Stock Management"
          description="Track and manage plant inventory and stock levels"
          actions={
            <Button className="gap-2" onClick={view.openCreateForm}>
              <Plus className="h-4 w-4" /> Add Stock
            </Button>
          }
        />

        <QuickStats stats={view.quickStats} />

        <SearchFilter
          query={view.searchQuery}
          onQueryChange={view.updateSearchQuery}
          placeholder="Search by species name or stock ID..."
        >
          <StatusFilter
            value={view.statusFilter}
            onChange={view.updateStatusFilter}
          />
          <ViewToggle current={view.viewMode} onChange={view.switchViewMode} />
        </SearchFilter>

        {!hasResults && (
          <EmptyState
            icon={Warehouse}
            title="No stock entries found"
            description="Try adjusting your search or filters."
          />
        )}

        {hasResults && view.viewMode === "grid" && (
          <StockGrid
            items={view.filteredItems}
            onNavigate={view.navigateToDetail}
            onEdit={view.openEditForm}
          />
        )}

        {hasResults && view.viewMode === "list" && (
          <StockTable
            items={view.filteredItems}
            onNavigate={view.navigateToDetail}
            onEdit={view.openEditForm}
            onDelete={view.requestDeleteStock}
          />
        )}

        <footer className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {view.filteredItems.length} of {view.totalCount} stock
            entries
          </p>
        </footer>
      </div>

      <StockFormDialog view={view} />

      <ConfirmDialog
        open={view.deleteDialog.open}
        onOpenChange={view.deleteDialog.setOpen}
        onConfirm={view.confirmDeleteStock}
        title={view.deleteDialog.pendingMeta.title}
        description={view.deleteDialog.pendingMeta.description}
        confirmLabel="Delete"
        variant="destructive"
      />
    </AppLayout>
  );
};

export default PlantStock;

/* ═══════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Status Filter ─────────────────────────────────────────────────────── */

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
      {STOCK_STATUSES.map((s) => (
        <SelectItem key={s} value={s}>
          {formatEnumLabel(s)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/* ─── Grid View ─────────────────────────────────────────────────────────── */

interface StockListProps {
  items: StockItem[];
  onNavigate: (id: number) => void;
  onEdit: (b: StockItem) => void;
  onDelete?: (b: StockItem) => void;
}

const StockGrid = ({ items, onNavigate, onEdit }: StockListProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
    {items.map((b) => (
      <StockCard key={b.id} item={b} onNavigate={onNavigate} onEdit={onEdit} />
    ))}
  </div>
);

const StockCard = ({
  item,
  onNavigate,
  onEdit,
}: {
  item: StockItem;
  onNavigate: (id: number) => void;
  onEdit: (b: StockItem) => void;
}) => {
  const speciesName = item.relations.species?.common_name || "Unknown Species";
  const scientificName = item.relations.species?.scientific_name || "";

  return (
    <ProductCard
      fallbackImage={<Sprout className="h-20 w-20 text-muted-foreground/40" />}
      title={speciesName}
      subtitle={scientificName}
      id={`#${item.id}`}
      statusBadge={
        <span className={statusStyle(item.inventory.status)}>
          {formatEnumLabel(item.inventory.status)}
        </span>
      }
      meta={[
        { label: "Total:", value: item.inventory.total },
        { label: "Reserved:", value: item.inventory.reserved },
        { label: "Available:", value: item.inventory.net_available },
      ]}
      onClick={() => onNavigate(item.id)}
      onEdit={() => onEdit(item)}
      className="aspect-square"
      imageBackgroundColor="bg-muted/30"
    />
  );
};

/* ─── Table View ────────────────────────────────────────────────────────── */

const StockTable = ({
  items,
  onNavigate,
  onEdit,
  onDelete,
}: StockListProps) => (
  <div className="rounded-xl overflow-hidden border border-border/40">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">ID</TableHead>
          <TableHead>Species</TableHead>
          <TableHead>Variety</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Reserved</TableHead>
          <TableHead className="text-right">Available</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((b) => (
          <TableRow
            key={b.id}
            className="cursor-pointer"
            onClick={() => onNavigate(b.id)}
          >
            <TableCell className="font-mono text-xs text-muted-foreground">
              #{b.id}
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">
                  {b.relations.species?.common_name || "—"}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {b.relations.species?.scientific_name || ""}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {b.relations.variety?.name || "—"}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {b.inventory.total}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {b.inventory.reserved}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {b.inventory.net_available}
            </TableCell>
            <TableCell>
              <span className={statusStyle(b.inventory.status)}>
                {formatEnumLabel(b.inventory.status)}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(b);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(b);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

/* ─── Form Dialog ───────────────────────────────────────────────────────── */

const StockFormDialog = ({
  view,
}: {
  view: ReturnType<typeof usePlantStockView>;
}) => (
  <Dialog
    open={view.formOpen}
    onOpenChange={(open) => {
      if (!open) view.closeForm();
    }}
  >
    <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{view.formTitle}</DialogTitle>
        <DialogDescription>{view.formDescription}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> indicates a required field
        </p>

        <div className="space-y-2">
          <Label>Species *</Label>
          <Select
            value={view.form.speciesId}
            onValueChange={(v) => view.updateFormField("speciesId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select species" />
            </SelectTrigger>
            <SelectContent>
              {view.species.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.common_name} ({s.scientific_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 150"
              value={view.form.quantity}
              onChange={(e) => view.updateFormField("quantity", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Reserved Quantity</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 10"
              value={view.form.reservedQuantity}
              onChange={(e) =>
                view.updateFormField("reservedQuantity", e.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <Select
            value={view.form.status}
            onValueChange={(v) => view.updateFormField("status", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatEnumLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={view.closeForm}>
          Cancel
        </Button>
        <Button onClick={view.submitStockForm} disabled={!view.canSubmitForm}>
          {view.isEditing ? "Save Changes" : "Add Stock"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
