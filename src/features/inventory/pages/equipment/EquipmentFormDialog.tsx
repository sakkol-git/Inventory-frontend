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
          <SpecificationsSection
            form={formData}
            onUpdateField={view.form.updateField}
            formErrors={formErrors}
          />
          <FinancialSection
            form={formData}
            onUpdateField={view.form.updateField}
            formErrors={formErrors}
          />

          <div className="space-y-2">
            <Label htmlFor="eq-description">Description</Label>
            <Textarea
              id="eq-description"
              placeholder="Optional description about this equipment..."
              value={formData.description}
              onChange={(e) =>
                view.form.updateField("description", e.target.value)
              }
              rows={3}
            />
            {formErrors.description && (
              <p className="text-xs text-destructive">
                {formErrors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <ImageUpload
              label="Equipment Image"
              imageFile={view.image.imageFile}
              imageUrl={formData.imageUrl}
              previewUrl={view.image.imagePreviewUrl}
              onFileChange={view.image.handleImageChange}
              onUrlChange={(url) => {
                view.image.setImageUrl(url);
                view.form.updateField("imageUrl", url as unknown as string);
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
              ? "Saving…"
              : view.isEditing
                ? "Save Changes"
                : "Add Equipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Form Sections ─────────────────────────────────────────────────────── */

type FormSectionProps = {
  form: EquipmentForm;
  onUpdateField: <K extends keyof EquipmentForm>(
    field: K,
    value: EquipmentForm[K],
  ) => void;
  formErrors: Partial<Record<keyof EquipmentForm, string>>;
};

const BasicInfoSection = ({ form, onUpdateField, formErrors }: FormSectionProps) => (
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
          onChange={(e) => onUpdateField("name", e.target.value)}
          className={formErrors.name ? "border-destructive" : ""}
        />
        {formErrors.name && (
          <p className="text-xs text-destructive">{formErrors.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-code">Equipment Code</Label>
        <Input
          id="eq-code"
          placeholder="e.g., EQ-001"
          value={form.equipmentCode}
          onChange={(e) => onUpdateField("equipmentCode", e.target.value)}
          className={formErrors.equipmentCode ? "border-destructive" : ""}
        />
        {formErrors.equipmentCode && (
          <p className="text-xs text-destructive">{formErrors.equipmentCode}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-category">Category *</Label>
        <Select
          value={form.category}
          onValueChange={(v) => onUpdateField("category", v)}
        >
          <SelectTrigger id="eq-category" className={formErrors.category ? "border-destructive" : ""}>
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
        {formErrors.category && (
          <p className="text-xs text-destructive">{formErrors.category}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-status">Status *</Label>
        <Select
          value={form.status}
          onValueChange={(v) => onUpdateField("status", v)}
        >
          <SelectTrigger id="eq-status" className={formErrors.status ? "border-destructive" : ""}>
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
        {formErrors.status && (
          <p className="text-xs text-destructive">{formErrors.status}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-condition">Condition *</Label>
        <Select
          value={form.condition}
          onValueChange={(v) => onUpdateField("condition", v)}
        >
          <SelectTrigger id="eq-condition" className={formErrors.condition ? "border-destructive" : ""}>
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
        {formErrors.condition && (
          <p className="text-xs text-destructive">{formErrors.condition}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="eq-location">Location</Label>
        <Input
          id="eq-location"
          placeholder="e.g., Lab Room 1"
          value={form.location}
          onChange={(e) => onUpdateField("location", e.target.value)}
          className={formErrors.location ? "border-destructive" : ""}
        />
        {formErrors.location && (
          <p className="text-xs text-destructive">{formErrors.location}</p>
        )}
      </div>
    </div>
  </fieldset>
);

const SpecificationsSection = ({
  form,
  onUpdateField,
  formErrors,
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
          onChange={(e) => onUpdateField("manufacturer", e.target.value)}
          className={formErrors.manufacturer ? "border-destructive" : ""}
        />
        {formErrors.manufacturer && (
          <p className="text-xs text-destructive">{formErrors.manufacturer}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-model">Model</Label>
        <Input
          id="eq-model"
          placeholder="e.g., Eclipse Ei"
          value={form.modelName}
          onChange={(e) => onUpdateField("modelName", e.target.value)}
          className={formErrors.modelName ? "border-destructive" : ""}
        />
        {formErrors.modelName && (
          <p className="text-xs text-destructive">{formErrors.modelName}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="eq-serial">Serial Number</Label>
        <Input
          id="eq-serial"
          placeholder="e.g., NKN-2024-08812"
          value={form.serialNumber}
          onChange={(e) => onUpdateField("serialNumber", e.target.value)}
          className={formErrors.serialNumber ? "border-destructive" : ""}
        />
        {formErrors.serialNumber && (
          <p className="text-xs text-destructive">{formErrors.serialNumber}</p>
        )}
      </div>
    </div>
  </fieldset>
);

const FinancialSection = ({ form, onUpdateField, formErrors }: FormSectionProps) => (
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
          onChange={(e) => onUpdateField("purchasePrice", e.target.value)}
          className={formErrors.purchasePrice ? "border-destructive" : ""}
        />
        {formErrors.purchasePrice && (
          <p className="text-xs text-destructive">{formErrors.purchasePrice}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="eq-purchasedate">Purchase Date</Label>
        <Input
          id="eq-purchasedate"
          type="date"
          value={form.purchaseDate}
          onChange={(e) => onUpdateField("purchaseDate", e.target.value)}
          className={formErrors.purchaseDate ? "border-destructive" : ""}
        />
        {formErrors.purchaseDate && (
          <p className="text-xs text-destructive">{formErrors.purchaseDate}</p>
        )}
      </div>
    </div>
  </fieldset>
);
