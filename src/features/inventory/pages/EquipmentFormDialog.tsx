/* ═══════════════════════════════════════════════════════════════════════════
 * EquipmentFormDialog — Create/edit dialog for equipment.
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
import { DollarSign, Settings, Wrench } from "lucide-react";
import {
    EQUIPMENT_CATEGORIES,
    EQUIPMENT_CONDITIONS,
    EQUIPMENT_STATUSES,
    formatEnumLabel,
    useEquipmentView,
    type EquipmentForm,
} from "./useEquipmentView";

/* ─── Dialog Shell ──────────────────────────────────────────────────────── */

export const EquipmentFormDialog = ({
  view,
}: {
  view: ReturnType<typeof useEquipmentView>;
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
        <SpecificationsSection
          form={view.form}
          updateField={view.updateFormField}
          errors={view.formErrors}
        />
        <FinancialSection
          form={view.form}
          updateField={view.updateFormField}
          errors={view.formErrors}
        />

        <div className="space-y-2">
          <Label htmlFor="eq-description">Description</Label>
          <Textarea
            id="eq-description"
            placeholder="Optional description about this equipment..."
            value={view.form.description}
            onChange={(e) =>
              view.updateFormField("description", e.target.value)
            }
            rows={3}
          />
          {view.formErrors.description && (
            <p className="text-xs text-destructive">
              {view.formErrors.description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <ImageUpload
            label="Equipment Image"
            imageFile={view.form.imageFile}
            imageUrl={view.form.imageUrl}
            previewUrl={view.form.imagePreviewUrl}
            onFileChange={(file) => {
              view.updateFormField("imageFile", file);
              view.updateFormField(
                "imagePreviewUrl",
                file ? URL.createObjectURL(file) : view.form.imageUrl || "",
              );
            }}
            onUrlChange={(url) => {
              view.updateFormField("imageUrl", url);
              if (!view.form.imageFile)
                view.updateFormField("imagePreviewUrl", url);
            }}
            error={view.formErrors.imageUrl}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={view.closeForm}>
          Cancel
        </Button>
        <Button
          onClick={view.submitEquipmentForm}
          disabled={!view.canSubmitForm || view.isSubmitting}
        >
          {view.isSubmitting
            ? "Saving…"
            : view.isEditing
              ? "Save Changes"
              : "Add Equipment"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Form Sections ─────────────────────────────────────────────────────── */

type FormSectionProps = {
  form: EquipmentForm;
  updateField: <K extends keyof EquipmentForm>(
    field: K,
    value: EquipmentForm[K],
  ) => void;
  errors: Partial<Record<keyof EquipmentForm, string>>;
};

const BasicInfoSection = ({ form, updateField, errors }: FormSectionProps) => (
  <fieldset>
    <legend className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
      <Wrench className="h-4 w-4 text-muted-foreground/60" />
      Basic Information
    </legend>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 col-span-2">
        <Label htmlFor="eq-name">Equipment Name *</Label>
        <Input
          id="eq-name"
          placeholder="e.g., Compound Microscope"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-code">Equipment Code</Label>
        <Input
          id="eq-code"
          placeholder="e.g., EQ-001"
          value={form.equipmentCode}
          onChange={(e) => updateField("equipmentCode", e.target.value)}
        />
        {errors.equipmentCode && (
          <p className="text-xs text-destructive">{errors.equipmentCode}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-category">Category *</Label>
        <Select
          value={form.category}
          onValueChange={(v) => updateField("category", v)}
        >
          <SelectTrigger id="eq-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {formatEnumLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-status">Status *</Label>
        <Select
          value={form.status}
          onValueChange={(v) => updateField("status", v)}
        >
          <SelectTrigger id="eq-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {formatEnumLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-xs text-destructive">{errors.status}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-condition">Condition *</Label>
        <Select
          value={form.condition}
          onValueChange={(v) => updateField("condition", v)}
        >
          <SelectTrigger id="eq-condition">
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {formatEnumLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.condition && (
          <p className="text-xs text-destructive">{errors.condition}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="eq-location">Location</Label>
        <Input
          id="eq-location"
          placeholder="e.g., Lab Room 1"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
        />
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location}</p>
        )}
      </div>
    </div>
  </fieldset>
);

const SpecificationsSection = ({
  form,
  updateField,
  errors,
}: FormSectionProps) => (
  <fieldset>
    <legend className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
      <Settings className="h-4 w-4 text-muted-foreground/60" />
      Specifications
    </legend>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="eq-manufacturer">Manufacturer</Label>
        <Input
          id="eq-manufacturer"
          placeholder="e.g., Nikon"
          value={form.manufacturer}
          onChange={(e) => updateField("manufacturer", e.target.value)}
        />
        {errors.manufacturer && (
          <p className="text-xs text-destructive">{errors.manufacturer}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-model">Model</Label>
        <Input
          id="eq-model"
          placeholder="e.g., Eclipse Ei"
          value={form.modelName}
          onChange={(e) => updateField("modelName", e.target.value)}
        />
        {errors.modelName && (
          <p className="text-xs text-destructive">{errors.modelName}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="eq-serial">Serial Number</Label>
        <Input
          id="eq-serial"
          placeholder="e.g., NKN-2024-08812"
          value={form.serialNumber}
          onChange={(e) => updateField("serialNumber", e.target.value)}
        />
        {errors.serialNumber && (
          <p className="text-xs text-destructive">{errors.serialNumber}</p>
        )}
      </div>
    </div>
  </fieldset>
);

const FinancialSection = ({ form, updateField, errors }: FormSectionProps) => (
  <fieldset>
    <legend className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-muted-foreground/60" />
      Financial Information
    </legend>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="eq-price">Purchase Price</Label>
        <Input
          id="eq-price"
          type="number"
          step="0.01"
          placeholder="e.g., 4200"
          value={form.purchasePrice}
          onChange={(e) => updateField("purchasePrice", e.target.value)}
        />
        {errors.purchasePrice && (
          <p className="text-xs text-destructive">{errors.purchasePrice}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-purchasedate">Purchase Date</Label>
        <Input
          id="eq-purchasedate"
          type="date"
          value={form.purchaseDate}
          onChange={(e) => updateField("purchaseDate", e.target.value)}
        />
        {errors.purchaseDate && (
          <p className="text-xs text-destructive">{errors.purchaseDate}</p>
        )}
      </div>
    </div>
  </fieldset>
);
