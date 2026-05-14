// ═══════════════════════════════════════════════════════════════════════════
// Permission Service (Admin only)
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { ApiResponse, Permission } from "@/shared/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["permissions"] as const;

// ── Queries ───────────────────────────────────────────────────────────────
export const usePermissions = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Permission[]>>("/permissions");
      return data.data;
    },
  });

export const usePermissionById = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Permission>>(
        `/permissions/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });

// ── Mutations ─────────────────────────────────────────────────────────────
export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await api.post<ApiResponse<Permission>>(
        "/permissions",
        payload,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data } = await api.put<ApiResponse<Permission>>(
        `/permissions/${id}`,
        { name },
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/permissions/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
