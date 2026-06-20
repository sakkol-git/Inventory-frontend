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
import { type AdjustStockAction, useAdjustPlantStock } from "../../services/plantStockService";
import type { StockItem } from "./usePlantStockView";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface AdjustStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: AdjustStockAction | null;
  item: StockItem | null;
}

const ACTION_TITLES: Record<AdjustStockAction, string> = {
  consume: "Consume Plant Stock",
  reserve: "Reserve Plant Stock",
  release: "Release Plant Stock",
  restock: "Restock Plant Stock",
};

const ACTION_DESCRIPTIONS: Record<AdjustStockAction, string> = {
  consume: "Permanently decrease available stock.",
  reserve: "Move quantity from available to reserved.",
  release: "Move quantity from reserved back to available.",
  restock: "Increase available stock.",
};

const ACTION_BUTTON_LABELS: Record<AdjustStockAction, string> = {
  consume: "Consume",
  reserve: "Reserve",
  release: "Release",
  restock: "Restock",
};

export function AdjustStockDialog({ isOpen, onClose, action, item }: AdjustStockDialogProps) {
  const [quantity, setQuantity] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ quantity?: string[] }>({});
  
  const mutation = useAdjustPlantStock();

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuantity("");
      setFieldErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!item || !action) return;
    
    setFieldErrors({});
    
    try {
      await mutation.mutateAsync({
        id: item.id,
        action,
        quantity: Number(quantity)
      });
      
      toast.success(`Stock successfully updated!`);
      onClose();
    } catch (error: any) {
      const payload = error.response?.data;
      
      if (payload?.code === 'VALIDATION_ERROR') {
        const errors = payload.details?.errors || payload.details;
        if (errors) {
            setFieldErrors(errors);
        }
      } else if (payload?.code === 'INSUFFICIENT_STOCK') {
        toast.error(`Not enough stock available to perform this action.`);
      }
      // Note: Other global errors like 500 are handled globally in api.ts
    }
  };

  if (!item || !action) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ACTION_TITLES[action]}</DialogTitle>
          <DialogDescription>
            {ACTION_DESCRIPTIONS[action]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-3 text-sm">
            <div>
              <div className="text-muted-foreground">Available</div>
              <div className="font-medium text-lg">{item.inventory.net_available}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Reserved</div>
              <div className="font-medium text-lg">{item.inventory.reserved}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 5"
              autoFocus
            />
            {fieldErrors.quantity && (
              <p className="text-sm font-medium text-destructive">
                {fieldErrors.quantity.join(", ")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!quantity || mutation.isPending}>
            {mutation.isPending ? "Saving..." : ACTION_BUTTON_LABELS[action]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
