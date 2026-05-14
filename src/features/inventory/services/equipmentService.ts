import type { EquipmentApi, EquipmentPayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";

const entity = createEntityService<EquipmentApi, EquipmentPayload>(
  "equipment",
  "/equipment",
);

export const equipmentKeys    = entity.keys;
export const equipmentService = entity.service;

export const useEquipmentList   = entity.useList;
export const useEquipmentById   = entity.useById;
export const useCreateEquipment = entity.useCreate;
export const useUpdateEquipment = entity.useUpdate;
export const useDeleteEquipment = entity.useDelete;
