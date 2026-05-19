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
          <Label>Sample *</Label>
          <Select
            value={view.form.form.sampleId}
            onValueChange={(v) => view.form.updateField("sampleId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sample" />
            </SelectTrigger>
            <SelectContent>
              {(view.samples ?? []).map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.identity.name} {s.identity.code && `(${s.identity.code})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {view.form.errors.sampleId && (
            <p className="text-xs text-destructive">{view.form.errors.sampleId}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 150"
              value={view.form.form.quantity}
              onChange={(e) => view.form.updateField("quantity", e.target.value)}
            />
            {view.form.errors.quantity && (
              <p className="text-xs text-destructive">{view.form.errors.quantity}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Reserved Quantity</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 10"
              value={view.form.form.reservedQuantity}
              onChange={(e) =>
                view.form.updateField("reservedQuantity", e.target.value)
              }
            />
            {view.form.errors.reservedQuantity && (
              <p className="text-xs text-destructive">{view.form.errors.reservedQuantity}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <Select
            value={view.form.form.status}
            onValueChange={(v) => view.form.updateField("status", v)}
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
          {view.form.errors.status && (
            <p className="text-xs text-destructive">{view.form.errors.status}</p>
          )}
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
          {view.isEditing ? "Save Changes" : "Add Stock"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
