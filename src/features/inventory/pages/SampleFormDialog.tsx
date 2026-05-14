/* ═══════════════════════════════════════════════════════════════════════════
 * SampleFormDialog — Reusable Create/Edit dialog for Plant Samples.
 * Accepts a `view` from usePlantSamplesView() so it can be used from
 * both the list page and the detail page.
 * ═══════════════════════════════════════════════════════════════════════════ */

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/shared/components/ImageUpload";

import {
  formatEnumLabel,
  LAB_LOCATIONS,
  SAMPLE_STATUSES,
  usePlantSamplesView,
} from "./usePlantSamplesView";

export const SampleFormDialog = ({
  view,
}: {
  view: ReturnType<typeof usePlantSamplesView>;
}) => (
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
          <Label htmlFor="sample-name">Name *</Label>
          <Input
            id="sample-name"
            autoFocus
            value={view.form.name}
            onChange={(e) =>
              view.setForm({ ...view.form, name: e.target.value })
            }
            placeholder="e.g. Tomato Leaf Sample - Blight Analysis"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Species *</Label>
          <Select
            value={view.form.speciesId}
            onValueChange={(v) => view.setForm({ ...view.form, speciesId: v })}
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
          <Label>Sample Code</Label>
          <Input
            value={view.form.sampleCode}
            onChange={(e) =>
              view.setForm({ ...view.form, sampleCode: e.target.value })
            }
            placeholder="Auto-generated if left blank"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Quantity *</Label>
            <Input
              type="number"
              value={view.form.quantity}
              onChange={(e) =>
                view.setForm({ ...view.form, quantity: e.target.value })
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Lab Location</Label>
            <Select
              value={view.form.labLocation}
              onValueChange={(v) =>
                view.setForm({ ...view.form, labLocation: v })
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
            <Label>Owner Name</Label>
            <Input
              value={view.form.ownerName}
              onChange={(e) =>
                view.setForm({ ...view.form, ownerName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input
              value={view.form.department}
              onChange={(e) =>
                view.setForm({ ...view.form, department: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Origin Location</Label>
          <Input
            value={view.form.originLocation}
            onChange={(e) =>
              view.setForm({ ...view.form, originLocation: e.target.value })
            }
            placeholder="Province, Country"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Date Brought to Lab</Label>
          <Input
            type="date"
            value={view.form.broughtAt}
            onChange={(e) =>
              view.setForm({ ...view.form, broughtAt: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status *</Label>
          <Select
            value={view.form.status}
            onValueChange={(v) => view.setForm({ ...view.form, status: v })}
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
            value={view.form.description}
            onChange={(e) =>
              view.setForm({ ...view.form, description: e.target.value })
            }
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <ImageUpload
            label="Sample Image"
            imageFile={view.form.imageFile}
            imageUrl={view.form.imageUrl}
            previewUrl={view.form.imagePreviewUrl}
            onFileChange={(file) => {
              view.setForm({
                ...view.form,
                imageFile: file,
                imagePreviewUrl: file
                  ? URL.createObjectURL(file)
                  : view.form.imageUrl || "",
              });
            }}
            onUrlChange={(url) => {
              view.setForm({
                ...view.form,
                imageUrl: url,
                imagePreviewUrl: view.form.imageFile
                  ? view.form.imagePreviewUrl
                  : url,
              });
            }}
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
);
