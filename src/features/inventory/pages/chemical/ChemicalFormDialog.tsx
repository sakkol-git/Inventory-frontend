/* ═══════════════════════════════════════════════════════════════════════════
 * ChemicalFormDialog — Create/edit dialog for chemicals.
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
import type { UseImageUploadResult } from "@/hooks/useImageUpload";
import { AlertTriangle, Beaker, FlaskConical } from "lucide-react";
import {
    CHEMICAL_CATEGORIES,
    DANGER_LEVELS,
    formatEnumLabel,
    useChemicalsView,
    type ChemicalForm,
} from "./useChemicalsView";

/* ─── Dialog Shell ──────────────────────────────────────────────────────── */

export const ChemicalFormDialog = ({
  view,
}: {
  view: ReturnType<typeof useChemicalsView>;
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

        <IdentitySection
          form={view.form.form}
          updateField={view.form.updateField}
          formErrors={view.form.errors}
        />
        <PropertiesSection
          form={view.form.form}
          updateField={view.form.updateField}
          formErrors={view.form.errors}
          image={view.image}
        />
        <SafetySection
          form={view.form.form}
          updateField={view.form.updateField}
          formErrors={view.form.errors}
        />

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Chemical description, handling notes..."
            value={view.form.form.description}
            onChange={(e) =>
              view.form.updateField("description", e.target.value)
            }
            rows={3}
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
          {view.isEditing ? "Save Changes" : "Add Chemical"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Form Sections ─────────────────────────────────────────────────────── */

type SectionProps = {
  form: ChemicalForm;
  updateField: <K extends keyof ChemicalForm>(
    field: K,
    value: ChemicalForm[K],
  ) => void;
  formErrors: Record<string, string>;
};

const IdentitySection = ({
  form,
  updateField,
  formErrors,
}: SectionProps) => (
  <fieldset>
    <legend className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
      <Beaker className="h-4 w-4 text-muted-foreground/60" /> Chemical Identity
    </legend>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 col-span-2">
        <Label>Chemical Name *</Label>
        <Input
          placeholder="e.g., Sodium Hydroxide (NaOH)"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={formErrors.name ? "border-destructive" : ""}
        />
        {formErrors.name && (
          <p className="text-xs text-destructive">{formErrors.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Chemical Code</Label>
        <Input
          placeholder="e.g., CH-001"
          value={form.chemicalCode}
          onChange={(e) => updateField("chemicalCode", e.target.value)}
          className={formErrors.chemicalCode ? "border-destructive" : ""}
        />
        {formErrors.chemicalCode && (
          <p className="text-xs text-destructive">{formErrors.chemicalCode}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select
          value={form.category}
          onValueChange={(v) => updateField("category", v)}
        >
          <SelectTrigger className={formErrors.category ? "border-destructive" : ""}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CHEMICAL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {formatEnumLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.category && (
          <p className="text-xs text-destructive">{formErrors.category}</p>
        )}
      </div>
    </div>
  </fieldset>
);

const PropertiesSection = ({
  form,
  updateField,
  formErrors,
  image,
}: SectionProps & { image?: UseImageUploadResult }) => (
  <fieldset>
    <legend className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
      <FlaskConical className="h-4 w-4 text-muted-foreground/60" /> Properties
    </legend>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Quantity *</Label>
        <Input
          type="number"
          min="0"
          placeholder="e.g., 500"
          value={form.quantity}
          onChange={(e) => updateField("quantity", e.target.value)}
          className={formErrors.quantity ? "border-destructive" : ""}
        />
        {formErrors.quantity && (
          <p className="text-xs text-destructive">{formErrors.quantity}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Storage Location</Label>
        <Input
          placeholder="e.g., Cabinet A-1"
          value={form.storageLocation}
          onChange={(e) => updateField("storageLocation", e.target.value)}
          className={formErrors.storageLocation ? "border-destructive" : ""}
        />
        {formErrors.storageLocation && (
          <p className="text-xs text-destructive">{formErrors.storageLocation}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Expiry Date</Label>
        <Input
          type="date"
          value={form.expiryDate}
          onChange={(e) => updateField("expiryDate", e.target.value)}
          className={formErrors.expiryDate ? "border-destructive" : ""}
        />
        {formErrors.expiryDate && (
          <p className="text-xs text-destructive">{formErrors.expiryDate}</p>
        )}
      </div>
      {image && (
        <div className="space-y-2">
          <ImageUpload
            label="Chemical Image"
            imageFile={image.imageFile}
            imageUrl={image.imageUrl}
            previewUrl={image.imagePreviewUrl}
            onFileChange={image.handleImageChange}
            onUrlChange={(url) => {
              image.setImageUrl(url);
              updateField("imageUrl", url as ChemicalForm["imageUrl"]);
            }}
          />
        </div>
      )}
    </div>
  </fieldset>
);

const SafetySection = ({
  form,
  updateField,
  formErrors,
}: SectionProps) => (
  <fieldset>
    <legend className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-muted-foreground/60" /> Safety
    </legend>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Danger Level *</Label>
        <Select
          value={form.dangerLevel}
          onValueChange={(v) => updateField("dangerLevel", v)}
        >
          <SelectTrigger className={formErrors.dangerLevel ? "border-destructive" : ""}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DANGER_LEVELS.map((d) => (
              <SelectItem key={d} value={d}>
                {formatEnumLabel(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.dangerLevel && (
          <p className="text-xs text-destructive">{formErrors.dangerLevel}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <Label>Safety Measures</Label>
        <Textarea
          placeholder="Safety precautions and handling instructions..."
          value={form.safetyMeasures}
          onChange={(e) => updateField("safetyMeasures", e.target.value)}
          rows={2}
          className={formErrors.safetyMeasures ? "border-destructive" : ""}
        />
        {formErrors.safetyMeasures && (
          <p className="text-xs text-destructive">{formErrors.safetyMeasures}</p>
        )}
      </div>
    </div>
  </fieldset>
);
