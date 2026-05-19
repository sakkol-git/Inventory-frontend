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
            value={view.form.form.name}
            onChange={(e) => view.form.updateField("name", e.target.value)}
            placeholder="e.g. Tomato Leaf Sample - Blight Analysis"
          />
          {view.form.errors.name && (
            <p className="text-xs text-destructive">{view.form.errors.name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Variety *</Label>
          <Select
            value={view.form.form.varietyId}
            onValueChange={(v) => view.form.updateField("varietyId", v)}
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
          {view.form.errors.varietyId && (
            <p className="text-xs text-destructive">{view.form.errors.varietyId}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Sample Code</Label>
          <Input
            value={view.form.form.sampleCode}
            onChange={(e) =>
              view.form.updateField("sampleCode", e.target.value)
            }
            placeholder="Auto-generated if left blank"
          />
          {view.form.errors.sampleCode && (
            <p className="text-xs text-destructive">{view.form.errors.sampleCode}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Quantity *</Label>
            <Input
              type="number"
              value={view.form.form.quantity}
              onChange={(e) =>
                view.form.updateField("quantity", e.target.value)
              }
              placeholder="0"
            />
            {view.form.errors.quantity && (
              <p className="text-xs text-destructive">{view.form.errors.quantity}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Lab Location</Label>
            <Select
              value={view.form.form.labLocation}
              onValueChange={(v) =>
                view.form.updateField("labLocation", v)
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
            {view.form.errors.labLocation && (
              <p className="text-xs text-destructive">{view.form.errors.labLocation}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Owner Name</Label>
            <Input
              value={view.form.form.ownerName}
              onChange={(e) =>
                view.form.updateField("ownerName", e.target.value)
              }
            />
            {view.form.errors.ownerName && (
              <p className="text-xs text-destructive">{view.form.errors.ownerName}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input
              value={view.form.form.department}
              onChange={(e) =>
                view.form.updateField("department", e.target.value)
              }
            />
            {view.form.errors.department && (
              <p className="text-xs text-destructive">{view.form.errors.department}</p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Origin Location</Label>
          <Input
            value={view.form.form.originLocation}
            onChange={(e) =>
              view.form.updateField("originLocation", e.target.value)
            }
            placeholder="Province, Country"
          />
          {view.form.errors.originLocation && (
            <p className="text-xs text-destructive">{view.form.errors.originLocation}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Date Brought to Lab</Label>
          <Input
            type="date"
            value={view.form.form.broughtAt}
            onChange={(e) =>
              view.form.updateField("broughtAt", e.target.value)
            }
          />
          {view.form.errors.broughtAt && (
            <p className="text-xs text-destructive">{view.form.errors.broughtAt}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Status *</Label>
          <Select
            value={view.form.form.status}
            onValueChange={(v) => view.form.updateField("status", v)}
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
          {view.form.errors.status && (
            <p className="text-xs text-destructive">{view.form.errors.status}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            value={view.form.form.description}
            onChange={(e) =>
              view.form.updateField("description", e.target.value)
            }
            rows={3}
          />
          {view.form.errors.description && (
            <p className="text-xs text-destructive">{view.form.errors.description}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <ImageUpload
            label="Sample Image"
            imageFile={view.imageUpload.imageFile}
            imageUrl={view.form.form.imageUrl}
            previewUrl={view.imageUpload.imagePreviewUrl}
            onFileChange={view.imageUpload.handleImageChange}
            onUrlChange={(url) => {
              view.form.updateField("imageUrl", url);
              view.imageUpload.setImageUrl(url);
            }}
          />
          {view.form.errors.imageUrl && (
            <p className="text-xs text-destructive">{view.form.errors.imageUrl}</p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => view.setDialogOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => view.form.submit()}
          disabled={!view.form.form.name || !view.form.form.varietyId || !view.form.form.quantity || view.form.isSubmitting}
        >
          {view.editingId ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
