import type { PlantStockApi, PlantStockCreatePayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";
import { api } from "@/core/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const entity = createEntityService<PlantStockApi, PlantStockCreatePayload>(
  "plant-stocks",
  "/plant-stocks",
);

export const stockKeys         = entity.keys;
export const plantStockService = entity.service;

export const usePlantStockList   = entity.useList;
export const usePlantStockById   = entity.useById;
export const useCreatePlantStock = entity.useCreate;
export const useUpdatePlantStock = entity.useUpdate;
export const useDeletePlantStock = entity.useDelete;

export type AdjustStockAction = 'consume' | 'reserve' | 'release' | 'restock';

export const useAdjustPlantStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action, quantity }: { id: number; action: AdjustStockAction; quantity: number }) => {
      const response = await api.post<{ data: PlantStockApi }>(`/plant-stocks/${id}/${action}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
};
