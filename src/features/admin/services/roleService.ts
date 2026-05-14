// ═══════════════════════════════════════════════════════════════════════════
// Role Service (Admin only)
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { ApiResponse, Permission, Role, User } from "@/shared/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["roles"] as const;

// ── Queries ───────────────────────────────────────────────────────────────
export const useRoles = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Role[]>>("/roles");
      return data.data;
    },
  });

export const useRoleById = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Role>>(`/roles/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

export const useRolePermissions = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id, "permissions"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Permission[]>>(
        `/roles/${id}/permissions`,
      );
      return data.data;
    },
    enabled: !!id,
  });

export const useRoleUsers = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id, "users"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>(`/roles/${id}/users`);
      return data.data;
    },
    enabled: !!id,
  });

// ── Mutations ─────────────────────────────────────────────────────────────
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await api.post<ApiResponse<Role>>("/roles", payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data } = await api.put<ApiResponse<Role>>(`/roles/${id}`, {
        name,
      });
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/roles/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useAssignPermissionToRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      permission,
    }: {
      roleId: number;
      permission: string;
    }) => {
      const { data } = await api.post<{ message: string }>(
        `/roles/${roleId}/permissions`,
        { permission },
      );
      return data;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, variables.roleId, "permissions"],
      }),
  });
};

export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      permission,
    }: {
      roleId: number;
      permission: string;
    }) => {
      const { data } = await api.delete<{ message: string }>(
        `/roles/${roleId}/permissions/${permission}`,
      );
      return data;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, variables.roleId, "permissions"],
      }),
  });
};

export const useAssignUserToRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      userId,
    }: {
      roleId: number;
      userId: number;
    }) => {
      const { data } = await api.post<{ message: string }>(
        `/roles/${roleId}/users`,
        { user_id: userId },
      );
      return data;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, variables.roleId, "users"],
      }),
  });
};

export const useRemoveUserFromRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      userId,
    }: {
      roleId: number;
      userId: number;
    }) => {
      const { data } = await api.delete<{ message: string }>(
        `/roles/${roleId}/users/${userId}`,
      );
      return data;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, variables.roleId, "users"],
      }),
  });
};
