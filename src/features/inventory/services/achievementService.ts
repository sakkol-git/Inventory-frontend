// ═══════════════════════════════════════════════════════════════════════════
// Achievement Service
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { Achievement, ApiResponse } from "@/shared/types/index";
import type {
    StoreAchievementPayload,
    UpdateAchievementPayload,
} from "@/shared/types/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["achievements"] as const;

export const useAchievements = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Achievement[]>>(
        "/achievements",
        { params },
      );
      return data.data;
    },
  });

export const useAchievementById = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Achievement>>(
        `/achievements/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });

export const useCreateAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StoreAchievementPayload) => {
      const { data } = await api.post<ApiResponse<Achievement>>(
        "/achievements",
        payload,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateAchievementPayload & { id: number }) => {
      const { data } = await api.put<ApiResponse<Achievement>>(
        `/achievements/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/achievements/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

// ── Assign / Revoke ───────────────────────────────────────────────────────
export const useAssignAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      achievementId,
      userId,
    }: {
      achievementId: number;
      userId: number;
    }) => {
      const { data } = await api.post<{ message: string }>(
        `/achievements/${achievementId}/assign/${userId}`,
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useRevokeAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      achievementId,
      userId,
    }: {
      achievementId: number;
      userId: number;
    }) => {
      const { data } = await api.delete<{ message: string }>(
        `/achievements/${achievementId}/revoke/${userId}`,
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
