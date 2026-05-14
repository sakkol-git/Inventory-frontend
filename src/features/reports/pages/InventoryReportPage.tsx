/* ═══════════════════════════════════════════════════════════════════════════
 * Inventory Report Page
 * Full table view of all inventory items across sections with search,
 * sort, pagination, danger/low-stock highlighting and CSV export.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/core/auth/PermissionGate";
import AppLayout from "@/core/layouts/AppLayout";
import {
    exportReportCsv,
    useInventoryReport,
} from "@/features/reports/services/reportService";
import PageHeader from "@/shared/components/PageHeader";
import { cn } from "@/shared/lib/utils";
import {
    AlertTriangle,
    BarChart3,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronsUpDown,
    Download,
    Search,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────
type SortDir = "asc" | "desc" | null;
interface SortState {
  key: string;
  dir: SortDir;
}

const SECTIONS = [
  { value: "chemicals", label: "Chemicals" },
  { value: "chemical_batches", label: "Chemical Batches" },
  { value: "equipment", label: "Equipment" },
  { value: "plant_species", label: "Plant Species" },
  { value: "plant_varieties", label: "Plant Varieties" },
  { value: "plant_samples", label: "Plant Samples" },
  { value: "plant_stocks", label: "Plant Stocks" },
];

const LOW_STOCK_THRESHOLD = 50;

// ── Column definitions per section ────────────────────────────────────────
interface ColDef {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: Record<string, unknown>) => string;
}

const nest = (item: Record<string, unknown>, path: string): string => {
  const val = path
    .split(".")
    .reduce<unknown>(
      (acc, k) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[k]
          : undefined,
      item,
    );
  return val != null ? String(val) : "—";
};

const COLUMNS: Record<string, ColDef[]> = {
  chemicals: [
    { key: "common_name", label: "Name", sortable: true },
    { key: "chemical_code", label: "Code" },
    { key: "category", label: "Category", sortable: true },
    { key: "quantity", label: "Qty", sortable: true },
    { key: "storage_location", label: "Storage" },
    { key: "expiry_date", label: "Expiry", sortable: true },
    { key: "danger_level", label: "Danger", sortable: true },
    { key: "batches_count", label: "Batches", sortable: true },
  ],
  chemical_batches: [
    { key: "batch_number", label: "Batch #", sortable: true },
    {
      key: "_chemical",
      label: "Chemical",
      render: (r) => nest(r, "chemical.common_name"),
    },
    { key: "quantity", label: "Qty", sortable: true },
    { key: "unit", label: "Unit" },
    { key: "expiry_date", label: "Expiry", sortable: true },
    { key: "supplier_name", label: "Supplier", sortable: true },
  ],
  equipment: [
    { key: "equipment_name", label: "Name", sortable: true },
    { key: "equipment_code", label: "Code" },
    { key: "category", label: "Category", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "location", label: "Location" },
    { key: "condition", label: "Condition", sortable: true },
  ],
  plant_species: [
    { key: "common_name", label: "Common Name", sortable: true },
    { key: "scientific_name", label: "Scientific", sortable: true },
    { key: "family", label: "Family", sortable: true },
    { key: "growth_type", label: "Growth Type", sortable: true },
    { key: "native_region", label: "Region" },
    { key: "varieties_count", label: "Varieties", sortable: true },
  ],
  plant_varieties: [
    { key: "name", label: "Variety Name", sortable: true },
    { key: "variety_code", label: "Code" },
    { key: "description", label: "Description" },
    { key: "samples_count", label: "Samples", sortable: true },
  ],
  plant_samples: [
    { key: "sample_name", label: "Name", sortable: true },
    { key: "sample_code", label: "Code" },
    { key: "owner_name", label: "Owner", sortable: true },
    { key: "quantity", label: "Qty", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "lab_location", label: "Location" },
  ],
  plant_stocks: [
    {
      key: "_species",
      label: "Species",
      render: (r) => nest(r, "species.common_name"),
    },
    {
      key: "_variety",
      label: "Variety",
      render: (r) => nest(r, "variety.name"),
    },
    { key: "quantity", label: "Qty", sortable: true },
    { key: "reserved_quantity", label: "Reserved", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────
const isLowStock = (item: Record<string, unknown>) => {
  const qty = Number(item.quantity);
  return !isNaN(qty) && qty > 0 && qty < LOW_STOCK_THRESHOLD;
};

const DangerBadge = ({ level }: { level: string }) => {
  const l = level.toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        l === "high" && "border-red-400 text-red-600 dark:text-red-400",
        l === "medium" && "border-amber-400 text-amber-600 dark:text-amber-400",
        l === "low" && "border-green-400 text-green-600 dark:text-green-400",
      )}
    >
      {l === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
      {level}
    </Badge>
  );
};

const SortIcon = ({ col, sort }: { col: string; sort: SortState }) => {
  if (sort.key !== col)
    return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  return sort.dir === "asc" ? (
    <ChevronUp className="h-3 w-3" />
  ) : (
    <ChevronDown className="h-3 w-3" />
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const InventoryReportPage = () => {
  const [section, setSection] = useState("chemicals");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "", dir: null });
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading } = useInventoryReport({
    section,
    page,
    per_page: 25,
  });

  // Client-side search + sort on top of the current page
  const filtered = useMemo(() => {
    const items = data?.data ?? [];
    const q = search.trim().toLowerCase();
    let rows = q
      ? items.filter((r) =>
          Object.values(r).some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(q),
          ),
        )
      : items;

    if (sort.key && sort.dir) {
      rows = [...rows].sort((a, b) => {
        const av = String(a[sort.key] ?? "").toLowerCase();
        const bv = String(b[sort.key] ?? "").toLowerCase();
        const n = av < bv ? -1 : av > bv ? 1 : 0;
        return sort.dir === "asc" ? n : -n;
      });
    }
    return rows;
  }, [data?.data, search, sort]);

  const meta = data?.meta;
  const cols = COLUMNS[section] ?? COLUMNS.chemicals;

  const toggleSort = (key: string) =>
    setSort((prev) => ({
      key,
      dir:
        prev.key === key
          ? prev.dir === "asc"
            ? "desc"
            : prev.dir === "desc"
              ? null
              : "asc"
          : "asc",
    }));

  const handleSectionChange = (v: string) => {
    setSection(v);
    setPage(1);
    setSearch("");
    setSort({ key: "", dir: null });
  };

  const handleExport = async () => {
    try {
      await exportReportCsv("inventory", `inventory-${section}.csv`, {
        section,
      });
      toast.success("CSV export started");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Inventory Report"
          description="Paginated view of lab inventory by section"
          icon={BarChart3}
          actions={
            <PermissionGate permission="reports.export">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </PermissionGate>
          }
        />

        {/* ── Toolbar ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={section} onValueChange={handleSectionChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${section}…`}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-200 dark:bg-red-900 shrink-0" />
              High danger
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-950 shrink-0" />
              Low stock
            </span>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────── */}
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {cols.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      col.sortable &&
                        "cursor-pointer select-none hover:text-foreground",
                    )}
                    onClick={() => col.sortable && toggleSort(col.key)}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      {col.label}
                      {col.sortable && <SortIcon col={col.key} sort={sort} />}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={cols.length + 1}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={cols.length + 1}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, i) => {
                  const danger = String(item.danger_level ?? "").toLowerCase();
                  const rowCn = cn(
                    danger === "high" && "bg-red-50 dark:bg-red-950/40",
                    danger === "medium" &&
                      !isLowStock(item) &&
                      "bg-amber-50 dark:bg-amber-950/30",
                    isLowStock(item) &&
                      danger !== "high" &&
                      "bg-yellow-50 dark:bg-yellow-950/30",
                  );

                  return (
                    <TableRow
                      key={i}
                      className={cn(rowCn, "cursor-pointer")}
                      onClick={() => setDetail(item)}
                    >
                      {cols.map((col) => (
                        <TableCell key={col.key}>
                          {col.render ? (
                            col.render(item)
                          ) : col.key === "danger_level" && item[col.key] ? (
                            <DangerBadge level={String(item[col.key])} />
                          ) : col.key === "quantity" ||
                            col.key === "reserved_quantity" ? (
                            <span
                              className={cn(
                                isLowStock(item) &&
                                  col.key === "quantity" &&
                                  "font-semibold text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {String(item[col.key] ?? "—")}
                              {isLowStock(item) && col.key === "quantity" && (
                                <span className="ml-1 text-xs">(low)</span>
                              )}
                            </span>
                          ) : col.key === "expiry_date" ? (
                            item[col.key] ? (
                              <span
                                className={cn(
                                  new Date(String(item[col.key])) <
                                    new Date() && "text-red-600 font-medium",
                                )}
                              >
                                {String(item[col.key]).slice(0, 10)}
                              </span>
                            ) : (
                              "—"
                            )
                          ) : col.key === "status" ? (
                            <Badge variant="outline" className="capitalize">
                              {String(item[col.key] ?? "—")}
                            </Badge>
                          ) : (
                            String(item[col.key] ?? "—")
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-muted-foreground text-xs text-right pr-3">
                        ›
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ───────────────────────────────────────────── */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {meta.from ?? "–"}–{meta.to ?? "–"} of {meta.total} items
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs">
                Page {meta.current_page} / {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {String(detail?.common_name ?? detail?.name ?? "Item Detail")}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {Object.entries(detail).map(([k, v]) =>
                v !== null && v !== undefined ? (
                  <div key={k} className="contents">
                    <dt className="font-medium text-muted-foreground capitalize">
                      {k.replace(/_/g, " ")}
                    </dt>
                    <dd className="break-words">
                      {typeof v === "object"
                        ? JSON.stringify(v)
                        : String(v) || "—"}
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default InventoryReportPage;
