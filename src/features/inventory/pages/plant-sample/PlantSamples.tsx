/* ═══════════════════════════════════════════════════════════════════════════
 * PlantSamples — Plant samples listing page.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { MapPin, Pencil, Plus, TestTube, Trash2, User } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { FilterChips } from "@/shared/components/FilterChips";
import PageHeader from "@/shared/components/PageHeader";
import { QuickStats } from "@/shared/components/QuickStats";
import SearchFilter from "@/shared/components/SearchFilter";
import { ViewToggle } from "@/shared/components/ViewToggle";
import { useAnnounceEffect } from "@/shared/hooks/useAnnounce";
import { cn } from "@/shared/lib/utils";

import {
    formatEnumLabel,
    LAB_LOCATIONS,
    SAMPLE_STATUSES,
    STATUS_COLORS,
    usePlantSamplesView,
} from "./usePlantSamplesView";

const PreviewImg = ({ src }: { src: string }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <img
      src={src}
      alt="Preview"
      className="mt-1 h-24 w-full object-cover rounded-md border"
      onError={() => setVisible(false)}
    />
  );
};

const PlantSamples = () => {
  const view = usePlantSamplesView();
  const hasResults = view.filteredItems.length > 0;

  useAnnounceEffect(
    view.filteredItems.length > 0
      ? `${view.filteredItems.length} samples found`
      : "No samples found",
    [view.filteredItems.length],
  );

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={TestTube}
          title="Plant Samples"
          description="Collected plant samples for research and analysis"
          actions={
            <Button className="gap-2" onClick={view.openCreateForm}>
              <Plus className="h-4 w-4" />
              Add Sample
            </Button>
          }
        />

        <QuickStats stats={view.stats} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <SearchFilter
            query={view.searchQuery}
            onQueryChange={view.setSearchQuery}
            placeholder="Search samples by name, code, species, user..."
          />
          <div className="flex items-center gap-2">
            <Select
              value={view.statusFilter}
              onValueChange={view.setStatusFilter}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {SAMPLE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatEnumLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ViewToggle current={view.viewMode} onChange={view.setViewMode} />
            <ExportButton
              data={view.filteredItems}
              filename="plant-samples"
              columns={[
                { key: "identity.code", label: "Code" },
                { key: "identity.name", label: "Name" },
                { key: "identity.status", label: "Status" },
                { key: "details.quantity", label: "Quantity" },
                { key: "lab_info.location", label: "Storage" },
                { key: "details.owner", label: "User" },
              ]}
            />
          </div>
        </div>

        <FilterChips
          filters={
            view.statusFilter !== "all"
              ? [
                  {
                    id: "status",
                    label: "Status",
                    value: formatEnumLabel(view.statusFilter),
                  },
                ]
              : []
          }
          onRemove={() => view.setStatusFilter("all")}
        />

        {!hasResults ? (
          <EmptyState
            title="No samples found"
            description="Try adjusting your search or add a new sample."
          />
        ) : view.viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
            {view.filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <ProductCard
                  key={item.id}
                  image={item.meta.image || undefined}
                  fallbackImage={
                    <>
                      <Icon
                        className="h-16 w-16 transition-transform duration-200 group-hover:scale-110"
                        style={{ color: "hsl(217, 91%, 60%)" }}
                        strokeWidth={1.2}
                      />
                      <span className="mt-3 text-xs font-medium tracking-widest text-muted-foreground">
                        {item.relationships.variety?.name ?? "—"}
                      </span>
                    </>
                  }
                  title={item.identity.name}
                  subtitle={
                    item.relationships.variety?.name
                      ? `${item.relationships.variety.name} • ${item.identity.code}`
                      : item.identity.code
                  }
                  id={item.identity.code}
                  statusBadge={
                    <Badge
                      className={cn(
                        "text-xs shrink-0",
                        STATUS_COLORS[item.identity.status] ?? "",
                      )}
                    >
                      {formatEnumLabel(item.identity.status)}
                    </Badge>
                  }
                  meta={[
                    item.relationships.variety?.name
                      ? {
                          label: "Variety:",
                          value: item.relationships.variety.name,
                        }
                      : null,
                    item.details.owner
                      ? {
                          icon: User,
                          value: item.details.owner,
                        }
                      : item.relationships.contributor?.name
                        ? {
                            icon: User,
                            value: item.relationships.contributor.name,
                          }
                        : null,
                    item.details.origin
                      ? { icon: MapPin, value: item.details.origin }
                      : null,
                  ].filter((x): x is NonNullable<typeof x> => x !== null)}
                  tags={[]}
                  onClick={() =>
                    view.navigate(`/inventory/products/samples/${item.id}`)
                  }
                  onEdit={() => view.openEditForm(item)}
                  onDelete={() => view.requestDeleteSample(item)}
                  imageBackgroundColor="bg-blue-50 dark:bg-blue-950/30"
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
                  <TableHead>Variety</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {view.filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      {item.identity.code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.identity.name}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.relationships.variety?.name || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.details.quantity}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.lab_info.location
                        ? formatEnumLabel(item.lab_info.location)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.details.owner ?? item.relationships.contributor?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-xs",
                          STATUS_COLORS[item.identity.status] ?? "",
                        )}
                      >
                        {formatEnumLabel(item.identity.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => view.openEditForm(item)}
                        aria-label={`Edit ${item.identity.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => view.requestDeleteSample(item)}
                        aria-label={`Delete ${item.identity.name}`}
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
              {view.editingId ? "Edit Sample" : "Add New Sample"}
            </DialogTitle>
            <DialogDescription>
              {view.editingId
                ? "Update sample information."
                : "Register a new plant sample."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                id="sample-name"
                value={view.form.form.name}
                onChange={(e) =>
                  view.form.updateField('name', e.target.value)
                }
                placeholder="e.g. Tomato Leaf Sample - Blight Analysis"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Variety *</Label>
              <Select
                value={view.form.form.varietyId}
                onValueChange={(v) =>
                  view.form.updateField('varietyId', v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variety" />
                </SelectTrigger>
                <SelectContent>
                  {view.varieties.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sample Code</Label>
              <Input
                value={view.form.form.sampleCode}
                onChange={(e) =>
                  view.form.updateField('sampleCode', e.target.value)
                }
                placeholder="Auto-generated if left blank"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Lab Location</Label>
                <Select
                  value={view.form.form.labLocation}
                  onValueChange={(v) =>
                    view.form.updateField('labLocation', v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAB_LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {formatEnumLabel(loc)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>User *</Label>
                <Select
                  value={view.form.form.userId}
                  onValueChange={(v) => view.form.updateField('userId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {view.users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input
                  value={view.form.form.department}
                  onChange={(e) =>
                    view.form.updateField(
                      'department',
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Origin Location</Label>
              <Input
                value={view.form.form.originLocation}
                onChange={(e) =>
                  view.form.updateField('originLocation', e.target.value)
                }
                placeholder="Province, Country"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date Brought to Lab</Label>
              <Input
                type="date"
                value={view.form.form.broughtAt}
                onChange={(e) =>
                  view.form.updateField('broughtAt', e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select
                value={view.form.form.status}
                onValueChange={(v) => view.form.updateField('status', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatEnumLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={view.form.form.description}
                onChange={(e) =>
                  view.form.updateField('description', e.target.value)
                }
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                value={view.form.form.imageUrl}
                onChange={(e) =>
                  view.form.updateField('imageUrl', e.target.value)
                }
                placeholder="https://..."
              />
              {view.form.form.imageUrl && <PreviewImg src={view.form.form.imageUrl} />}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => view.setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={view.form.submit}
              disabled={!view.form.form.name || !view.form.form.varietyId || !view.form.form.userId || view.form.isSubmitting}
            >
              {view.editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        open={view.deleteDialog.open}
        onOpenChange={view.deleteDialog.setOpen}
        onConfirm={view.confirmDeleteSample}
        title={view.deleteDialog.pendingMeta.title}
        description={view.deleteDialog.pendingMeta.description}
        confirmLabel="Delete"
        variant="destructive"
      />
    </AppLayout>
  );
};

export default PlantSamples;
