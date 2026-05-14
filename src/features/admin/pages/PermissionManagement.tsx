/* ═══════════════════════════════════════════════════════════════════════════
 * Permission Management (Admin) — CRUD for permissions.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Key, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { PermissionGate } from "@/core/auth/PermissionGate";
import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import PageHeader from "@/shared/components/PageHeader";

import {
    useCreatePermission,
    useDeletePermission,
    usePermissions,
    useUpdatePermission,
} from "@/features/admin/services";
import type { Permission } from "@/shared/types/index";

const PermissionManagement = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [editItem, setEditItem] = useState<Permission | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: permissions = [], isLoading } = usePermissions();
  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission();
  const deleteMutation = useDeletePermission();

  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await createMutation.mutateAsync({ name: createName.trim() });
      toast.success("Permission created");
      setCreateOpen(false);
      setCreateName("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message ?? "Failed to create permission",
      );
    }
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id: editItem.id,
        name: editName.trim(),
      });
      toast.success("Permission updated");
      setEditItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message ?? "Failed to update permission",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Permission deleted");
    } catch {
      toast.error("Failed to delete permission");
    } finally {
      setDeleteId(null);
    }
  };

  // Group permissions by module prefix
  const grouped = permissions.reduce(
    (acc, perm) => {
      const prefix = perm.name.split(".")[0] ?? "other";
      if (!acc[prefix]) acc[prefix] = [];
      acc[prefix].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Permission Management"
          description="Manage system permissions"
          icon={Key}
          actions={
            <PermissionGate permission="permissions.create">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Permission
              </Button>
            </PermissionGate>
          }
        />

        {isLoading ? (
          <div className="text-muted-foreground">Loading permissions…</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([module, perms]) => (
              <div key={module} className="rounded-lg border">
                <div className="px-4 py-2 bg-muted/50 border-b">
                  <h3 className="text-sm font-semibold capitalize">
                    {module.replace(/_/g, " ")}
                  </h3>
                </div>
                <Table>
                  <TableBody>
                    {perms.map((perm) => (
                      <TableRow key={perm.id}>
                        <TableCell className="font-mono text-sm">
                          {perm.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {perm.guard_name}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <PermissionGate permission="permissions.edit">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditItem(perm);
                                  setEditName(perm.name);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGate>
                            <PermissionGate permission="permissions.delete">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setDeleteId(perm.id)}
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
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Create Permission</DialogTitle>
              <DialogDescription>
                Add a new permission to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label>Permission Name *</Label>
                <Input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. module.action"
                />
                <p className="text-xs text-muted-foreground">
                  Use dot notation: module.action (e.g., plants.create)
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !createName.trim()}
                >
                  {createMutation.isPending ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Permission</DialogTitle>
              <DialogDescription>
                Update this permission's name or details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label>Permission Name *</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditItem(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleEdit}
                  disabled={updateMutation.isPending || !editName.trim()}
                >
                  {updateMutation.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(v) => !v && setDeleteId(null)}
          title="Delete Permission"
          description="This will remove the permission from all roles. This cannot be undone."
          onConfirm={handleDelete}
          confirmLabel="Delete"
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
};

export default PermissionManagement;
