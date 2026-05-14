/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ListPage — Higher-order composition template for entity listing pages.
 *
 * Eliminates 200+ lines of repeated boilerplate per page by composing:
 *   PageHeader → QuickStats → SearchFilter → AsyncContent → Grid|Table → Pagination
 *
 * Most inventory list pages become <50 lines when using ListPage.
 *
 * Usage:
 *   <ListPage
 *     header={{ icon: FlaskConical, title: "Chemicals", description: "..." }}
 *     stats={[{ label: "Total", value: 120, color: "primary" }]}
 *     search={{ query, onQueryChange, placeholder: "Search chemicals..." }}
 *     viewToggle={{ current: viewMode, onChange: setViewMode }}
 *     async={{ isLoading, isError, isEmpty: items.length === 0, onRetry: refetch }}
 *     pagination={paginationProps}
 *     actions={<Button onClick={openForm}><Plus /> Add Chemical</Button>}
 *     filterChildren={<StatusSelect ... />}
 *     skeleton={<EntityGridSkeleton />}
 *     emptyState={<EmptyState ... />}
 *   >
 *     {viewMode === 'grid' ? <EntityGrid ... /> : <DataTable ... />}
 *   </ListPage>
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { AsyncContent } from "@/shared/components/composed/AsyncContent";
import { PageShell } from "@/shared/components/composed/PageShell";
import PageHeader from "@/shared/components/PageHeader";
import { PaginationBar } from "@/shared/components/Pagination";
import { QuickStats, type Stat } from "@/shared/components/QuickStats";
import SearchFilter from "@/shared/components/SearchFilter";
import { ViewToggle, type ViewMode } from "@/shared/components/ViewToggle";
import type { LucideIcon } from "lucide-react";
import { memo, type ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ListPageHeaderConfig {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

interface ListPageSearchConfig {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  entityName?: string;
}

interface ListPageAsyncConfig {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

interface ListPageViewToggleConfig {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}

interface ListPagePaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions: number[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFirst: () => void;
  onLast: () => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ListPageProps {
  /** Page header configuration */
  header: ListPageHeaderConfig;
  /** Quick stats row (optional) */
  stats?: Stat[];
  /** Search bar configuration */
  search: ListPageSearchConfig;
  /** View toggle configuration (optional — for pages with grid/list) */
  viewToggle?: ListPageViewToggleConfig;
  /** Async state configuration */
  async: ListPageAsyncConfig;
  /** Pagination configuration (optional) */
  pagination?: ListPagePaginationConfig;
  /** Action buttons for header right side */
  actions?: ReactNode;
  /** Additional filter controls (slotted into SearchFilter children) */
  filterChildren?: ReactNode;
  /** Skeleton to show during loading */
  skeleton?: ReactNode;
  /** Empty state to show when no data and not loading */
  emptyState?: ReactNode;
  /** Data content — grid or table */
  children: ReactNode;
  /** aria-label for the page */
  "aria-label"?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

function ListPageInner({
  header,
  stats,
  search,
  viewToggle,
  async: asyncConfig,
  pagination,
  actions,
  filterChildren,
  skeleton,
  emptyState,
  children,
  "aria-label": ariaLabel,
}: ListPageProps) {
  return (
    <PageShell aria-label={ariaLabel ?? header.title}>
      <PageHeader
        icon={header.icon}
        title={header.title}
        description={header.description}
        actions={actions}
      />

      {stats && stats.length > 0 && <QuickStats stats={stats} />}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <SearchFilter
            query={search.query}
            onQueryChange={search.onQueryChange}
            placeholder={search.placeholder}
            entityName={search.entityName}
          >
            {filterChildren}
          </SearchFilter>
        </div>
        {viewToggle && (
          <ViewToggle
            current={viewToggle.current}
            onChange={viewToggle.onChange}
          />
        )}
      </div>

      <AsyncContent
        isLoading={asyncConfig.isLoading}
        isError={asyncConfig.isError}
        isEmpty={asyncConfig.isEmpty}
        skeleton={skeleton}
        errorMessage={asyncConfig.errorMessage}
        onRetry={asyncConfig.onRetry}
        emptyFallback={emptyState}
        aria-label={`${header.title} content`}
      >
        {children}
      </AsyncContent>

      {pagination && (
        <PaginationBar
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onFirst={pagination.onFirst}
          onLast={pagination.onLast}
          onNext={pagination.onNext}
          onPrev={pagination.onPrev}
        />
      )}
    </PageShell>
  );
}

export const ListPage = memo(ListPageInner) as typeof ListPageInner;
