/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ExportButton — Export table data to CSV/JSON.
 *
 * Phase 19.2 — Export/Download Features.
 *
 * Usage:
 *   <ExportButton
 *     data={items}
 *     filename="plant-samples"
 *     columns={[
 *       { key: "name", label: "Name" },
 *       { key: "code", label: "Sample Code" },
 *       { key: "status", label: "Status" },
 *     ]}
 *   />
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

interface ExportColumn {
  key: string;
  label: string;
  /** Optional value getter for nested properties */
  getValue?: (row: Record<string, unknown>) => string | number;
}

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename: string;
  columns: ExportColumn[];
  className?: string;
}

function getCellValue(row: Record<string, unknown>, col: ExportColumn): string {
  if (col.getValue) {
    return String(col.getValue(row) ?? "");
  }
  const keys = col.key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let val: any = row;
  for (const k of keys) {
    val = val?.[k];
  }
  return val == null ? "" : String(val);
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
) {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = getCellValue(row, col);
        // Escape double quotes in CSV
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  const csv = [header, ...rows].join("\n");
  downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

function exportJSON(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
) {
  const mapped = data.map((row) => {
    const obj: Record<string, string | number> = {};
    for (const col of columns) {
      obj[col.label] = getCellValue(row, col);
    }
    return obj;
  });
  const json = JSON.stringify(mapped, null, 2);
  downloadBlob(json, `${filename}.json`, "application/json");
}

export function ExportButton({
  data,
  filename,
  columns,
  className,
}: ExportButtonProps) {
  if (!data.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="h-4 w-4 mr-1.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportCSV(data, columns, filename)}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportJSON(data, columns, filename)}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()}>
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
