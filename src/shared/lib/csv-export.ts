/* ═══════════════════════════════════════════════════════════════════════════
 * csv-export — Simple CSV export utility for list pages.
 *
 * Addresses: MF-001 (No export functionality)
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Export an array of objects as a CSV file download.
 *
 * @param items  Array of flat objects
 * @param filename  Downloaded file name (without .csv)
 * @param columns  Optional column config. If omitted, uses all keys from first item.
 */
export function exportToCsv<T extends Record<string, unknown>>(
  items: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[],
): void {
  if (items.length === 0) return;

  const cols =
    columns ??
    Object.keys(items[0]).map((k) => ({
      key: k as keyof T,
      label: k as string,
    }));

  const header = cols.map((c) => escapeCell(c.label)).join(",");
  const rows = items.map((item) =>
    cols.map((c) => escapeCell(String(item[c.key] ?? ""))).join(","),
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

function escapeCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
