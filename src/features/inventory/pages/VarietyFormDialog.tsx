/* ═══════════════════════════════════════════════════════════════════════════
 * VarietyFormDialog — Reusable Create/Edit dialog for Plant Varieties.
 * Accepts a `view` from usePlantVarietiesView() so it can be used from
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

import { usePlantVarietiesView } from "./usePlantVarietiesView";

export const VarietyFormDialog = ({
  view,
}: {
  view: ReturnType<typeof usePlantVarietiesView>;
}) => (
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
          <ImageUpload
            label="Variety Image"
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
