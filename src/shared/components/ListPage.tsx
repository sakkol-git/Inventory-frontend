/* ═══════════════════════════════════════════════════════════════════════════
 * ListPage — Composed inventory-list shell.
 *
 * Encapsulates: AppLayout → PageHeader → QuickStats → SearchFilter →
 *   ViewToggle → Loading / Error / Empty → Grid | Table → PaginationBar.
 *
 * Each entity page passes its concrete Grid/Table via render props and
 * slots any custom filters, alerts, or dialogs as ReactNode children.
 *
 * Addresses: UI Architecture — P2.7  (eliminates ~50 lines per page)
 * ═══════════════════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import AppLayout from "@/core/layouts/AppLayout";
import EmptyState from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";
import PageHeader from "@/shared/components/PageHeader";
import type { UsePaginationOptions } from "@/shared/components/Pagination";
import { PaginationBar, usePagination } from "@/shared/components/Pagination";
import { QuickStats, type Stat } from "@/shared/components/QuickStats";
import SearchFilter from "@/shared/components/SearchFilter";
import { ViewToggle } from "@/shared/components/ViewToggle";
import { Plus } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ListPageProps<T> {
  /* ── Header ─────────────────────────────────────────── */
  icon: LucideIcon;
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;

  /* ── Stats ──────────────────────────────────────────── */
  stats: Stat[];

  /* ── Search + View ──────────────────────────────────── */
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (m: "grid" | "list") => void;

  /* ── Data ───────────────────────────────────────────── */
  items: T[];
  isLoading?: boolean;
  isError?: boolean;
  paginationOptions?: UsePaginationOptions;

  /* ── Empty State ────────────────────────────────────── */
  emptyTitle: string;
  emptyDescription: string;

  /* ── Render Props ───────────────────────────────────── */
  renderGrid: (items: T[]) => ReactNode;
  renderTable: (items: T[]) => ReactNode;

  /* ── Slots ──────────────────────────────────────────── */
  /** Extra filter controls rendered inside SearchFilter */
  filterSlot?: ReactNode;
  /** Alert banner rendered between header and stats */
  alertSlot?: ReactNode;
  /** Overlay content (dialogs, sheets) rendered at the end */
  children?: ReactNode;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ListPage<T>({
  icon: Icon,
  title,
  description,
  addLabel,
  onAdd,
  stats,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  items,
  isLoading = false,
  isError = false,
  paginationOptions = { defaultPageSize: 20 },
  emptyTitle,
  emptyDescription,
  renderGrid,
  renderTable,
  filterSlot,
  alertSlot,
  children,
}: ListPageProps<T>) {
  const pagination = usePagination(items, paginationOptions);
  const hasResults = items.length > 0;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          icon={Icon}
          title={title}
          description={description}
          actions={
            <Button className="gap-2" onClick={onAdd}>
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          }
        />

        {alertSlot}

        <QuickStats stats={stats} />

        <SearchFilter
          query={searchQuery}
          onQueryChange={onSearchChange}
          placeholder={searchPlaceholder}
        >
          {filterSlot}
          <ViewToggle current={viewMode} onChange={onViewModeChange} />
        </SearchFilter>

        {isLoading && (
          <LoadingState variant="skeleton" rows={6} text="Loading data..." />
        )}

        {isError && !isLoading && (
          <ErrorState
            message="Failed to load data"
            onRetry={() => window.location.reload()}
          />
        )}

        {!isLoading && !isError && !hasResults && (
          <EmptyState
            icon={Icon}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}

        {hasResults &&
          viewMode === "grid" &&
          renderGrid(pagination.paginatedItems)}

        {hasResults &&
          viewMode === "list" &&
          renderTable(pagination.paginatedItems)}

        <PaginationBar
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageChange={pagination.goToPage}
          onPageSizeChange={pagination.changePageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onFirst={pagination.firstPage}
          onLast={pagination.lastPage}
          onNext={pagination.nextPage}
          onPrev={pagination.prevPage}
        />
      </div>

      {children}
    </AppLayout>
  );
}
