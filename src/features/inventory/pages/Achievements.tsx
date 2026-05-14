/* ═══════════════════════════════════════════════════════════════════════════
 * Achievements — CRUD for achievement definitions + assign/revoke to users.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { zodResolver } from "@hookform/resolvers/zod";
import { Award, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { PermissionGate } from "@/core/auth/PermissionGate";
import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import EmptyState from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import PageHeader from "@/shared/components/PageHeader";

import {
    useAchievements,
    useCreateAchievement,
    useDeleteAchievement,
    useUpdateAchievement,
} from "@/features/inventory/services/achievementService";
import type { Achievement } from "@/shared/types/index";
import {
    storeAchievementSchema,
    type StoreAchievementPayload,
} from "@/shared/types/schemas";

const Achievements = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Achievement | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: achievements = [], isLoading, isError } = useAchievements();
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();

  const createForm = useForm<StoreAchievementPayload>({
    resolver: zodResolver(storeAchievementSchema),
  });

  const editForm = useForm<StoreAchievementPayload>({
    resolver: zodResolver(storeAchievementSchema),
  });

  const handleCreate = createForm.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Achievement created");
      setCreateOpen(false);
      createForm.reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to create");
    }
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    if (!editItem) return;
    try {
      await updateMutation.mutateAsync({ id: editItem.id, ...data });
      toast.success("Achievement updated");
      setEditItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to update");
    }
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Achievement deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (achievement: Achievement) => {
    setEditItem(achievement);
    editForm.reset({
      name: achievement.name,
      description: achievement.description ?? undefined,
      criteria_type: achievement.criteria_type,
      criteria_value: achievement.criteria_value,
      icon: achievement.icon ?? undefined,
    });
  };

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Achievements"
          description="Manage achievement definitions"
          icon={Award}
          actions={
            <PermissionGate permission="achievements.create">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </PermissionGate>
          }
        />

        <div>
          {isLoading ? (
            <LoadingState
              variant="skeleton"
              rows={5}
              text="Loading achievements..."
            />
          ) : isError ? (
            <EmptyState
              icon={Award}
              title="Failed to load achievements"
              description="Could not connect to the server. Please check your connection and try again."
            />
          ) : achievements.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No achievements defined"
              description="Create your first achievement to get started."
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Criteria Type</TableHead>
                    <TableHead>Criteria Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((ach) => (
                    <TableRow key={ach.id}>
                      <TableCell className="font-medium">
                        {ach.icon ? `${ach.icon} ` : ""}
                        {ach.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {ach.description ?? "—"}
                      </TableCell>
                      <TableCell>{ach.criteria_type}</TableCell>
                      <TableCell>{ach.criteria_value}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <PermissionGate permission="achievements.edit">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(ach)}
                              aria-label={`Edit ${ach.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PermissionGate>
                          <PermissionGate permission="achievements.delete">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setDeleteId(ach.id)}
                              aria-label={`Delete ${ach.name}`}
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Achievement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <AchievementFormFields form={createForm} />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving…" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Achievement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <AchievementFormFields form={editForm} />
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
          title="Delete Achievement"
          description="This action cannot be undone."
          onConfirm={handleDelete}
          confirmLabel="Delete"
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AchievementFormFields = ({ form }: { form: any }) => {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="achievement-name">Name *</Label>
        <Input id="achievement-name" autoFocus {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">
            {errors.name.message as string}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Input {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Criteria Type *</Label>
          <Input
            {...register("criteria_type")}
            placeholder="e.g. borrows_count"
          />
          {errors.criteria_type && (
            <p className="text-xs text-destructive">
              {errors.criteria_type.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Criteria Value *</Label>
          <Input
            type="number"
            {...register("criteria_value", { valueAsNumber: true })}
          />
          {errors.criteria_value && (
            <p className="text-xs text-destructive">
              {errors.criteria_value.message as string}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label>Icon (emoji or code)</Label>
        <Input {...register("icon")} placeholder="🏆" />
      </div>
    </>
  );
};

export default Achievements;
