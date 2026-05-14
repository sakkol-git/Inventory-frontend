/* ═══════════════════════════════════════════════════════════════════════════
 * Role Management (Admin) — CRUD for roles + assign permissions to roles.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Pencil, Plus, Settings, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import PageHeader from "@/shared/components/PageHeader";

import {
    useAssignPermissionToRole,
    useCreateRole,
    useDeleteRole,
    usePermissions,
    useRemovePermissionFromRole,
    useRolePermissions,
    useRoles,
    useUpdateRole,
} from "@/features/admin/services";
import type { Role } from "@/shared/types/index";

const RoleManagement = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [editItem, setEditItem] = useState<Role | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [permissionsRoleId, setPermissionsRoleId] = useState<number | null>(
    null,
  );
  const [assignPermission, setAssignPermission] = useState("");

  const { data: roles = [], isLoading } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const assignPermMutation = useAssignPermissionToRole();
  const removePermMutation = useRemovePermissionFromRole();

  const { data: rolePerms = [] } = useRolePermissions(permissionsRoleId ?? 0);
  const { data: allPermissions = [] } = usePermissions();

  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await createMutation.mutateAsync({ name: createName.trim() });
      toast.success("Role created");
      setCreateOpen(false);
      setCreateName("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to create role");
    }
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id: editItem.id,
        name: editName.trim(),
      });
      toast.success("Role updated");
      setEditItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to update role");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Role deleted");
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setDeleteId(null);
    }
  };

  const handleAssignPerm = async () => {
    if (!permissionsRoleId || !assignPermission) return;
    try {
      await assignPermMutation.mutateAsync({
        roleId: permissionsRoleId,
        permission: assignPermission,
      });
      toast.success("Permission assigned");
      setAssignPermission("");
    } catch {
      toast.error("Failed to assign permission");
    }
  };

  const handleRemovePerm = async (permission: string) => {
    if (!permissionsRoleId) return;
    try {
      await removePermMutation.mutateAsync({
        roleId: permissionsRoleId,
        permission,
      });
      toast.success("Permission removed");
    } catch {
      toast.error("Failed to remove permission");
    }
  };

  const permissionsRole = roles.find((r) => r.id === permissionsRoleId);
  const assignedPermNames = rolePerms.map((p) => p.name);
  const availablePerms = allPermissions.filter(
    (p) => !assignedPermNames.includes(p.name),
  );

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Role Management"
          description="Manage roles and their permissions"
          icon={Shield}
          actions={
            <PermissionGate permission="roles.create">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </PermissionGate>
          }
        />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Guard</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No roles found.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium capitalize">
                      {role.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.guard_name}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Manage permissions"
                          onClick={() => setPermissionsRoleId(role.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <PermissionGate permission="roles.edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditItem(role);
                              setEditName(role.name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="roles.delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteId(role.id)}
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
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Create Role</DialogTitle>
              <DialogDescription>
                Add a new role to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label>Role Name *</Label>
                <Input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. lab_technician"
                />
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
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update this role's name or details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label>Role Name *</Label>
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

        {/* Permissions Dialog */}
        <Dialog
          open={!!permissionsRoleId}
          onOpenChange={(v) => !v && setPermissionsRoleId(null)}
        >
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Permissions for "{permissionsRole?.name}"
              </DialogTitle>
              <DialogDescription>
                Assign or remove permissions for this role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex gap-2">
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={assignPermission}
                  onChange={(e) => setAssignPermission(e.target.value)}
                >
                  <option value="">Select permission to assign…</option>
                  {availablePerms.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAssignPerm}
                  disabled={!assignPermission || assignPermMutation.isPending}
                >
                  Assign
                </Button>
              </div>
              <div className="space-y-2">
                {rolePerms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned.
                  </p>
                ) : (
                  rolePerms.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between py-1 border-b last:border-0"
                    >
                      <span className="text-sm font-mono">{perm.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleRemovePerm(perm.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(v) => !v && setDeleteId(null)}
          title="Delete Role"
          description="This will remove the role. Users with this role will lose access. This cannot be undone."
          onConfirm={handleDelete}
          confirmLabel="Delete"
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
};

export default RoleManagement;
