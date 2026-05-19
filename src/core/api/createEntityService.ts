// ─── Generic CRUD Service Factory ────────────────────────────────────────────
//
// WHY THIS EXISTS
// Every domain entity (Chemical, Equipment, PlantSpecies, …) needs the exact
// same five HTTP methods and five React Query hooks.  Duplicating that pattern
// across 7+ files is a direct violation of DRY — any cross-cutting change
// (error handling, query key shape, cache strategy) must be made in every copy.
//
// This factory receives only what actually differs between entities:
//   • `baseKey`  — the React Query cache key root  (e.g. "chemicals")
//   • `endpoint` — the REST API path               (e.g. "/chemicals")
//
// and returns a fully-typed set of keys, an HTTP service object, and
// five ready-to-use React Query hooks.
//
// USAGE (in a domain service file)
//   const entity = createEntityService<ChemicalApi, ChemicalPayload>(
//     "chemicals", "/chemicals",
//   );
//   export const chemicalKeys        = entity.keys;
//   export const chemicalService     = entity.service;
//   export const useChemicalList     = entity.useList;
//   …
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "@/core/api/api";
import type { PaginatedResponse } from "@/shared/types/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── FormData helpers ───────────────────────────────────────────────────────

/** Returns true when any value in the object is a File instance. */
function hasFile(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) => v instanceof File);
}

/**
 * Converts a flat payload object to FormData.
 * - File values are appended as-is (multipart binary).
 * - null / undefined are skipped (not sent at all).
 * - Everything else is stringified.
 */
function toFormData(
  payload: Record<string, unknown>,
  method?: "PUT" | "PATCH",
): FormData {
  const fd = new FormData();
  if (method) fd.append("_method", method);
  for (const [key, value] of Object.entries(payload)) {
    if (value instanceof File) {
      fd.append(key, value);
    } else if (value !== null && value !== undefined) {
      fd.append(key, String(value));
    }
  }
  return fd;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface EntityKeys {
  all: readonly string[];
  lists: () => readonly unknown[];
  list: (params: Record<string, unknown>) => readonly unknown[];
  detail: (id: number) => readonly unknown[];
}

export interface EntityService<TApi, TPayload> {
  list: (params?: Record<string, unknown>) => Promise<PaginatedResponse<TApi>>;
  show: (id: number) => Promise<TApi>;
  create: (payload: TPayload) => Promise<{ data: TApi }>;
  update: (id: number, payload: Partial<TPayload>) => Promise<{ data: TApi }>;
  destroy: (id: number) => Promise<{ message: string }>;
}

// ── Factory ────────────────────────────────────────────────────────────────

export function createEntityService<TApi, TPayload>(
  baseKey: string,
  endpoint: string,
) {
  // Hierarchical cache key structure — invalidating `all` cleans every
  // sub-key (lists and individual detail entries) in one call.
  const keys: EntityKeys = {
    all: [baseKey] as const,
    lists: () => [...keys.all, "list"] as const,
    list: (params) => [...keys.lists(), params] as const,
    detail: (id) => [...keys.all, "detail", id] as const,
  };

  // Plain HTTP functions — no React dependency, easily testable in isolation.
  // When the payload contains a File, we automatically switch to
  // multipart/form-data so Laravel can process the upload.
  const service: EntityService<TApi, TPayload> = {
    list: (params) =>
      api
        .get<PaginatedResponse<TApi>>(endpoint, { params })
        .then((response) => response.data),

    show: (id) =>
      api
        .get<{ data: TApi }>(`${endpoint}/${id}`)
        .then((response) => response.data.data),

    create: (payload) => {
      const raw = payload as unknown as Record<string, unknown>;
      if (hasFile(raw)) {
        return api
          .post<{ data: TApi }>(endpoint, toFormData(raw), {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((r) => r.data);
      }
      return api
        .post<{ data: TApi }>(endpoint, payload)
        .then((response) => response.data);
    },

    update: (id, payload) => {
      const raw = payload as unknown as Record<string, unknown>;
      if (hasFile(raw)) {
        return api
          .post<{ data: TApi }>(`${endpoint}/${id}`, toFormData(raw, "PUT"), {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((r) => r.data);
      }
      return api
        .put<{ data: TApi }>(`${endpoint}/${id}`, payload)
        .then((response) => response.data);
    },

    destroy: (id) =>
      api
        .delete<{ message: string }>(`${endpoint}/${id}`)
        .then((response) => response.data),
  };

  // ── React Query hooks ──────────────────────────────────────────────────

  function useList(params?: Record<string, unknown>) {
    return useQuery<PaginatedResponse<TApi>>({
      queryKey: keys.list(params ?? {}),
      queryFn: () => service.list(params),
    });
  }

  function useById(id: number | undefined) {
    return useQuery<TApi>({
      queryKey: keys.detail(id!),
      queryFn: () => service.show(id!),
      enabled: !!id,
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: TPayload) => service.create(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: number;
        payload: Partial<TPayload>;
      }) => service.update(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => service.destroy(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
    });
  }

  return { keys, service, useList, useById, useCreate, useUpdate, useDelete };
}
