// Report Service — all report queries and CSV export helpers.
//
// WHY useReport() EXISTS
// Every simple report endpoint shares the same queryFn shape:
//   api.get("/reports/{type}", { params }) → return data
// rather than duplicate that pattern four times, a private hook factory
// captures it once. Inventory is a special case (typed + paginated).

import { api } from "@/core/api/api";
import { useQuery } from "@tanstack/react-query";

export type ReportType =
  | "inventory"
  | "chemical-usage"
  | "expired-items"
  | "borrowed-items"
  | "user-activity";

// ── Private helper — DRYs up four identical useQuery blocks ───────────────

function useReport<T = unknown>(
  reportType: string,
  params?: Record<string, string | undefined>,
) {
  return useQuery<T>({
    queryKey: ["reports", reportType, params],
    queryFn: async () => {
      const { data } = await api.get(`/reports/${reportType}`, { params });
      return data as T;
    },
  });
}

// ── Inventory report — paginated, typed, multi-section ────────────────────

export interface InventoryMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface InventoryReportResult {
  data: Record<string, unknown>[];
  section: string;
  meta: InventoryMeta;
}

export const useInventoryReport = (params?: {
  section?: string;
  page?: number;
  per_page?: number;
  search?: string;
}) =>
  useQuery<InventoryReportResult>({
    queryKey: ["reports", "inventory", params],
    queryFn: async () => {
      const { data } = await api.get("/reports/inventory", { params });
      return data as InventoryReportResult;
    },
  });

// ── Simple report hooks — all powered by useReport ────────────────────────

export const useChemicalUsageReport = (params?: {
  from?: string;
  to?: string;
}) => useReport("chemical-usage", params);

export const useExpiredItemsReport = () => useReport("expired-items");

export const useBorrowedItemsReport = () => useReport("borrowed-items");

export const useUserActivityReport = (params?: {
  from?: string;
  to?: string;
}) => useReport("user-activity", params);

// ── CSV export — split into focused single-responsibility helpers ──────────

/** Extracts filename from a Content-Disposition header value. */
function extractFilenameFromHeader(disposition: string): string | null {
  const match = disposition.match(
    /filename[^;=\n]*=(?:(['"])([^'"]*)\1|([^;\n]*))/,
  );
  return match ? match[2] || match[3] || null : null;
}

/** Triggers a browser file-save dialog for the given Blob. */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/** Fetches a report as CSV and saves it to disk. */
export const exportReportCsv = async (
  type: ReportType,
  filename?: string,
  params?: Record<string, string>,
): Promise<void> => {
  const { data, headers } = await api.get(`/reports/${type}/export`, {
    params: { ...params, format: "csv" },
    responseType: "blob",
  });

  const disposition = headers["content-disposition"] as string | undefined;
  const downloadName =
    (disposition && extractFilenameFromHeader(disposition)) ??
    filename ??
    `${type}-report.csv`;

  triggerBlobDownload(data as Blob, downloadName);
};
