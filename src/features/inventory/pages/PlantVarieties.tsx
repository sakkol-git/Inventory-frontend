/* ═══════════════════════════════════════════════════════════════════════════
 * PlantVarieties — Plant varieties listing page (sub-level of species).
 *
 * All state lives in usePlantVarietiesView().
 * This file is pure declarative JSX — no useState, no business logic.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Leaf, Pencil, Plus, Trash2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import EmptyState from "@/shared/components/EmptyState";
import { ExportButton } from "@/shared/components/ExportButton";
import PageHeader from "@/shared/components/PageHeader";
import { QuickStats } from "@/shared/components/QuickStats";
import SearchFilter from "@/shared/components/SearchFilter";
import { ViewToggle } from "@/shared/components/ViewToggle";
import { usePlantVarietiesView } from "./usePlantVarietiesView";

const PlantVarieties = () => {
  const view = usePlantVarietiesView();
  const hasResults = view.filteredItems.length > 0;

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={Leaf}
          title="Plant Varieties"
          description="Plant varieties and cultivars under each species"
          actions={
            <Button className="gap-2" onClick={view.openCreateForm}>
              <Plus className="h-4 w-4" />
              Add Variety
            </Button>
          }
        />

        <QuickStats stats={view.stats} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <SearchFilter
            query={view.searchQuery}
            onQueryChange={view.setSearchQuery}
            placeholder="Search varieties by name, code, species, owner..."
          />
          <div className="flex items-center gap-2">
            <ViewToggle current={view.viewMode} onChange={view.setViewMode} />
            <ExportButton
              data={view.filteredItems}
              filename="plant-varieties"
              columns={[
                { key: "variety_code", label: "Code" },
                { key: "name", label: "Name" },
                { key: "description", label: "Description" },
              ]}
            />
          </div>
        </div>

        {!hasResults ? (
          <EmptyState
            title="No varieties found"
            description="Try adjusting your search or add a new variety."
          />
        ) : view.viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
            {view.filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <ProductCard
                  key={item.id}
                  image={item.image_url || undefined}
                  fallbackImage={
                    <>
                      <Icon
                        className="h-16 w-16 transition-transform duration-200 group-hover:scale-110"
                        style={{ color: "hsl(142, 71%, 45%)" }}
                        strokeWidth={1.2}
                      />
                      <span className="mt-3 text-xs font-medium tracking-widest text-muted-foreground">
                        {item.plant_species?.common_name ?? "—"}
                      </span>
                    </>
                  }
                  title={item.name}
                  subtitle={item.variety_code}
                  id={item.variety_code}
                  statusBadge={undefined}
                  meta={[
                    {
                      label: "Species:",
                      value: item.plant_species?.common_name ?? "—",
                    },
                    item.description
                      ? { label: "Desc:", value: item.description }
                      : null,
                  ].filter((x): x is NonNullable<typeof x> => x !== null)}
                  tags={[]}
                  onClick={() =>
                    view.navigate(`/inventory/products/varieties/${item.id}`)
                  }
                  onEdit={() => view.openEditForm(item)}
                  imageBackgroundColor="bg-emerald-50 dark:bg-emerald-950/30"
                  className="aspect-square"
                />
              );
            })}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {view.filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      {item.variety_code}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-xs italic">
                      {item.plant_species?.common_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {item.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => view.openEditForm(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => view.requestDeleteVariety(item)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={view.dialogOpen} onOpenChange={view.setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {view.editingId ? "Edit Variety" : "Add New Variety"}
            </DialogTitle>
            <DialogDescription>
              {view.editingId
                ? "Update variety information."
                : "Register a new plant variety."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="variety-name">Name *</Label>
              <Input
                id="variety-name"
                autoFocus
                value={view.form.name}
                onChange={(e) =>
                  view.setForm({ ...view.form, name: e.target.value })
                }
                placeholder="e.g. Cherry Tomato - Sweet 100"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Species *</Label>
              <Select
                value={view.form.speciesId}
                onValueChange={(v) =>
                  view.setForm({ ...view.form, speciesId: v })
                }
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
            <div className="space-y-1.5">
              <Label>Variety Code</Label>
              <Input
                value={view.form.varietyCode}
                onChange={(e) =>
                  view.setForm({ ...view.form, varietyCode: e.target.value })
                }
                placeholder="Auto-generated if left blank"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={view.form.description}
                onChange={(e) =>
                  view.setForm({ ...view.form, description: e.target.value })
                }
                placeholder="Variety description..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                value={view.form.imageUrl}
                onChange={(e) =>
                  view.setForm({ ...view.form, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => view.setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={view.handleSave}>
              {view.editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        open={view.deleteDialog.open}
        onOpenChange={view.deleteDialog.setOpen}
        onConfirm={view.confirmDeleteVariety}
        title={view.deleteDialog.pendingMeta.title}
        description={view.deleteDialog.pendingMeta.description}
        confirmLabel="Delete"
        variant="destructive"
      />
    </AppLayout>
  );
};

export default PlantVarieties;
