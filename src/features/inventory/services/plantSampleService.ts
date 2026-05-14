import type { PlantSampleApi, PlantSamplePayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";

const entity = createEntityService<PlantSampleApi, PlantSamplePayload>(
  "plant-samples",
  "/plant-samples",
);

export const sampleKeys         = entity.keys;
export const plantSampleService = entity.service;

export const usePlantSampleList   = entity.useList;
export const usePlantSampleById   = entity.useById;
export const useCreatePlantSample = entity.useCreate;
export const useUpdatePlantSample = entity.useUpdate;
export const useDeletePlantSample = entity.useDelete;
