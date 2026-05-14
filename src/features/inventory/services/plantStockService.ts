import type { PlantStockApi, PlantStockCreatePayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";

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
