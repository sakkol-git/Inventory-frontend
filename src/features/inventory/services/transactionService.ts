// ═══════════════════════════════════════════════════════════════════════════
// Transaction Service — HTTP client + React Query hooks (single source of truth)
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { PaginatedResponse } from "@/shared/types/pagination";
import type { TransactionApi } from "@/features/inventory/types";
import { useQuery } from "@tanstack/react-query";

// ── Query Key Factory ─────────────────────────────────────────────────────
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...transactionKeys.lists(), params] as const,
  detail: (id: number) => [...transactionKeys.all, "detail", id] as const,
};

// ── HTTP Client ───────────────────────────────────────────────────────────
export const transactionService = {
  list: (params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<TransactionApi>>("/transactions", { params })
      .then((response) => response.data),

  show: (id: number) =>
    api
      .get<{ data: TransactionApi }>(`/transactions/${id}`)
      .then((response) => response.data),
};

// ── React Query Hooks ─────────────────────────────────────────────────────
export function useTransactionList(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<TransactionApi>>({
    queryKey: transactionKeys.list(params ?? {}),
    queryFn: () => transactionService.list(params),
  });
}

export function useTransactionById(id: number | undefined) {
  return useQuery({
    queryKey: transactionKeys.detail(id!),
    queryFn: () => transactionService.show(id!),
    enabled: !!id,
  });
}
