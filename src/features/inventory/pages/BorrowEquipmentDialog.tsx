/* ═══════════════════════════════════════════════════════════════════════════
 * BorrowEquipmentDialog — Modal for creating/returning equipment borrow records
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/core/auth/AuthContext";
import {
    useBorrowRecordList,
    useCreateBorrowRecord,
    useReturnBorrowRecord,
} from "@/features/inventory/services/borrowRecordService";
import { useState } from "react";
import { toast } from "sonner";
import type { EquipmentItem } from "./useEquipmentView";

interface BorrowEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: EquipmentItem | null;
  mode: "borrow" | "return";
  /** Active borrow record ID — required for returns */
  borrowRecordId?: number;
}

export function BorrowEquipmentDialog({
  open,
  onOpenChange,
  equipment,
  mode,
  borrowRecordId,
}: BorrowEquipmentDialogProps) {
  const { user } = useAuthContext();
  const createBorrow = useCreateBorrowRecord();
  const returnBorrow = useReturnBorrowRecord();

  // When returning from the list page, look up the active borrow record
  const activeBorrowQuery = useBorrowRecordList(
    mode === "return" && open && equipment
      ? {
          borrowable_type: "equipment",
          borrowable_id: equipment.id,
          status: "borrowed",
          per_page: 1,
        }
      : undefined,
  );

  // Resolve the borrow record ID: prop takes priority, then auto-lookup
  const resolvedBorrowRecordId =
    borrowRecordId ?? activeBorrowQuery.data?.data?.[0]?.id;

  const [quantity, setQuantity] = useState(1);
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setQuantity(1);
    setDueAt("");
    setNotes("");
  };

  const handleBorrow = async () => {
    if (!equipment || !user) return;
    try {
      await createBorrow.mutateAsync({
        user_id: user.id,
        borrowable_type: "equipment",
        borrowable_id: equipment.id,
        quantity,
        due_at: dueAt || null,
        notes: notes || null,
      });
      toast.success(`Borrowed ${equipment.equipment_name}`);
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to create borrow record");
    }
  };

  const handleReturn = async () => {
    if (!resolvedBorrowRecordId) {
      toast.error("Could not find the active borrow record for this item");
      return;
    }
    try {
      await returnBorrow.mutateAsync({
        id: resolvedBorrowRecordId,
        payload: { notes: notes || null },
      });
      toast.success(`Returned ${equipment?.equipment_name ?? "item"}`);
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to return item");
    }
  };

  const isPending = createBorrow.isPending || returnBorrow.isPending;
  const isLookingUp =
    mode === "return" && !borrowRecordId && activeBorrowQuery.isLoading;
  const isBorrow = mode === "borrow";

  // Default due date to 7 days from now
  const defaultDue = new Date(Date.now() + 7 * 86400_000)
    .toISOString()
    .slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isBorrow ? "Borrow Equipment" : "Return Equipment"}
          </DialogTitle>
          <DialogDescription>
            {isBorrow
              ? `Request to borrow "${equipment?.equipment_name}".`
              : `Return "${equipment?.equipment_name}" to inventory.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {isBorrow && (
            <>
              <div className="space-y-1">
                <Label htmlFor="borrow-qty">Quantity</Label>
                <Input
                  id="borrow-qty"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="borrow-due">Due Date</Label>
                <Input
                  id="borrow-due"
                  type="date"
                  value={dueAt || defaultDue}
                  onChange={(e) => setDueAt(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="space-y-1">
            <Label htmlFor="borrow-notes">Notes (optional)</Label>
            <Textarea
              id="borrow-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isBorrow ? "Purpose of borrowing…" : "Return condition notes…"
              }
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={isBorrow ? handleBorrow : handleReturn}
              disabled={isPending || isLookingUp}
              variant={isBorrow ? "default" : "default"}
            >
              {isLookingUp
                ? "Looking up record…"
                : isPending
                  ? "Processing…"
                  : isBorrow
                    ? "Borrow"
                    : "Confirm Return"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
