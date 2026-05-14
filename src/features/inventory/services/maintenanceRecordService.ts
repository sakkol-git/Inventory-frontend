// ═══════════════════════════════════════════════════════════════════════════
// Maintenance Record Service
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { ApiResponse, MaintenanceRecord } from "@/shared/types/index";
import type {
    StoreMaintenanceRecordPayload,
    UpdateMaintenanceRecordPayload,
} from "@/shared/types/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["maintenance-records"] as const;

export const useMaintenanceRecords = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MaintenanceRecord[]>>(
        "/maintenance-records",
        { params },
      );
      return data.data;
    },
  });

export const useMaintenanceRecordById = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MaintenanceRecord>>(
        `/maintenance-records/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });

export const useCreateMaintenanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StoreMaintenanceRecordPayload) => {
      const { data } = await api.post<ApiResponse<MaintenanceRecord>>(
        "/maintenance-records",
        payload,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateMaintenanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateMaintenanceRecordPayload & { id: number }) => {
      const { data } = await api.put<ApiResponse<MaintenanceRecord>>(
        `/maintenance-records/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteMaintenanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/maintenance-records/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
