/* ═══════════════════════════════════════════════════════════════════════════
 * SpeciesFormDialog — Create/edit form dialog for Plant Species page.
 * Extracted from PlantSpecies.tsx for single-responsibility.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Leaf } from "lucide-react";

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
    FAMILY_ICONS,
    usePlantSpeciesView,
    type SpeciesForm,
} from "./usePlantSpeciesView";

/* ─── Form Dialog ────────────────────────────────────────────────────────── */

export const SpeciesFormDialog = ({
  view,
}: {
  view: ReturnType<typeof usePlantSpeciesView>;
}) => {
  const { form: formData, errors: formErrors } = view.form;

  return (
    <Dialog
      open={view.formOpen}
      onOpenChange={(open) => {
        if (!open) view.closeForm();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{view.formTitle}</DialogTitle>
          <DialogDescription>{view.formDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> indicates a required field
          </p>

          <BasicInfoSection
            form={formData}
            onUpdateField={view.form.updateField}
            formErrors={formErrors}
          />

          <div className="space-y-2">
            <ImageUpload
              label="Species Image"
              imageFile={view.image.imageFile}
              imageUrl={formData.imageUrl}
              previewUrl={view.image.imagePreviewUrl}
              onFileChange={(file) => {
                view.image.handleImageChange(file);
                if (!file) {
                  view.form.updateField("imageUrl", "");
                }
              }}
              onUrlChange={(url) => {
                view.image.setImageUrl(url);
                view.form.updateField("imageUrl", url);
              }}
              error={formErrors.imageUrl}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={view.closeForm}>
            Cancel
          </Button>
          <Button
            onClick={() => view.form.submit()}
            disabled={!view.canSubmitForm || view.form.isSubmitting}
          >
            {view.form.isSubmitting
              ? "Saving..."
              : view.isEditing
                ? "Save Changes"
                : "Add Species"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Form Sections ──────────────────────────────────────────────────────── */

type FormSectionProps = {
  form: SpeciesForm;
  onUpdateField: <K extends keyof SpeciesForm>(
    field: K,
    value: SpeciesForm[K],
  ) => void;
  formErrors?: Partial<Record<keyof SpeciesForm, string>>;
};

const BasicInfoSection = ({
  form,
  onUpdateField,
  formErrors = {},
}: FormSectionProps) => (
  <fieldset>
    <legend className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
      <Leaf className="h-4 w-4 text-muted-foreground/60" /> Basic Information
    </legend>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="sp-common">
          Common Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sp-common"
          placeholder="e.g., Tomato"
          value={form.commonName}
          onChange={(e) => onUpdateField("commonName", e.target.value)}
          maxLength={255}
          aria-invalid={!!formErrors.commonName}
          className={formErrors.commonName ? "border-destructive" : ""}
        />
        {formErrors.commonName && (
          <p className="text-xs text-destructive">{formErrors.commonName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-khmer">Khmer Name</Label>
        <Input
          id="sp-khmer"
          placeholder="e.g., បេកប៉ោះ"
          value={form.khmerName}
          onChange={(e) => onUpdateField("khmerName", e.target.value)}
          maxLength={255}
          aria-invalid={!!formErrors.khmerName}
          className={formErrors.khmerName ? "border-destructive" : ""}
        />
        {formErrors.khmerName && (
          <p className="text-xs text-destructive">{formErrors.khmerName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-sci">
          Scientific Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sp-sci"
          placeholder="e.g., Solanum lycopersicum"
          value={form.scientificName}
          onChange={(e) => onUpdateField("scientificName", e.target.value)}
          maxLength={255}
          aria-invalid={!!formErrors.scientificName}
          className={formErrors.scientificName ? "border-destructive" : ""}
        />
        {formErrors.scientificName && (
          <p className="text-xs text-destructive">{formErrors.scientificName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-fam">Family</Label>
        <Select
          value={form.family}
          onValueChange={(v) => onUpdateField("family", v)}
        >
          <SelectTrigger
            id="sp-fam"
            className={formErrors.family ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select family" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(FAMILY_ICONS).map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.family && (
          <p className="text-xs text-destructive">{formErrors.family}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-growth">
          Growth Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.growthType}
          onValueChange={(v) => onUpdateField("growthType", v)}
        >
          <SelectTrigger
            id="sp-growth"
            className={formErrors.growthType ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="herb">Herb</SelectItem>
            <SelectItem value="shrub">Shrub</SelectItem>
            <SelectItem value="tree">Tree</SelectItem>
            <SelectItem value="vine">Vine</SelectItem>
            <SelectItem value="grass">Grass</SelectItem>
            <SelectItem value="aquatic">Aquatic</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.growthType && (
          <p className="text-xs text-destructive">{formErrors.growthType}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-region">Native Region</Label>
        <Input
          id="sp-region"
          placeholder="e.g., Western South America"
          value={form.nativeRegion}
          onChange={(e) => onUpdateField("nativeRegion", e.target.value)}
          maxLength={255}
          aria-invalid={!!formErrors.nativeRegion}
          className={formErrors.nativeRegion ? "border-destructive" : ""}
        />
        {formErrors.nativeRegion && (
          <p className="text-xs text-destructive">{formErrors.nativeRegion}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-prop">Propagation Method</Label>
        <Input
          id="sp-prop"
          placeholder="e.g., Seed, Stem Cuttings"
          value={form.propagationMethod}
          onChange={(e) => onUpdateField("propagationMethod", e.target.value)}
          maxLength={255}
          aria-invalid={!!formErrors.propagationMethod}
          className={formErrors.propagationMethod ? "border-destructive" : ""}
        />
        {formErrors.propagationMethod && (
          <p className="text-xs text-destructive">{formErrors.propagationMethod}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="sp-desc">Description</Label>
        <Textarea
          id="sp-desc"
          placeholder="Brief description of the species and its research use..."
          value={form.description}
          onChange={(e) => onUpdateField("description", e.target.value)}
          rows={3}
          aria-invalid={!!formErrors.description}
          className={formErrors.description ? "border-destructive" : ""}
        />
        {formErrors.description && (
          <p className="text-xs text-destructive">{formErrors.description}</p>
        )}
      </div>
    </div>
  </fieldset>
);
