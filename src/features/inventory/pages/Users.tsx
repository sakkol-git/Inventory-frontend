/* ═══════════════════════════════════════════════════════════════════════════
 * Users — Lab member management page.
 *
 * All state lives in useUsersView().
 * This file is pure declarative JSX — no useState, no business logic.
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── External ──────────────────────────────────────────────────────────────
import {
    GraduationCap,
    Pencil,
    Plus,
    Shield,
    Trash2,
    User,
    Users as UsersIcon,
} from "lucide-react";

// ─── Internal Components ───────────────────────────────────────────────────
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
import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import EmptyState from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";
import PageHeader from "@/shared/components/PageHeader";
import SearchFilter from "@/shared/components/SearchFilter";
import { cn } from "@/shared/lib/utils";

// ─── Hook & Types ──────────────────────────────────────────────────────────
import {
    formatEnumLabel,
    roleStyle,
    USER_ROLES,
    useUsersView,
    type UserItem,
} from "./useUsersView";

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

const Users = () => {
  const view = useUsersView();

  const hasResults = view.items.length > 0;

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={UsersIcon}
          title="User Management"
          description="Manage lab members and access permissions"
          actions={
            <Button className="gap-2" onClick={view.openCreateForm}>
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          }
        />

        <SearchFilter
          query={view.searchQuery}
          onQueryChange={view.updateSearchQuery}
          placeholder="Search users..."
        >
          <RoleFilter
            value={view.roleFilter}
            onChange={view.updateRoleFilter}
          />
        </SearchFilter>

        {view.isLoading && (
          <LoadingState variant="skeleton" rows={6} text="Loading users..." />
        )}

        {view.isError && !view.isLoading && (
          <ErrorState
            message="Failed to load users"
            onRetry={() => window.location.reload()}
          />
        )}

        {!view.isLoading && !view.isError && !hasResults && (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="Try adjusting your search or role filter."
          />
        )}

        {hasResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {view.items.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={view.openEditForm}
                onDelete={view.requestDeleteUser}
              />
            ))}
          </div>
        )}

        <footer className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {view.items.length} of {view.totalCount} users
          </p>
          {view.meta && view.meta.last_page > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={view.page <= 1}
                onClick={() => view.setPage(view.page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs">
                Page {view.meta.current_page} of {view.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={view.page >= view.meta.last_page}
                onClick={() => view.setPage(view.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </footer>
      </div>

      <UserFormDialog view={view} />
      <ConfirmDialog
        open={view.deleteDialog.open}
        onOpenChange={view.deleteDialog.setOpen}
        onConfirm={view.confirmDeleteUser}
        title={view.deleteDialog.pendingMeta.title}
        description={view.deleteDialog.pendingMeta.description}
      />
    </AppLayout>
  );
};

export default Users;

/* ═══════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Role Filter ───────────────────────────────────────────────────────── */

const RoleFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-40">
      <SelectValue placeholder="All Roles" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Roles</SelectItem>
      {USER_ROLES.map((r) => (
        <SelectItem key={r} value={r}>
          {formatEnumLabel(r)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/* ─── User Card ─────────────────────────────────────────────────────────── */

const roleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return Shield;
    case "lab_manager":
      return GraduationCap;
    default:
      return User;
  }
};

const UserCard = ({
  user,
  onEdit,
  onDelete,
}: {
  user: UserItem;
  onEdit: (u: UserItem) => void;
  onDelete: (u: UserItem) => void;
}) => {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const RoleIcon = roleIcon(user.role);

  return (
    <div className="bg-card rounded-xl p-5 border border-border/60 hover-lift hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <AvatarCircle initials={initials} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{user.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <span
          className={cn(
            "inline-flex items-center gap-2 px-2.5 py-0.5 text-xs font-medium border rounded-lg",
            roleStyle(user.role),
          )}
        >
          <RoleIcon className="h-4 w-4" />
          {formatEnumLabel(user.role)}
        </span>
        {user.phone && (
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Joined {new Date(user.created_at).toLocaleDateString()}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label={`Edit ${user.name}`}
            onClick={() => onEdit(user)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            aria-label={`Delete ${user.name}`}
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Avatar ────────────────────────────────────────────────────────────── */

const AvatarCircle = ({ initials }: { initials: string }) => (
  <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center shrink-0">
    <span className="text-lg font-medium text-muted-foreground">
      {initials}
    </span>
  </div>
);

/* ─── Form Dialog ───────────────────────────────────────────────────────── */

const UserFormDialog = ({
  view,
}: {
  view: ReturnType<typeof useUsersView>;
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
          <Label htmlFor="user-name">Full Name *</Label>
          <Input
            id="user-name"
            placeholder="e.g., Dr. Sarah Chen"
            value={view.form.name}
            onChange={(e) => view.updateFormField("name", e.target.value)}
          />
          {view.formErrors.name && (
            <p className="text-xs text-destructive">{view.formErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">Email *</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="e.g., sarah.chen@university.edu"
            value={view.form.email}
            onChange={(e) => view.updateFormField("email", e.target.value)}
          />
          {view.formErrors.email && (
            <p className="text-xs text-destructive">{view.formErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-phone">Phone</Label>
          <Input
            id="user-phone"
            type="tel"
            placeholder="e.g., +1 555-0123"
            value={view.form.phone}
            onChange={(e) => view.updateFormField("phone", e.target.value)}
          />
          {view.formErrors.phone && (
            <p className="text-xs text-destructive">{view.formErrors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-role">Role *</Label>
          <Select
            value={view.form.role}
            onValueChange={(v) => view.updateFormField("role", v)}
          >
            <SelectTrigger id="user-role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {formatEnumLabel(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {view.formErrors.role && (
            <p className="text-xs text-destructive">{view.formErrors.role}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-password">
            Password {view.isEditing ? "(leave blank to keep)" : "*"}
          </Label>
          <Input
            id="user-password"
            type="password"
            placeholder={
              view.isEditing ? "Leave blank to keep current" : "Enter password"
            }
            value={view.form.password}
            onChange={(e) => view.updateFormField("password", e.target.value)}
          />
          {view.formErrors.password && (
            <p className="text-xs text-destructive">
              {view.formErrors.password}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-password-confirm">
            Confirm Password {view.isEditing ? "" : "*"}
          </Label>
          <Input
            id="user-password-confirm"
            type="password"
            placeholder="Confirm password"
            value={view.form.passwordConfirmation}
            onChange={(e) =>
              view.updateFormField("passwordConfirmation", e.target.value)
            }
          />
          {view.formErrors.passwordConfirmation && (
            <p className="text-xs text-destructive">
              {view.formErrors.passwordConfirmation}
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={view.closeForm}>
          Cancel
        </Button>
        <Button
          onClick={view.submitUserForm}
          disabled={!view.canSubmitForm || view.isSubmitting}
        >
          {view.isSubmitting
            ? "Saving…"
            : view.isEditing
              ? "Save Changes"
              : "Create User"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
