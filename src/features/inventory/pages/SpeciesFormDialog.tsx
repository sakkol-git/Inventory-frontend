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
}) => (
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
          form={view.form}
          updateField={view.updateFormField}
          errors={view.formErrors}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={view.closeForm}>
          Cancel
        </Button>
        <Button
          onClick={view.submitSpeciesForm}
          disabled={!view.canSubmitForm || view.isSubmitting}
        >
          {view.isSubmitting
            ? "Saving..."
            : view.isEditing
              ? "Save Changes"
              : "Add Species"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Form Sections ──────────────────────────────────────────────────────── */

type FormErrors = Partial<Record<keyof SpeciesForm, string>>;

type FormSectionProps = {
  form: SpeciesForm;
  updateField: <K extends keyof SpeciesForm>(
    field: K,
    value: SpeciesForm[K],
  ) => void;
  errors?: FormErrors;
};

const BasicInfoSection = ({
  form,
  updateField,
  errors = {},
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
          onChange={(e) => updateField("commonName", e.target.value)}
          maxLength={255}
          aria-invalid={!!errors.commonName}
          className={errors.commonName ? "border-destructive" : ""}
        />
        {errors.commonName && (
          <p className="text-xs text-destructive">{errors.commonName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-khmer">Khmer Name</Label>
        <Input
          id="sp-khmer"
          placeholder="e.g., បេកប៉ោះ"
          value={form.khmerName}
          onChange={(e) => updateField("khmerName", e.target.value)}
          maxLength={255}
          aria-invalid={!!errors.khmerName}
          className={errors.khmerName ? "border-destructive" : ""}
        />
        {errors.khmerName && (
          <p className="text-xs text-destructive">{errors.khmerName}</p>
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
          onChange={(e) => updateField("scientificName", e.target.value)}
          maxLength={255}
          aria-invalid={!!errors.scientificName}
          className={errors.scientificName ? "border-destructive" : ""}
        />
        {errors.scientificName && (
          <p className="text-xs text-destructive">{errors.scientificName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-fam">Family</Label>
        <Select
          value={form.family}
          onValueChange={(v) => updateField("family", v)}
        >
          <SelectTrigger
            id="sp-fam"
            className={errors.family ? "border-destructive" : ""}
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
        {errors.family && (
          <p className="text-xs text-destructive">{errors.family}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-growth">
          Growth Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.growthType}
          onValueChange={(v) => updateField("growthType", v)}
        >
          <SelectTrigger
            id="sp-growth"
            className={errors.growthType ? "border-destructive" : ""}
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
        {errors.growthType && (
          <p className="text-xs text-destructive">{errors.growthType}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-region">Native Region</Label>
        <Input
          id="sp-region"
          placeholder="e.g., Western South America"
          value={form.nativeRegion}
          onChange={(e) => updateField("nativeRegion", e.target.value)}
          maxLength={255}
          aria-invalid={!!errors.nativeRegion}
          className={errors.nativeRegion ? "border-destructive" : ""}
        />
        {errors.nativeRegion && (
          <p className="text-xs text-destructive">{errors.nativeRegion}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp-prop">Propagation Method</Label>
        <Input
          id="sp-prop"
          placeholder="e.g., Seed, Stem Cuttings"
          value={form.propagationMethod}
          onChange={(e) => updateField("propagationMethod", e.target.value)}
          maxLength={255}
          aria-invalid={!!errors.propagationMethod}
          className={errors.propagationMethod ? "border-destructive" : ""}
        />
        {errors.propagationMethod && (
          <p className="text-xs text-destructive">{errors.propagationMethod}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="sp-desc">Description</Label>
        <Textarea
          id="sp-desc"
          placeholder="Brief description of the species and its research use..."
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          aria-invalid={!!errors.description}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <ImageUpload
          label="Species Image"
          imageFile={form.imageFile}
          imageUrl={form.imageUrl}
          previewUrl={form.imagePreviewUrl}
          onFileChange={(file) => {
            updateField("imageFile", file);
            updateField(
              "imagePreviewUrl",
              file ? URL.createObjectURL(file) : form.imageUrl || "",
            );
          }}
          onUrlChange={(url) => {
            updateField("imageUrl", url);
            if (!form.imageFile) updateField("imagePreviewUrl", url);
          }}
          error={errors?.imageUrl}
        />
      </div>
    </div>
  </fieldset>
);
