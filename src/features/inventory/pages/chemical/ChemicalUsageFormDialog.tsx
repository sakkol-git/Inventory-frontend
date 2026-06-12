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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  useUseChemical,
  useAddChemical,
} from "@/features/inventory/services/chemicalUsageLogService";
import type { StoreChemicalUsageLogPayload } from "@/shared/types/schemas";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chemical: { id: number; common_name?: string } | null;
  mode: "use" | "add";
};

export const ChemicalUsageFormDialog = ({
  open,
  onOpenChange,
  chemical,
  mode,
}: Props) => {
  const useMutationUse = useUseChemical();
  const useMutationAdd = useAddChemical();

  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [usedAt, setUsedAt] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState<string>("");

  const title = mode === "use" ? "Use Chemical" : "Add Chemical";
  const submitLabel = mode === "use" ? "Record Usage" : "Record Addition";

  const handleSubmit = async () => {
    if (!chemical) return;
    const payload: StoreChemicalUsageLogPayload = {
      chemical_id: chemical.id,
      quantity_used: Number(quantity) || 0,
      unit: unit || "",
      purpose: purpose || (mode === "use" ? "Usage" : "Stock addition"),
      experiment_name: mode,
      used_at: usedAt,
      notes: notes || null,
    } as StoreChemicalUsageLogPayload;

    try {
      const mut = mode === "use" ? useMutationUse : useMutationAdd;
      await mut.mutateAsync(payload);
      toast.success(`${chemical.common_name ?? "Chemical"} ${
        mode === "use" ? "usage" : "addition"
      } recorded`);
      onOpenChange(false);
      // clear form
      setQuantity("");
      setUnit("");
      setPurpose("");
      setNotes("");
    } catch (err) {
      toast.error("Failed to record chemical usage");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {chemical ? chemical.common_name : "Chemical"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 5"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., g, mL"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Purpose</Label>
            <Input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Fertilizer experiment"
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={usedAt} onChange={(e) => setUsedAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (mode === "use" ? useMutationUse.isPending : useMutationAdd.isPending) ||
              !quantity ||
              !unit
            }
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChemicalUsageFormDialog;
