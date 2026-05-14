// ═══════════════════════════════════════════════════════════════════════════
// Profile Service
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type {
    Achievement,
    ApiResponse,
    ProfileShowResponse,
    User,
} from "@/shared/types/index";
import type { UpdateProfilePayload } from "@/shared/types/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["profile"] as const;

// ── Queries ───────────────────────────────────────────────────────────────
export const useProfile = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ProfileShowResponse>("/profile");
      return data.data;
    },
  });

export const useProfileContributions = () =>
  useQuery({
    queryKey: [...QUERY_KEY, "contributions"],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{
          contributed_samples: unknown[];
          recent_transactions: unknown[];
          chemical_usage: unknown[];
        }>
      >("/profile/contributions");
      return data.data;
    },
  });

export const useProfileAchievements = () =>
  useQuery({
    queryKey: [...QUERY_KEY, "achievements"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Achievement[]>>(
        "/profile/achievements",
      );
      return data.data;
    },
  });

export const useProfileActivity = (from?: string, to?: string) =>
  useQuery({
    queryKey: [...QUERY_KEY, "activity", from, to],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{
          period: unknown;
          transactions: unknown[];
          borrows: unknown[];
        }>
      >("/profile/activity", { params: { from, to } });
      return data.data;
    },
    enabled: !!(from && to),
  });

// ── Mutations ─────────────────────────────────────────────────────────────
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await api.put<{ message: string; data: User }>(
        "/profile",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });
};
