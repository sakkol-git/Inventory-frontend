/* ═══════════════════════════════════════════════════════════════════════════
 * useUsersView — All state + logic for the Users management page.
 *
 * Full CRUD. Connects to Laravel backend via React Query + userService.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useConfirmDialog } from "@/shared/components/ConfirmDialog";
import {
    useCreateUser,
    useDeleteUser,
    useUpdateUser,
    useUserList,
} from "@/features/inventory/services/userService";
import { isValidationError } from "@/shared/types/api-error";
import { USER_ROLES, formatEnumLabel, type UserRole } from "@/shared/types/enums";
import type {
    LabUserApi,
    UserCreatePayload,
    UserUpdatePayload,
} from "@/features/inventory/types";
import { useState } from "react";
import { toast } from "sonner";

// ─── Re-exports ────────────────────────────────────────────────────────────

export { USER_ROLES, formatEnumLabel };

// ─── Types ─────────────────────────────────────────────────────────────────

export type UserItem = LabUserApi;

export type UserForm = {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  passwordConfirmation: string;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const EMPTY_FORM: UserForm = {
  name: "",
  email: "",
  phone: "",
  role: "student",
  password: "",
  passwordConfirmation: "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export const roleStyle = (role: string): string => {
  switch (role) {
    case "admin":
      return "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400";
    case "lab_manager":
      return "bg-muted text-primary";
    case "student":
      return "bg-warning/10 text-warning";
    default:
      return "bg-muted text-muted-foreground";
  }
};

function formToCreatePayload(form: UserForm): UserCreatePayload {
  return {
    name: form.name,
    email: form.email,
    password: form.password,
    password_confirmation: form.passwordConfirmation,
    phone: form.phone || null,
    role: form.role as UserRole,
  };
}

function formToUpdatePayload(form: UserForm): UserUpdatePayload {
  const payload: UserUpdatePayload = {
    name: form.name,
    email: form.email,
    phone: form.phone || null,
    role: form.role as UserRole,
  };
  if (form.password) {
    payload.password = form.password;
    payload.password_confirmation = form.passwordConfirmation;
  }
  return payload;
}

function userToForm(user: LabUserApi): UserForm {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    password: "",
    passwordConfirmation: "",
  };
}

// ─── Backend Error Field Map ────────────────────────────────────────────────

const BACKEND_FIELD_MAP: Record<string, keyof UserForm> = {
  name: "name",
  email: "email",
  phone: "phone",
  role: "role",
  password: "password",
  password_confirmation: "passwordConfirmation",
};

type FormErrors = Partial<Record<keyof UserForm, string>>;

function mapBackendErrors(errors: Record<string, string[]>): FormErrors {
  const mapped: FormErrors = {};
  for (const [key, msgs] of Object.entries(errors)) {
    const field = BACKEND_FIELD_MAP[key];
    if (field) mapped[field] = msgs[0];
  }
  return mapped;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useUsersView() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;
  if (roleFilter !== "all") queryParams.role = roleFilter;

  const { data: response, isLoading, isError } = useUserList(queryParams);

  const items: UserItem[] = response?.data ?? [];
  const meta = response?.meta;

  // ── Mutations ──
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const deleteDialog = useConfirmDialog();

  const isEditing = editingItem !== null;
  const formTitle = isEditing ? "Edit User" : "Add New User";
  const formDescription = isEditing
    ? `Update details for ${editingItem!.name}.`
    : "Create a new lab member account.";

  const canSubmitForm = Boolean(
    form.name &&
    form.email &&
    form.role &&
    (isEditing || (form.password && form.passwordConfirmation)),
  );

  // ── Actions ──
  const openCreateForm = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const openEditForm = (user: UserItem) => {
    setEditingItem(user);
    setForm(userToForm(user));
    setFormErrors({});
    setFormOpen(true);
  };

  const updateFormField = <K extends keyof UserForm>(
    field: K,
    value: UserForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitUserForm = () => {
    if (!canSubmitForm) {
      toast.error("Please fill in all required fields");
      return;
    }
    setFormErrors({});

    if (editingItem) {
      const payload = formToUpdatePayload(form);
      updateMutation.mutate(
        { id: editingItem.id, payload },
        {
          onSuccess: () => {
            setFormOpen(false);
            setForm(EMPTY_FORM);
            setEditingItem(null);
            toast.success(`${form.name} updated successfully`);
          },
          onError: (err) => {
            if (isValidationError(err)) {
              setFormErrors(mapBackendErrors(err.response.data.errors));
            }
            toast.error(
              isValidationError(err)
                ? err.response.data.message
                : "Failed to update user",
            );
          },
        },
      );
    } else {
      const payload = formToCreatePayload(form);
      createMutation.mutate(payload, {
        onSuccess: () => {
          setFormOpen(false);
          setForm(EMPTY_FORM);
          setEditingItem(null);
          toast.success(`${form.name} created successfully`);
        },
        onError: (err) => {
          if (isValidationError(err)) {
            setFormErrors(mapBackendErrors(err.response.data.errors));
          }
          toast.error(
            isValidationError(err)
              ? err.response.data.message
              : "Failed to create user",
          );
        },
      });
    }
  };

  // ── Delete ──
  const requestDeleteUser = (user: UserItem) => {
    deleteDialog.requestConfirm(String(user.id), {
      title: `Delete ${user.name}?`,
      description: `This will permanently remove the account for ${user.name} (${user.email}).`,
    });
  };

  const confirmDeleteUser = () => {
    deleteDialog.confirm((id) => {
      deleteMutation.mutate(Number(id), {
        onSuccess: () => toast.success("User deleted"),
        onError: () => toast.error("Failed to delete user"),
      });
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    items,
    totalCount: meta?.total ?? items.length,
    searchQuery,
    updateSearchQuery: setSearchQuery,
    roleFilter,
    updateRoleFilter: setRoleFilter,
    formOpen,
    isEditing,
    formTitle,
    formDescription,
    form,
    formErrors,
    canSubmitForm,
    openCreateForm,
    openEditForm,
    closeForm,
    updateFormField,
    submitUserForm,
    deleteDialog,
    requestDeleteUser,
    confirmDeleteUser,
    isLoading,
    isError,
    isSubmitting,
    page,
    setPage,
    meta,
  };
}
