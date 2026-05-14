/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DataTable — Generic TanStack Table component with sorting, column
 * visibility, row selection, sticky headers, and density toggle.
 *
 * Phase 4 — Data Tables 2.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    type ColumnDef,
    type ColumnFiltersState,
    type Row,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Columns3,
    RotateCcw,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import EmptyState from "@/shared/components/EmptyState";
import { cn } from "@/shared/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

export type TableDensity = "compact" | "default" | "relaxed";

interface DataTableProps<TData, TValue> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Data array */
  data: TData[];
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Table density */
  density?: TableDensity;
  /** Called when row selection changes */
  onRowSelectionChange?: (rows: Row<TData>[]) => void;
  /** Called when a row is clicked */
  onRowClick?: (row: TData) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Skeleton component for loading */
  skeleton?: React.ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Additional CSS classes */
  className?: string;
  /** Sticky header */
  stickyHeader?: boolean;
  /** aria-label for the table */
  "aria-label"?: string;
}

// ─── Density classes ───────────────────────────────────────────────────────

const DENSITY_CLASSES: Record<TableDensity, { cell: string; header: string }> =
  {
    compact: { cell: "px-3 py-1.5 text-xs", header: "px-3 py-2 text-xs" },
    default: { cell: "px-4 py-3 text-sm", header: "px-4 py-3 text-sm" },
    relaxed: { cell: "px-5 py-4 text-sm", header: "px-5 py-4 text-sm" },
  };

// ─── Component ─────────────────────────────────────────────────────────────

export function DataTable<TData, TValue>({
  columns,
  data,
  enableRowSelection = false,
  enableColumnVisibility = true,
  enableSorting = true,
  density = "default",
  onRowSelectionChange,
  onRowClick,
  isLoading,
  skeleton,
  emptyMessage = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  className,
  stickyHeader = true,
  "aria-label": ariaLabel,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const allColumns = enableRowSelection
    ? [
        {
          id: "select",
          header: ({
            table,
          }: {
            table: ReturnType<typeof useReactTable<TData>>;
          }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({ row }: { row: Row<TData> }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
          size: 40,
        } as ColumnDef<TData, TValue>,
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (onRowSelectionChange) {
        const newSelection =
          typeof updater === "function" ? updater(rowSelection) : updater;
        setRowSelection(newSelection);
        // Defer to next tick
        setTimeout(() => {
          const selected = table.getFilteredSelectedRowModel().rows;
          onRowSelectionChange(selected);
        }, 0);
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const densityClasses = DENSITY_CLASSES[density];
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const handleResetColumns = useCallback(() => {
    setColumnVisibility({});
    setSorting([]);
  }, []);

  if (isLoading && skeleton) {
    return <>{skeleton}</>;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {enableRowSelection && selectedCount > 0 && (
            <span className="text-caption">
              {selectedCount} of {table.getFilteredRowModel().rows.length}{" "}
              selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                  <Columns3 className="h-3.5 w-3.5" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </DropdownMenuCheckboxItem>
                  ))}
                <DropdownMenuSeparator />
                <button
                  onClick={handleResetColumns}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to default
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-x-auto"
        role="region"
        aria-label={ariaLabel ?? "Data table"}
      >
        <Table>
          <TableHeader
            className={cn(stickyHeader && "sticky top-0 z-10 bg-card")}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      densityClasses.header,
                      "font-medium text-muted-foreground",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none",
                    )}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() && (
                        <span className="ml-1">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    "transition-colors",
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={densityClasses.cell}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  <EmptyState
                    title={emptyMessage}
                    description={emptyDescription}
                    className="py-8"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Re-export column helper type ──────────────────────────────────────────

export type { ColumnDef, Row, SortingState };
