/* ═══════════════════════════════════════════════════════════════════════════
 * Chemical Batches — List, create, edit, delete chemical batch records.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import PageHeader from "@/shared/components/PageHeader";
import { PermissionGate } from "@/core/auth/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    useChemicalBatches,
    useCreateChemicalBatch,
    useDeleteChemicalBatch,
    useUpdateChemicalBatch,
} from "@/features/inventory/services/chemicalBatchService";
import type { ChemicalBatch } from "@/shared/types/index";
import {
    storeChemicalBatchSchema,
    type StoreChemicalBatchPayload,
} from "@/shared/types/schemas";

const ChemicalBatches = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChemicalBatch | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: batches = [], isLoading } = useChemicalBatches();
  const createMutation = useCreateChemicalBatch();
  const updateMutation = useUpdateChemicalBatch();
  const deleteMutation = useDeleteChemicalBatch();

  const createForm = useForm<StoreChemicalBatchPayload>({
    resolver: zodResolver(storeChemicalBatchSchema),
  });

  const editForm = useForm<StoreChemicalBatchPayload>({
    resolver: zodResolver(storeChemicalBatchSchema),
  });

  const handleCreate = createForm.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Chemical batch created");
      setCreateOpen(false);
      createForm.reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to create batch");
    }
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    if (!editItem) return;
    try {
      await updateMutation.mutateAsync({ id: editItem.id, ...data });
      toast.success("Chemical batch updated");
      setEditItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to update batch");
    }
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Chemical batch deleted");
    } catch {
      toast.error("Failed to delete batch");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (batch: ChemicalBatch) => {
    setEditItem(batch);
    editForm.reset({
      chemical_id: batch.chemical_id,
      batch_number: batch.batch_number,
      quantity: batch.quantity,
      unit: batch.unit,
      expiry_date: batch.expiry_date ?? undefined,
      supplier_name: batch.supplier_name ?? undefined,
      supplier_contact: batch.supplier_contact ?? undefined,
      received_at: batch.received_at ?? undefined,
      cost_per_unit: batch.cost_per_unit ?? undefined,
      notes: batch.notes ?? undefined,
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Chemical Batches"
        subtitle="Manage chemical batch inventory"
        icon={FlaskConical}
        actions={
          <PermissionGate permission="chemical_batches.create">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
            </Button>
          </PermissionGate>
        }
      />

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch #</TableHead>
              <TableHead>Chemical</TableHead>
              <TableHead>Qty / Unit</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No chemical batches found.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-mono font-medium">
                    {batch.batch_number}
                  </TableCell>
                  <TableCell>
                    {batch.chemical?.common_name ?? `#${batch.chemical_id}`}
                  </TableCell>
                  <TableCell>
                    {batch.quantity} {batch.unit}
                  </TableCell>
                  <TableCell>
                    {batch.remaining_quantity} {batch.unit}
                  </TableCell>
                  <TableCell>
                    {batch.expiry_date ? (
                      <Badge
                        variant={batch.is_expired ? "destructive" : "outline"}
                      >
                        {batch.expiry_date}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{batch.supplier_name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <PermissionGate permission="chemical_batches.edit">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(batch)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="chemical_batches.delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteId(batch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Chemical Batch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <BatchFormFields form={createForm} />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving…" : "Create Batch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Chemical Batch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <BatchFormFields form={editForm} />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete Chemical Batch"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </AppLayout>
  );
};

// ── Shared Form Fields ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BatchFormFields = ({ form }: { form: any }) => {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Chemical ID *</Label>
          <Input
            type="number"
            {...register("chemical_id", { valueAsNumber: true })}
          />
          {errors.chemical_id && (
            <p className="text-xs text-destructive">
              {errors.chemical_id.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Batch Number *</Label>
          <Input {...register("batch_number")} />
          {errors.batch_number && (
            <p className="text-xs text-destructive">
              {errors.batch_number.message as string}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Quantity *</Label>
          <Input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
          />
          {errors.quantity && (
            <p className="text-xs text-destructive">
              {errors.quantity.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Unit *</Label>
          <Input {...register("unit")} placeholder="e.g. mL, g, L" />
          {errors.unit && (
            <p className="text-xs text-destructive">
              {errors.unit.message as string}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Expiry Date</Label>
          <Input type="date" {...register("expiry_date")} />
        </div>
        <div className="space-y-1">
          <Label>Received At</Label>
          <Input type="date" {...register("received_at")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Supplier Name</Label>
          <Input {...register("supplier_name")} />
        </div>
        <div className="space-y-1">
          <Label>Supplier Contact</Label>
          <Input {...register("supplier_contact")} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Notes</Label>
        <Input {...register("notes")} />
      </div>
    </>
  );
};

export default ChemicalBatches;
