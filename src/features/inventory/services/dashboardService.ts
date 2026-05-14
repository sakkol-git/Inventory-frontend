// ═══════════════════════════════════════════════════════════════════════════
// Dashboard Service — HTTP client + React Query hooks (single source of truth)
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { BorrowRecordApi, TransactionApi } from "@/features/inventory/types";
import type { PaginatedResponse } from "@/shared/types/pagination";
import { useQuery } from "@tanstack/react-query";

// ── Query Key Factory ─────────────────────────────────────────────────────
export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: () => [...dashboardKeys.all, "data"] as const,
};

// ── Types ─────────────────────────────────────────────────────────────────
export interface DashboardData {
  plant_species_count: number;
  plant_samples_count: number;
  samples_by_status: Record<string, number>;
  plant_stocks_count: number;
  stocks_by_status: Record<string, number>;
  chemicals_count: number;
  chemicals_expired: number;
  chemicals_expiring_soon: number;
  chemicals_low_stock: number;
  equipment_count: number;
  equipment_by_status: Record<string, number>;
  overdue_borrows_count: number;
  recent_transactions: TransactionApi[];
}

// Shape returned by the backend's /dashboard endpoint (nested)
interface BackendDashboardResponse {
  counts: {
    plant_species: number;
    plant_samples: number;
    plant_stocks: number;
    chemicals: number;
    equipment: number;
    [key: string]: number;
  };
  alerts: {
    expired_chemicals: number;
    expiring_chemicals: number;
    low_stock_chemicals: number;
    overdue_borrows: number;
    [key: string]: number;
  };
  recent_activity: Array<{
    id: number;
    user: string | null;
    action: string;
    item_type: string;
    item_id: number;
    quantity: number | string | null;
    note: string | null;
    created_at: string;
  }>;
  status_breakdown: {
    equipment_by_status: Record<string, number>;
    borrows_by_status: Record<string, number>;
    [key: string]: Record<string, number>;
  };
}

function mapBackendDashboard(d: BackendDashboardResponse): DashboardData {
  return {
    plant_species_count: d.counts.plant_species ?? 0,
    plant_samples_count: d.counts.plant_samples ?? 0,
    samples_by_status: {},
    plant_stocks_count: d.counts.plant_stocks ?? 0,
    stocks_by_status: {},
    chemicals_count: d.counts.chemicals ?? 0,
    chemicals_expired: d.alerts.expired_chemicals ?? 0,
    chemicals_expiring_soon: d.alerts.expiring_chemicals ?? 0,
    chemicals_low_stock: d.alerts.low_stock_chemicals ?? 0,
    equipment_count: d.counts.equipment ?? 0,
    equipment_by_status: d.status_breakdown?.equipment_by_status ?? {},
    overdue_borrows_count: d.alerts.overdue_borrows ?? 0,
    recent_transactions: (d.recent_activity ?? []).map((tx) => ({
      id: tx.id,
      action: tx.action as TransactionApi["action"],
      quantity: tx.quantity != null ? String(tx.quantity) : null,
      note: tx.note,
      user: tx.user ? { id: 0, name: tx.user } : null,
      item: { type: tx.item_type, id: tx.item_id, data: null },
      created_at: tx.created_at,
    })),
  };
}

// ── HTTP Client ───────────────────────────────────────────────────────────
export const dashboardService = {
  getData: async (): Promise<DashboardData> => {
    try {
      const res = await api.get<{ data: BackendDashboardResponse }>(
        "/dashboard",
      );
      return mapBackendDashboard(res.data.data);
    } catch {
      const [species, chemicals, equipment, transactions, overdue] =
        await Promise.all([
          api
            .get<PaginatedResponse<unknown>>("/plant-species", {
              params: { per_page: 1 },
            })
            .then((response) => response.data),
          api
            .get<PaginatedResponse<unknown>>("/chemicals", {
              params: { per_page: 1 },
            })
            .then((response) => response.data),
          api
            .get<PaginatedResponse<unknown>>("/equipment", {
              params: { per_page: 1 },
            })
            .then((response) => response.data),
          api
            .get<PaginatedResponse<TransactionApi>>("/transactions", {
              params: { recent: 1, page: 1 },
            })
            .then((response) => response.data),
          api
            .get<PaginatedResponse<BorrowRecordApi>>(
              "/borrow-records/overdue",
              {
                params: { per_page: 1 },
              },
            )
            .then((response) => response.data)
            .catch(() => ({ meta: { total: 0 }, data: [] })),
        ]);

      return {
        plant_species_count: species.meta.total,
        plant_samples_count: 0,
        samples_by_status: {},
        plant_stocks_count: 0,
        stocks_by_status: {},
        chemicals_count: chemicals.meta.total,
        chemicals_expired: 0,
        chemicals_expiring_soon: 0,
        chemicals_low_stock: 0,
        equipment_count: equipment.meta.total,
        equipment_by_status: {},
        overdue_borrows_count: overdue.meta.total,
        recent_transactions: transactions.data,
      };
    }
  },
};

// ── React Query Hook ──────────────────────────────────────────────────────
export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardService.getData(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
