import type { LabUserApi, UserCreatePayload } from "@/features/inventory/types";
import { createEntityService } from "@/core/api/createEntityService";

const entity = createEntityService<LabUserApi, UserCreatePayload>(
  "users",
  "/users",
);

export const userKeys    = entity.keys;
export const userService = entity.service;

export const useUserList   = entity.useList;
export const useUserById   = entity.useById;
export const useCreateUser = entity.useCreate;
export const useUpdateUser = entity.useUpdate;
export const useDeleteUser = entity.useDelete;
