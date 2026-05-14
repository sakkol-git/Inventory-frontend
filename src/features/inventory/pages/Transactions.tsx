/* ═══════════════════════════════════════════════════════════════════════════
 * Transactions — Complete audit trail of all inventory movements.
 *
 * All state lives in useTransactionsView().
 * This file is pure declarative JSX — no useState, no business logic.
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── External ──────────────────────────────────────────────────────────────
import { ArrowLeftRight } from "lucide-react";

// ─── Internal Components ───────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
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
import AppLayout from "@/core/layouts/AppLayout";
import EmptyState from "@/shared/components/EmptyState";
import PageHeader from "@/shared/components/PageHeader";
import SearchFilter from "@/shared/components/SearchFilter";
import { cn } from "@/shared/lib/utils";

// ─── Hook & Helpers ────────────────────────────────────────────────────────
import {
    actionIcon,
    actionStyle,
    formatEnumLabel,
    formatTimestamp,
    itemTypeLabel,
    quantityStyle,
    TRANSACTION_ACTIONS,
    useTransactionsView,
    type TransactionItem,
} from "./useTransactionsView";

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

const Transactions = () => {
  const view = useTransactionsView();

  const hasResults = view.items.length > 0;

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={ArrowLeftRight}
          title="Transaction Log"
          description="Complete audit trail of all inventory movements"
        />

        <SearchFilter
          query={view.searchQuery}
          onQueryChange={view.updateSearchQuery}
          placeholder="Search transactions..."
        >
          <ActionFilter
            value={view.actionFilter}
            onChange={view.updateActionFilter}
          />
        </SearchFilter>

        {view.isLoading && (
          <p className="text-sm text-muted-foreground text-center py-12">
            Loading transactions…
          </p>
        )}

        {view.isError && (
          <p className="text-sm text-destructive text-center py-12">
            Failed to load transactions. Please try again.
          </p>
        )}

        {!view.isLoading && !view.isError && !hasResults && (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions found"
            description="Try adjusting your search or action filter."
          />
        )}

        {hasResults && <TransactionTable transactions={view.items} />}

        <footer className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {view.items.length} of {view.totalCount} transactions
          </p>
          {view.meta && view.meta.last_page > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={view.page <= 1}
                onClick={() => view.setPage(view.page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs">
                Page {view.meta.current_page} of {view.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={view.page >= view.meta.last_page}
                onClick={() => view.setPage(view.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </footer>
      </div>
    </AppLayout>
  );
};

export default Transactions;

/* ═══════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Action Filter ─────────────────────────────────────────────────────── */

const ActionFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-40">
      <SelectValue placeholder="All Actions" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Actions</SelectItem>
      {TRANSACTION_ACTIONS.map((a) => (
        <SelectItem key={a} value={a}>
          {formatEnumLabel(a)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/* ─── Table ─────────────────────────────────────────────────────────────── */

const TransactionTable = ({
  transactions,
}: {
  transactions: TransactionItem[];
}) => (
  <div className="rounded-xl overflow-hidden border border-border/40">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-medium w-44">Timestamp</TableHead>
          <TableHead className="font-medium">User</TableHead>
          <TableHead className="font-medium">Action</TableHead>
          <TableHead className="font-medium">Item Type</TableHead>
          <TableHead className="font-medium text-right">Quantity</TableHead>
          <TableHead className="font-medium">Note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
      </TableBody>
    </Table>
  </div>
);

const TransactionRow = ({
  transaction: tx,
}: {
  transaction: TransactionItem;
}) => (
  <TableRow className="transition-colors">
    <TableCell className="font-mono text-sm text-muted-foreground">
      {formatTimestamp(tx.created_at)}
    </TableCell>
    <TableCell className="text-foreground">
      {tx.user?.name ?? "System"}
    </TableCell>
    <TableCell>
      <ActionBadge action={tx.action} />
    </TableCell>
    <TableCell className="text-sm text-muted-foreground">
      {itemTypeLabel(tx.item.type)}
    </TableCell>
    <TableCell
      className={cn("text-right tabular-nums", quantityStyle(tx.quantity))}
    >
      {tx.quantity ?? "—"}
    </TableCell>
    <TableCell
      className="max-w-xs truncate text-sm text-muted-foreground"
      title={tx.note ?? ""}
    >
      {tx.note || "—"}
    </TableCell>
  </TableRow>
);

const ActionBadge = ({ action }: { action: string }) => {
  const Icon = actionIcon(action);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-0.5 text-xs font-medium border rounded-lg",
        actionStyle(action),
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {formatEnumLabel(action)}
    </span>
  );
};
