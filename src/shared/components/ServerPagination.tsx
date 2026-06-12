import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface ServerPaginationProps {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  } | null | undefined;
  onPageChange: (page: number) => void;
}

export function ServerPagination({
  meta,
  onPageChange,
}: ServerPaginationProps) {
  if (!meta || meta.total <= meta.per_page) return null;

  const { current_page, last_page, total, from, to } = meta;

  // Generate page numbers
  const pages: (number | "...")[] = [];
  if (last_page <= 7) {
    for (let i = 1; i <= last_page; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (current_page > 3) pages.push("...");

    const start = Math.max(2, current_page - 1);
    const end = Math.min(last_page - 1, current_page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current_page < last_page - 2) pages.push("...");
    pages.push(last_page);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t mt-4 border-border/50">
      <span className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from ?? "-"}</span> to{" "}
        <span className="font-medium text-foreground">{to ?? "-"}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> results
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={current_page === 1}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 text-center text-sm text-muted-foreground px-1"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={current_page === p ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 text-xs ${current_page !== p ? "text-muted-foreground hover:text-foreground" : ""}`}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(last_page)}
          disabled={current_page === last_page}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
