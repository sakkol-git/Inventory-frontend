// ═══════════════════════════════════════════════════════════════════════════
// Chemical Batch Service
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { ApiResponse, ChemicalBatch } from "@/shared/types/index";
import type {
    StoreChemicalBatchPayload,
    UpdateChemicalBatchPayload,
} from "@/shared/types/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["chemical-batches"] as const;

export const useChemicalBatches = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChemicalBatch[]>>(
        "/chemical-batches",
        { params },
      );
      return data.data;
    },
  });

export const useChemicalBatchById = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChemicalBatch>>(
        `/chemical-batches/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });

export const useCreateChemicalBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StoreChemicalBatchPayload) => {
      const { data } = await api.post<ApiResponse<ChemicalBatch>>(
        "/chemical-batches",
        payload,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateChemicalBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateChemicalBatchPayload & { id: number }) => {
      const { data } = await api.put<ApiResponse<ChemicalBatch>>(
        `/chemical-batches/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteChemicalBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/chemical-batches/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
