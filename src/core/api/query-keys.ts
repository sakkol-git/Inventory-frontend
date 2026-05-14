/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUERY KEYS — Centralized re-export of all TanStack Query key factories.
 *
 * Each entity hook defines its own key factory. This module re-exports
 * them all from a single location for cross-entity invalidation and
 * prefetching scenarios (e.g., borrow returns invalidate both borrow +
 * equipment queries).
 *
 * Usage:
 *   import { queryKeys } from '@/core/api/query-keys';
 *
 *   queryClient.invalidateQueries({ queryKey: queryKeys.chemicals.all });
 *   queryClient.prefetchQuery({ queryKey: queryKeys.equipment.list({}) });
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ── Inventory ─────────────────────────────────────────────────────────────
export { borrowKeys } from "@/features/inventory/services/borrowRecordService";
export { chemicalKeys } from "@/features/inventory/services/chemicalService";
export { dashboardKeys } from "@/features/inventory/services/dashboardService";
export { equipmentKeys } from "@/features/inventory/services/equipmentService";
export { sampleKeys } from "@/features/inventory/services/plantSampleService";
export { speciesKeys } from "@/features/inventory/services/plantSpeciesService";
export { stockKeys } from "@/features/inventory/services/plantStockService";
export { varietyKeys } from "@/features/inventory/services/plantVarietyService";
export { transactionKeys } from "@/features/inventory/services/transactionService";
export { userKeys } from "@/features/inventory/services/userService";

/**
 * Convenience namespace — an alternative grouped import.
 *
 * Usage:
 *   import { queryKeys } from '@/core/api/query-keys';
 *   queryKeys.chemicals.all  // ['chemicals']
 */
import { borrowKeys } from "@/features/inventory/services/borrowRecordService";
import { chemicalKeys } from "@/features/inventory/services/chemicalService";
import { dashboardKeys } from "@/features/inventory/services/dashboardService";
import { equipmentKeys } from "@/features/inventory/services/equipmentService";
import { sampleKeys } from "@/features/inventory/services/plantSampleService";
import { speciesKeys } from "@/features/inventory/services/plantSpeciesService";
import { stockKeys } from "@/features/inventory/services/plantStockService";
import { varietyKeys } from "@/features/inventory/services/plantVarietyService";
import { transactionKeys } from "@/features/inventory/services/transactionService";
import { userKeys } from "@/features/inventory/services/userService";

export const queryKeys = {
  borrows: borrowKeys,
  chemicals: chemicalKeys,
  dashboard: dashboardKeys,
  equipment: equipmentKeys,
  samples: sampleKeys,
  species: speciesKeys,
  stocks: stockKeys,
  transactions: transactionKeys,
  users: userKeys,
  varieties: varietyKeys,
} as const;
