/* ═══════════════════════════════════════════════════════════════════════════
 * useTransactionsView — All state + logic for the Transactions listing page.
 *
 * Read-only module — no create/update/delete.
 * Connects to Laravel backend via React Query + transactionService.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useTransactionList } from "@/features/inventory/services/transactionService";
import { formatEnumLabel, TRANSACTION_ACTIONS } from "@/shared/types/enums";
import type { TransactionApi } from "@/features/inventory/types";
import {
    ArrowDown,
    ArrowLeftRight,
    ArrowUp,
    RotateCcw,
    type LucideIcon,
} from "lucide-react";
import { useState } from "react";

// ─── Re-exports for the component ──────────────────────────────────────────

export { formatEnumLabel, TRANSACTION_ACTIONS };

// ─── Types ─────────────────────────────────────────────────────────────────

export type TransactionItem = TransactionApi;

// ─── Helpers ───────────────────────────────────────────────────────────────

export const actionIcon = (action: string): LucideIcon | null => {
  switch (action) {
    case "added":
      return ArrowUp;
    case "consumed":
    case "disposed":
    case "harvested":
      return ArrowDown;
    case "returned":
      return RotateCcw;
    case "borrowed":
      return ArrowLeftRight;
    default:
      return null;
  }
};

export const actionStyle = (action: string): string => {
  switch (action) {
    case "added":
    case "returned":
      return "text-primary bg-muted";
    case "consumed":
    case "disposed":
    case "harvested":
      return "text-warning bg-warning/10";
    case "updated":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export const quantityStyle = (quantity: string | null): string => {
  if (!quantity) return "text-muted-foreground";
  if (quantity.startsWith("+") || Number(quantity) > 0)
    return "text-primary font-medium";
  if (quantity.startsWith("-") || Number(quantity) < 0)
    return "text-warning font-medium";
  return "text-muted-foreground";
};

export const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const itemTypeLabel = (type: string): string => {
  return formatEnumLabel(type.replace(/^App\\Models\\/, "").replace(/_/g, " "));
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useTransactionsView() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;
  if (actionFilter !== "all") queryParams.action = actionFilter;

  const {
    data: response,
    isLoading,
    isError,
  } = useTransactionList(queryParams);

  const items: TransactionItem[] = response?.data ?? [];
  const meta = response?.meta;

  return {
    items,
    totalCount: meta?.total ?? items.length,
    searchQuery,
    updateSearchQuery: setSearchQuery,
    actionFilter,
    updateActionFilter: setActionFilter,
    isLoading,
    isError,
    page,
    setPage,
    meta,
  };
}
