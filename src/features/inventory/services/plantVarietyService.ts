import type { PlantVarietyApi, PlantVarietyPayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";

const entity = createEntityService<PlantVarietyApi, PlantVarietyPayload>(
  "plant-varieties",
  "/plant-varieties",
);

export const varietyKeys          = entity.keys;
export const plantVarietyService  = entity.service;

export const usePlantVarietyList   = entity.useList;
export const usePlantVarietyById   = entity.useById;
export const useCreatePlantVariety = entity.useCreate;
export const useUpdatePlantVariety = entity.useUpdate;
export const useDeletePlantVariety = entity.useDelete;
