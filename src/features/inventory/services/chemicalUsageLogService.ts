// ═══════════════════════════════════════════════════════════════════════════
// Chemical Usage Log Service
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { ApiResponse, ChemicalUsageLog } from "@/shared/types/index";
import type { StoreChemicalUsageLogPayload } from "@/shared/types/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["chemical-usage-logs"] as const;

export const useChemicalUsageLogs = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChemicalUsageLog[]>>(
        "/chemical-usage-logs",
        { params },
      );
      return data.data;
    },
  });

export const useChemicalUsageLogById = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChemicalUsageLog>>(
        `/chemical-usage-logs/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });

export const useCreateChemicalUsageLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StoreChemicalUsageLogPayload) => {
      const { data } = await api.post<ApiResponse<ChemicalUsageLog>>(
        "/chemical-usage-logs",
        payload,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
