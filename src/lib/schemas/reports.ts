/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Report API Response Schemas
 *
 * Closes AUDIT #4 — Type safety violations in report pages (any casts)
 *
 * Zod schemas for runtime validation of backend API response shapes.
 * Replaces `data as any` patterns with type-safe `.parse()` calls.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { z } from "zod";

// ── Base entities ─────────────────────────────────────────────────────────

const chemicalSchema = z
  .object({
    id: z.number(),
    common_name: z.string().nullable(),
    name: z.string().optional(),
    // ... other fields as needed
  })
  .passthrough(); // Allow extra fields from backend

const batchSchema = z
  .object({
    id: z.number(),
    batch_number: z.string().nullable(),
    chemical: chemicalSchema.optional(),
    expiry_date: z.string().nullable(),
    // ... other fields as needed
  })
  .passthrough();

const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    // ... other fields as needed
  })
  .passthrough();

// ── Report schemas ────────────────────────────────────────────────────────

/**
 * ExpiredItemsReport response schema
 *
 * Replaces: `const raw = data as any; const expiredChemicals: any[] = raw?.data?.expired_chemicals ?? [];`
 */
export const expiredItemsReportSchema = z.object({
  data: z.object({
    expired_chemicals: z.array(chemicalSchema).default([]),
    expired_batches: z.array(batchSchema).default([]),
    expiring_soon_batches: z.array(batchSchema).default([]),
  }),
});

export type ExpiredItemsReport = z.infer<typeof expiredItemsReportSchema>;

/**
 * UserActivityReport response schema
 *
 * Replaces: `const rows: any[] = (data as any)?.data?.users ?? [];`
 */
export const userActivityReportSchema = z.object({
  data: z.object({
    users: z.array(userSchema).default([]),
  }),
});

export type UserActivityReport = z.infer<typeof userActivityReportSchema>;

const usageRowSchema = z
  .object({
    chemical: z.union([
      z.string(),
      z.object({ common_name: z.string().nullable() }).passthrough(),
    ]).optional(),
    total_used: z.union([z.number(), z.string()]).optional(),
    unit: z.string().optional(),
    usage_count: z.number().optional(),
  })
  .passthrough();

/**
 * ChemicalUsageReport response schema
 *
 * Replaces: `const rows: any[] = Object.values(raw?.data?.usage ?? raw?.usage ?? {});`
 */
export const chemicalUsageReportSchema = z.object({
  data: z
    .object({
      usage: z.record(usageRowSchema).default({}),
    })
    .or(
      z.object({
        usage: z.record(usageRowSchema),
      }),
    ),
});

export type ChemicalUsageReport = z.infer<typeof chemicalUsageReportSchema>;

/**
 * BorrowedItemsReport response schema
 *
 * Replaces: `const raw = data as any; const items: any[] = ...`
 */
export const borrowedItemsReportSchema = z.object({
  data: z
    .object({
      summary: z.object({
        records: z
          .array(
            z
              .object({
                id: z.number().optional(),
                status: z.string(),
                user: z.union([z.string(), z.object({ name: z.string() }).passthrough()]).optional(),
                borrowable_type: z.string().optional(),
                borrowable_id: z.union([z.number(), z.string()]).optional(),
                quantity: z.number().optional(),
                due_at: z.string().nullable().optional(),
              })
              .passthrough(),
          )
          .default([]),
      }),
    })
    .passthrough(),
});

export type BorrowedItemsReport = z.infer<typeof borrowedItemsReportSchema>;

/**
 * InventoryReport response schema (generic paginated inventory)
 */
export const inventoryReportSchema = z.object({
  data: z
    .array(
      z
        .object({
          id: z.number(),
          name: z.string().optional(),
          quantity: z.number().default(0),
          // ... other fields
        })
        .passthrough(),
    )
    .default([]),
  pagination: z
    .object({
      total: z.number(),
      per_page: z.number(),
      current_page: z.number(),
    })
    .optional(),
});

export type InventoryReport = z.infer<typeof inventoryReportSchema>;
