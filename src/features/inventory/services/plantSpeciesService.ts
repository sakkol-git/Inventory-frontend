import type { PlantSpeciesApi, PlantSpeciesPayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";

const entity = createEntityService<PlantSpeciesApi, PlantSpeciesPayload>(
  "plant-species",
  "/plant-species",
);

export const speciesKeys         = entity.keys;
export const plantSpeciesService = entity.service;

export const usePlantSpeciesList   = entity.useList;
export const usePlantSpeciesById   = entity.useById;
export const useCreatePlantSpecies = entity.useCreate;
export const useUpdatePlantSpecies = entity.useUpdate;
export const useDeletePlantSpecies = entity.useDelete;
