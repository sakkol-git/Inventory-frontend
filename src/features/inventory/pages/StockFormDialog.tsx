/* ═══════════════════════════════════════════════════════════════════════════
 * StockFormDialog — Reusable Create/Edit dialog for Plant Stock.
 * Accepts a `view` from usePlantStockView() so it can be used from
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

import {
    formatEnumLabel,
    STOCK_STATUSES,
    usePlantStockView,
} from "./usePlantStockView";

export const StockFormDialog = ({
  view,
}: {
  view: ReturnType<typeof usePlantStockView>;
}) => (
  <Dialog
    open={view.formOpen}
    onOpenChange={(open) => {
      if (!open) view.closeForm();
    }}
  >
    <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{view.formTitle}</DialogTitle>
        <DialogDescription>{view.formDescription}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> indicates a required field
        </p>

        <div className="space-y-2">
          <Label>Species *</Label>
          <Select
            value={view.form.speciesId}
            onValueChange={(v) => view.updateFormField("speciesId", v)}
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 150"
              value={view.form.quantity}
              onChange={(e) => view.updateFormField("quantity", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Reserved Quantity</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 10"
              value={view.form.reservedQuantity}
              onChange={(e) =>
                view.updateFormField("reservedQuantity", e.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <Select
            value={view.form.status}
            onValueChange={(v) => view.updateFormField("status", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatEnumLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={view.closeForm}>
          Cancel
        </Button>
        <Button onClick={view.submitStockForm} disabled={!view.canSubmitForm}>
          {view.isEditing ? "Save Changes" : "Add Stock"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
