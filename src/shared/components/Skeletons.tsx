import { cn } from "@/shared/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton block — shimmers while loading.
 */
export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("skeleton", className)} />
);

/**
 * Card skeleton — mimics a stat card while loading.
 */
export const CardSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);

/**
 * Table skeleton — mimics a data table while loading.
 */
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  className,
}: SkeletonProps & { rows?: number; columns?: number }) => (
  <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
    {/* Header */}
    <div className="flex gap-4 p-4 border-b bg-muted/30">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`h-${i}`} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={`r-${r}`} className="flex gap-4 p-4 border-b last:border-b-0">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton
            key={`r-${r}-c-${c}`}
            className={cn("h-4 flex-1", c === 0 && "max-w-[180px]")}
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Dashboard skeleton — mimics a full dashboard grid while loading.
 */
export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6 stagger-children">
    {/* KPI Row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={`kpi-${i}`} />
      ))}
    </div>
    {/* Chart Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
    {/* Table */}
    <TableSkeleton rows={5} columns={5} />
  </div>
);

/**
 * List item skeleton — for sidebar/list views.
 */
export const ListSkeleton = ({
  count = 5,
  className,
}: SkeletonProps & { count?: number }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Profile/detail page skeleton.
 */
export const DetailSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Header */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    {/* Info grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2 p-4 rounded-lg border">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  </div>
);
