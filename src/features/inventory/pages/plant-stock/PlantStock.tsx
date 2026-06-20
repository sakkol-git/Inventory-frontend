/* ═══════════════════════════════════════════════════════════════════════════
 * PlantStock — Plant Stock Management page.
 *
 * All state lives in usePlantStockView().
 * This file is pure declarative JSX — no useState, no business logic.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Pencil, Plus, Sprout, Trash2, Warehouse, MoreHorizontal, ArrowUpCircle, ArrowDownCircle, Bookmark, BookmarkMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { LoadingState } from "@/shared/components/LoadingState";
import PageHeader from "@/shared/components/PageHeader";
import { ServerPagination } from "@/shared/components/ServerPagination";
import { QuickStats } from "@/shared/components/QuickStats";
import SearchFilter from "@/shared/components/SearchFilter";
import { ViewToggle } from "@/shared/components/ViewToggle";
import { AdjustStockDialog } from "./AdjustStockDialog";

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

        {view.isLoading ? (
          <LoadingState variant="skeleton" rows={5} />
        ) : !hasResults && (
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
            onDelete={view.requestDeleteStock}
            onAdjust={view.openAdjustDialog}
          />
        )}

        {hasResults && view.viewMode === "list" && (
          <StockTable
            items={view.filteredItems}
            onNavigate={view.navigateToDetail}
            onEdit={view.openEditForm}
            onDelete={view.requestDeleteStock}
            onAdjust={view.openAdjustDialog}
          />
        )}

        <ServerPagination meta={view.meta} onPageChange={view.setPage} />
      </div>

      <StockFormDialog view={view} />
      <AdjustStockDialog 
        isOpen={view.adjustDialogOpen} 
        onClose={view.closeAdjustDialog} 
        action={view.adjustDialogAction} 
        item={view.adjustDialogItem} 
      />

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
  onAdjust: (item: StockItem, action: any) => void;
}

const StockGrid = ({ items, onNavigate, onEdit, onDelete, onAdjust }: StockListProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
    {items.map((b) => (
      <StockCard key={b.id} item={b} onNavigate={onNavigate} onEdit={onEdit} onDelete={onDelete} onAdjust={onAdjust} />
    ))}
  </div>
);

const StockCard = ({
  item,
  onNavigate,
  onEdit,
  onDelete,
  onAdjust,
}: {
  item: StockItem;
  onNavigate: (id: number) => void;
  onEdit: (b: StockItem) => void;
  onDelete?: (b: StockItem) => void;
  onAdjust: (item: StockItem, action: any) => void;
}) => {
  const sampleName = item.relations.sample?.identity.name || "Unknown Variety";
  const scientificName = "";

  const renderActions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAdjust(item, "restock")} className="gap-2 cursor-pointer">
          <ArrowUpCircle className="h-4 w-4 text-emerald-500" /> Restock
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdjust(item, "consume")} className="gap-2 cursor-pointer">
          <ArrowDownCircle className="h-4 w-4 text-rose-500" /> Consume
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdjust(item, "reserve")} className="gap-2 cursor-pointer">
          <Bookmark className="h-4 w-4 text-amber-500" /> Reserve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdjust(item, "release")} className="gap-2 cursor-pointer">
          <BookmarkMinus className="h-4 w-4 text-blue-500" /> Release
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2 cursor-pointer">
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        {onDelete && (
          <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive gap-2 cursor-pointer">
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="relative group">
      <ProductCard
        fallbackImage={<Sprout className="h-20 w-20 text-muted-foreground/40" />}
        title={sampleName}
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
        className="aspect-square"
        imageBackgroundColor="bg-muted/30"
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {renderActions()}
      </div>
    </div>
  );
};

/* ─── Table View ────────────────────────────────────────────────────────── */

const StockTable = ({
  items,
  onNavigate,
  onEdit,
  onDelete,
  onAdjust,
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
                  {b.relations.sample?.relationships?.variety?.name || "—"}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {b.relations.sample?.relationships?.variety?.plant_species?.scientific_name || ""}
                </p>
              </div>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onAdjust(b, "restock")} className="gap-2 cursor-pointer">
                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" /> Restock
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAdjust(b, "consume")} className="gap-2 cursor-pointer">
                    <ArrowDownCircle className="h-4 w-4 text-rose-500" /> Consume
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAdjust(b, "reserve")} className="gap-2 cursor-pointer">
                    <Bookmark className="h-4 w-4 text-amber-500" /> Reserve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAdjust(b, "release")} className="gap-2 cursor-pointer">
                    <BookmarkMinus className="h-4 w-4 text-blue-500" /> Release
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(b)} className="gap-2 cursor-pointer">
                    <Pencil className="h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(b)} className="text-destructive gap-2 cursor-pointer">
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
          <Label>Sample *</Label>
          <Select
            value={view.form.form.sampleId}
            onValueChange={(v) => view.form.updateField("sampleId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sample" />
            </SelectTrigger>
            <SelectContent>
              {view.samples.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.identity?.name || `Sample #${s.id}`}
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
              value={view.form.form.quantity}
              onChange={(e) => view.form.updateField("quantity", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Reserved Quantity</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 10"
              value={view.form.form.reservedQuantity}
              onChange={(e) =>
                view.form.updateField("reservedQuantity", e.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <Select
            value={view.form.form.status}
            onValueChange={(v) => view.form.updateField("status", v)}
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
        <Button onClick={view.form.submit} disabled={!view.canSubmitForm || view.form.isSubmitting}>
          {view.isEditing ? "Save Changes" : "Add Stock"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
