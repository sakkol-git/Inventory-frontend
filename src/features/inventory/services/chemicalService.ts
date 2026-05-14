// Thin wrapper — all CRUD logic lives in the shared factory.
// Adding or changing HTTP/cache behaviour is a single-file change.
import type { ChemicalApi, ChemicalPayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";

const entity = createEntityService<ChemicalApi, ChemicalPayload>(
  "chemicals",
  "/chemicals",
);

export const chemicalKeys    = entity.keys;
export const chemicalService = entity.service;

export const useChemicalList   = entity.useList;
export const useChemicalById   = entity.useById;
export const useCreateChemical = entity.useCreate;
export const useUpdateChemical = entity.useUpdate;
export const useDeleteChemical = entity.useDelete;
