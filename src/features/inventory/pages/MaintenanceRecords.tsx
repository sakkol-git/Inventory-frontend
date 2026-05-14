/* ═══════════════════════════════════════════════════════════════════════════
 * Maintenance Records — List and manage equipment maintenance records.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/core/auth/PermissionGate";
import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import EmptyState from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import PageHeader from "@/shared/components/PageHeader";
import { cn } from "@/shared/lib/utils";

import {
    useCreateMaintenanceRecord,
    useDeleteMaintenanceRecord,
    useMaintenanceRecords,
    useUpdateMaintenanceRecord,
} from "@/features/inventory/services/maintenanceRecordService";
import type { MaintenanceRecord } from "@/shared/types/index";
import {
    storeMaintenanceRecordSchema,
    type StoreMaintenanceRecordPayload,
} from "@/shared/types/schemas";

const MAINTENANCE_TYPES = [
  { value: "preventive", label: "Preventive" },
  { value: "corrective", label: "Corrective" },
  { value: "calibration", label: "Calibration" },
  { value: "inspection", label: "Inspection" },
];

const MaintenanceRecords = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<MaintenanceRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: records = [], isLoading } = useMaintenanceRecords();
  const createMutation = useCreateMaintenanceRecord();
  const updateMutation = useUpdateMaintenanceRecord();
  const deleteMutation = useDeleteMaintenanceRecord();

  const createForm = useForm<StoreMaintenanceRecordPayload>({
    resolver: zodResolver(storeMaintenanceRecordSchema),
  });

  const editForm = useForm<StoreMaintenanceRecordPayload>({
    resolver: zodResolver(storeMaintenanceRecordSchema),
  });

  const handleCreate = createForm.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Maintenance record created");
      setCreateOpen(false);
      createForm.reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to create record");
    }
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    if (!editItem) return;
    try {
      await updateMutation.mutateAsync({ id: editItem.id, ...data });
      toast.success("Maintenance record updated");
      setEditItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to update record");
    }
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Maintenance record deleted");
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (record: MaintenanceRecord) => {
    setEditItem(record);
    editForm.reset({
      equipment_id: record.equipment_id,
      maintenance_type: record.maintenance_type,
      description: record.description,
      technician_name: record.technician_name ?? undefined,
      technician_contact: record.technician_contact ?? undefined,
      cost: record.cost ?? undefined,
      started_at: record.started_at,
      completed_at: record.completed_at ?? undefined,
      next_service_date: record.next_service_date ?? undefined,
      notes: record.notes ?? undefined,
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Maintenance Records"
        description="Track equipment maintenance history"
        icon={Wrench}
        actions={
          <PermissionGate permission="maintenance.create">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </PermissionGate>
        }
      />

      <div className="mt-6 space-y-6">
        {isLoading ? (
          <LoadingState
            variant="skeleton"
            rows={6}
            text="Loading maintenance records..."
          />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No maintenance records found"
            description="Add your first maintenance record to start tracking."
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Service</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.equipment?.equipment_name ??
                        `Equipment #${record.equipment_id}`}
                    </TableCell>
                    <TableCell className="capitalize">
                      {record.maintenance_type.replace("_", " ")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {record.description}
                    </TableCell>
                    <TableCell>{record.started_at}</TableCell>
                    <TableCell>
                      {record.is_completed ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" /> Completed
                        </Badge>
                      ) : record.is_overdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>{record.next_service_date ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionGate permission="maintenance.edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(record)}
                            aria-label={`Edit maintenance record for ${record.equipment?.equipment_name ?? `Equipment #${record.equipment_id}`}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="maintenance.delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteId(record.id)}
                            aria-label={`Delete maintenance record for ${record.equipment?.equipment_name ?? `Equipment #${record.equipment_id}`}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Maintenance Record</DialogTitle>
            <DialogDescription>
              Record scheduled or unscheduled maintenance for equipment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <MaintenanceFormFields form={createForm} />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving…" : "Create Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Record</DialogTitle>
            <DialogDescription>
              Update the details of this maintenance record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <MaintenanceFormFields form={editForm} />
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
        title="Delete Maintenance Record"
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
const MaintenanceFormFields = ({ form }: { form: any }) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const maintenanceType = watch("maintenance_type");

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="equipment-id">Equipment ID *</Label>
          <Input
            id="equipment-id"
            autoFocus
            type="number"
            {...register("equipment_id", { valueAsNumber: true })}
          />
          {errors.equipment_id && (
            <p className="text-xs text-destructive">
              {errors.equipment_id.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Type *</Label>
          <Select
            value={maintenanceType}
            onValueChange={(v) => setValue("maintenance_type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.maintenance_type && (
            <p className="text-xs text-destructive">
              {errors.maintenance_type.message as string}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label>Description *</Label>
        <Input {...register("description")} />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message as string}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Started At *</Label>
          <Input type="date" {...register("started_at")} />
          {errors.started_at && (
            <p className="text-xs text-destructive">
              {errors.started_at.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Completed At</Label>
          <Input type="date" {...register("completed_at")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Technician Name</Label>
          <Input {...register("technician_name")} />
        </div>
        <div className="space-y-1">
          <Label>Next Service Date</Label>
          <Input type="date" {...register("next_service_date")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Cost</Label>
          <Input
            type="number"
            step="0.01"
            {...register("cost", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1">
          <Label>Notes</Label>
          <Input {...register("notes")} />
        </div>
      </div>
    </>
  );
};

// Silence unused import warning for cn
void cn;

export default MaintenanceRecords;
