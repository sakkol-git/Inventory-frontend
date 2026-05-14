// ═══════════════════════════════════════════════════════════════════════════
// Borrow Record Service — HTTP client + React Query hooks (single source of truth)
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type {
    BorrowPayload,
    BorrowRecordApi,
    ReturnPayload,
} from "@/features/inventory/types";
import type { ApiResponse, BorrowRecord } from "@/shared/types/index";
import type { PaginatedResponse } from "@/shared/types/pagination";
import type {
    ApproveBorrowPayload,
    RejectBorrowPayload,
    ReturnBorrowPayload,
    StoreBorrowRecordPayload,
} from "@/shared/types/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Query Key Factory ─────────────────────────────────────────────────────
export const borrowKeys = {
  all: ["borrow-records"] as const,
  lists: () => [...borrowKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...borrowKeys.lists(), params] as const,
  detail: (id: number) => [...borrowKeys.all, "detail", id] as const,
  overdue: () => [...borrowKeys.all, "overdue"] as const,
};

// ── HTTP Client ───────────────────────────────────────────────────────────
export const borrowRecordService = {
  list: (params?: Record<string, unknown>) =>
    api
      .get<ApiResponse<BorrowRecord[]>>("/borrow-records", { params })
      .then((response) => response.data),
  show: (id: number) =>
    api
      .get<ApiResponse<BorrowRecord>>(`/borrow-records/${id}`)
      .then((response) => response.data),
  create: (payload: StoreBorrowRecordPayload) =>
    api
      .post<ApiResponse<BorrowRecord>>("/borrow-records", payload)
      .then((response) => response.data),
  overdue: (params?: Record<string, unknown>) =>
    api
      .get<ApiResponse<BorrowRecord[]>>("/borrow-records/overdue", { params })
      .then((response) => response.data),
  pending: (params?: Record<string, unknown>) =>
    api
      .get<ApiResponse<BorrowRecord[]>>("/borrow-records/pending", { params })
      .then((response) => response.data),
  approve: (id: number, payload?: ApproveBorrowPayload) =>
    api
      .post<{
        data: BorrowRecord;
        message: string;
      }>(`/borrow-records/${id}/approve`, payload ?? {})
      .then((response) => response.data),
  reject: (id: number, payload: RejectBorrowPayload) =>
    api
      .post<{
        data: BorrowRecord;
        message: string;
      }>(`/borrow-records/${id}/reject`, payload)
      .then((response) => response.data),
  returnItem: (id: number, payload?: ReturnBorrowPayload) =>
    api
      .post<{
        data: BorrowRecord;
        message: string;
      }>(`/borrow-records/${id}/return`, payload ?? {})
      .then((response) => response.data),
};

// ── React Query Hooks (from hook-file merge) ──────────────────────────────
export function useBorrowRecordList(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<BorrowRecordApi>>({
    queryKey: borrowKeys.list(params ?? {}),
    queryFn: () =>
      api
        .get<PaginatedResponse<BorrowRecordApi>>("/borrow-records", { params })
        .then((response) => response.data),
  });
}

export function useBorrowRecordById(id: number | undefined) {
  return useQuery({
    queryKey: borrowKeys.detail(id!),
    queryFn: () =>
      api
        .get<ApiResponse<BorrowRecord>>(`/borrow-records/${id}`)
        .then((response) => response.data),
    enabled: !!id,
  });
}

export function useOverdueBorrowRecords(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<BorrowRecordApi>>({
    queryKey: [...borrowKeys.overdue(), params ?? {}],
    queryFn: () =>
      api
        .get<PaginatedResponse<BorrowRecordApi>>("/borrow-records/overdue", {
          params,
        })
        .then((response) => response.data),
  });
}

export function useCreateBorrowRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BorrowPayload) =>
      api
        .post<ApiResponse<BorrowRecord>>("/borrow-records", payload)
        .then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowKeys.all });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["chemicals"] });
    },
  });
}

export function useReturnBorrowRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: ReturnPayload }) =>
      borrowRecordService.returnItem(id, payload as ReturnBorrowPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowKeys.all });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["chemicals"] });
    },
  });
}

// ── Hooks consumed directly by PendingApprovals / OverdueBorrows pages ────
export const useOverdueBorrows = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [...borrowKeys.overdue(), params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BorrowRecord[]>>(
        "/borrow-records/overdue",
        { params },
      );
      return data.data;
    },
  });

export const usePendingBorrows = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [...borrowKeys.all, "pending", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BorrowRecord[]>>(
        "/borrow-records/pending",
        { params },
      );
      return data.data;
    },
  });

export const useApproveBorrow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: ApproveBorrowPayload & { id: number }) => {
      const { data } = await api.post<{ data: BorrowRecord; message: string }>(
        `/borrow-records/${id}/approve`,
        payload,
      );
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: borrowKeys.all }),
  });
};

export const useRejectBorrow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: RejectBorrowPayload & { id: number }) => {
      const { data } = await api.post<{ data: BorrowRecord; message: string }>(
        `/borrow-records/${id}/reject`,
        payload,
      );
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: borrowKeys.all }),
  });
};
