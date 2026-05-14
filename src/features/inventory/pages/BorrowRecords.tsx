/* ═══════════════════════════════════════════════════════════════════════════
 * BorrowRecords — Borrow/Return management page.
 *
 * All state lives in useBorrowRecordsView().
 * This file is pure declarative JSX — no useState, no business logic.
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── External ──────────────────────────────────────────────────────────────
import {
    AlertTriangle,
    ArrowLeftRight,
    CheckCircle,
    Clock,
    Plus,
    RotateCcw,
    XCircle,
} from "lucide-react";

// ─── Internal Components ───────────────────────────────────────────────────
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/core/layouts/AppLayout";
import EmptyState from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";
import PageHeader from "@/shared/components/PageHeader";
import SearchFilter from "@/shared/components/SearchFilter";
import { cn } from "@/shared/lib/utils";

// ─── Hook & Helpers ────────────────────────────────────────────────────────
import {
    BORROW_STATUSES,
    BORROWABLE_TYPES,
    formatDate,
    formatEnumLabel,
    getItemName,
    useBorrowRecordsView,
    type BorrowItem,
    type BorrowTab
} from "./useBorrowRecordsView";

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

const TABS: { id: BorrowTab; label: string; icon: typeof ArrowLeftRight }[] = [
  { id: "all", label: "All Records", icon: ArrowLeftRight },
  { id: "pending", label: "Pending Approval", icon: Clock },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
];

const BorrowRecords = () => {
  const view = useBorrowRecordsView();

  const hasResults = view.items.length > 0;

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={ArrowLeftRight}
          title="Borrow Records"
          description="Track borrowed items, pending approvals, and overdue returns"
          actions={
            <Button className="gap-2" onClick={view.openBorrowForm}>
              <Plus className="h-4 w-4" />
              New Borrow
            </Button>
          }
        />

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => view.setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                view.activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {view.activeTab === "all" && (
          <SearchFilter
            query={view.searchQuery}
            onQueryChange={view.updateSearchQuery}
            placeholder="Search borrow records..."
          >
            <StatusFilter
              value={view.statusFilter}
              onChange={view.updateStatusFilter}
            />
          </SearchFilter>
        )}

        {view.isLoading && (
          <LoadingState
            variant="skeleton"
            rows={6}
            text="Loading borrow records..."
          />
        )}

        {view.isError && !view.isLoading && (
          <ErrorState
            message="Failed to load borrow records"
            onRetry={() => window.location.reload()}
          />
        )}

        {!view.isLoading && !view.isError && !hasResults && (
          <EmptyState
            icon={ArrowLeftRight}
            title={`No ${view.activeTab === "pending" ? "pending" : view.activeTab === "overdue" ? "overdue" : ""} borrow records found`}
            description={
              view.activeTab === "pending"
                ? "No borrow requests are awaiting approval."
                : view.activeTab === "overdue"
                  ? "No overdue borrows — great!"
                  : "No items are currently borrowed."
            }
          />
        )}

        {hasResults && (
          <BorrowTable
            items={view.items}
            activeTab={view.activeTab}
            onReturn={view.openReturnDialog}
            onApprove={view.openApproveDialog}
            onReject={view.openRejectDialog}
          />
        )}

        {view.activeTab === "all" && (
          <footer className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {view.items.length} of {view.totalCount} records
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
        )}
      </div>

      <BorrowFormDialog view={view} />
      <ReturnDialog view={view} />
      <ApproveDialog view={view} />
      <RejectDialog view={view} />
    </AppLayout>
  );
};

export default BorrowRecords;

/* ═══════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Status Filter ─────────────────────────────────────────────────────── */

const StatusFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-40">
      <SelectValue placeholder="All Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      {BORROW_STATUSES.map((s) => (
        <SelectItem key={s} value={s}>
          {formatEnumLabel(s)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/* ─── Table ─────────────────────────────────────────────────────────────── */

const BorrowTable = ({
  items,
  activeTab,
  onReturn,
  onApprove,
  onReject,
}: {
  items: BorrowItem[];
  activeTab: BorrowTab;
  onReturn: (item: BorrowItem) => void;
  onApprove: (item: BorrowItem) => void;
  onReject: (item: BorrowItem) => void;
}) => (
  <div className="rounded-lg overflow-hidden border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-center">Qty</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead>Borrowed</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Returned</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <BorrowRow
            key={item.id}
            item={item}
            activeTab={activeTab}
            onReturn={onReturn}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </TableBody>
    </Table>
  </div>
);

const BorrowRow = ({
  item,
  activeTab,
  onReturn,
  onApprove,
  onReject,
}: {
  item: BorrowItem;
  activeTab: BorrowTab;
  onReturn: (item: BorrowItem) => void;
  onApprove: (item: BorrowItem) => void;
  onReject: (item: BorrowItem) => void;
}) => (
  <TableRow className="transition-colors">
    <TableCell className="font-mono text-xs text-muted-foreground">
      #{item.id}
    </TableCell>
    <TableCell className="text-foreground">
      {item.user?.name ?? "Unknown"}
    </TableCell>
    <TableCell className="max-w-xs truncate" title={getItemName(item.item)}>
      {getItemName(item.item)}
    </TableCell>
    <TableCell className="text-sm text-muted-foreground">
      {formatEnumLabel(item.item.type)}
    </TableCell>
    <TableCell className="text-center tabular-nums">{item.quantity}</TableCell>
    <TableCell className="text-center">
      <Badge
        variant={
          item.is_overdue
            ? "destructive"
            : item.status === "approved"
              ? "default"
              : item.status === "pending"
                ? "secondary"
                : item.status === "returned"
                  ? "success"
                  : "outline"
        }
      >
        {item.is_overdue ? "Overdue" : formatEnumLabel(item.status)}
      </Badge>
    </TableCell>
    <TableCell className="text-sm">{formatDate(item.borrowed_at)}</TableCell>
    <TableCell className="text-sm">{formatDate(item.due_at)}</TableCell>
    <TableCell className="text-sm">{formatDate(item.returned_at)}</TableCell>
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-1">
        {activeTab === "pending" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => onApprove(item)}
              aria-label={`Approve borrow request #${item.id}`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => onReject(item)}
              aria-label={`Reject borrow request #${item.id}`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
          </>
        )}
        {activeTab !== "pending" && item.status === "borrowed" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => onReturn(item)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Return
          </Button>
        )}
      </div>
    </TableCell>
  </TableRow>
);

/* ─── Borrow Form Dialog ────────────────────────────────────────────────── */

const BorrowFormDialog = ({
  view,
}: {
  view: ReturnType<typeof useBorrowRecordsView>;
}) => (
  <Dialog
    open={view.borrowFormOpen}
    onOpenChange={(open) => {
      if (!open) view.closeBorrowForm();
    }}
  >
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>New Borrow Record</DialogTitle>
        <DialogDescription>
          Record a new item borrow. Select the user, item type, and item.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> indicates a required field
        </p>

        <div className="space-y-2">
          <Label htmlFor="borrow-user">User ID *</Label>
          <Input
            id="borrow-user"
            type="number"
            placeholder="Enter user ID"
            value={view.borrowForm.userId}
            onChange={(e) => view.updateBorrowField("userId", e.target.value)}
          />
          {view.borrowFormErrors.userId && (
            <p className="text-xs text-destructive">
              {view.borrowFormErrors.userId}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="borrow-type">Item Type *</Label>
            <Select
              value={view.borrowForm.borrowableType}
              onValueChange={(v) => view.updateBorrowField("borrowableType", v)}
            >
              <SelectTrigger id="borrow-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {BORROWABLE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatEnumLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {view.borrowFormErrors.borrowableType && (
              <p className="text-xs text-destructive">
                {view.borrowFormErrors.borrowableType}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrow-item-id">Item ID *</Label>
            <Input
              id="borrow-item-id"
              type="number"
              placeholder="Enter item ID"
              value={view.borrowForm.borrowableId}
              onChange={(e) =>
                view.updateBorrowField("borrowableId", e.target.value)
              }
            />
            {view.borrowFormErrors.borrowableId && (
              <p className="text-xs text-destructive">
                {view.borrowFormErrors.borrowableId}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="borrow-qty">Quantity *</Label>
            <Input
              id="borrow-qty"
              type="number"
              min="1"
              value={view.borrowForm.quantity}
              onChange={(e) =>
                view.updateBorrowField("quantity", e.target.value)
              }
            />
            {view.borrowFormErrors.quantity && (
              <p className="text-xs text-destructive">
                {view.borrowFormErrors.quantity}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrow-due">Due Date</Label>
            <Input
              id="borrow-due"
              type="date"
              value={view.borrowForm.dueAt}
              onChange={(e) => view.updateBorrowField("dueAt", e.target.value)}
            />
            {view.borrowFormErrors.dueAt && (
              <p className="text-xs text-destructive">
                {view.borrowFormErrors.dueAt}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="borrow-notes">Notes</Label>
          <Textarea
            id="borrow-notes"
            placeholder="Optional notes..."
            value={view.borrowForm.notes}
            onChange={(e) => view.updateBorrowField("notes", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={view.closeBorrowForm}>
          Cancel
        </Button>
        <Button
          onClick={view.submitBorrow}
          disabled={!view.canSubmitBorrow || view.isSubmitting}
        >
          {view.isSubmitting ? "Saving…" : "Record Borrow"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Return Dialog ─────────────────────────────────────────────────────── */

const ReturnDialog = ({
  view,
}: {
  view: ReturnType<typeof useBorrowRecordsView>;
}) => (
  <Dialog
    open={view.returnDialogOpen}
    onOpenChange={(open) => {
      if (!open) view.closeReturnDialog();
    }}
  >
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Return Item</DialogTitle>
        <DialogDescription>
          {view.returningItem && (
            <>
              Confirm return of{" "}
              <strong>{getItemName(view.returningItem.item)}</strong>
              {view.returningItem.user && (
                <> by {view.returningItem.user.name}</>
              )}
              .
            </>
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="return-notes">Notes (optional)</Label>
          <Textarea
            id="return-notes"
            placeholder="e.g., Item returned in good condition"
            value={view.returnNotes}
            onChange={(e) => view.setReturnNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={view.closeReturnDialog}>
          Cancel
        </Button>
        <Button onClick={view.submitReturn} disabled={view.isSubmitting}>
          {view.isSubmitting ? "Processing…" : "Confirm Return"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Approve Dialog ────────────────────────────────────────────────────── */

const ApproveDialog = ({
  view,
}: {
  view: ReturnType<typeof useBorrowRecordsView>;
}) => (
  <Dialog
    open={!!view.approveItem}
    onOpenChange={(open) => {
      if (!open) view.closeApproveDialog();
    }}
  >
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Approve Borrow Request</DialogTitle>
        <DialogDescription>
          {view.approveItem && (
            <>
              Approve borrow of{" "}
              <strong>{getItemName(view.approveItem.item)}</strong> by{" "}
              {view.approveItem.user?.name ?? "Unknown"}.
            </>
          )}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="approve-notes">Notes (optional)</Label>
          <Textarea
            id="approve-notes"
            placeholder="Optional approval notes..."
            value={view.approveNotes}
            onChange={(e) => view.setApproveNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={view.closeApproveDialog}>
          Cancel
        </Button>
        <Button
          onClick={view.submitApprove}
          disabled={view.isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="h-4 w-4 mr-1.5" />
          {view.isSubmitting ? "Approving…" : "Approve"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Reject Dialog ─────────────────────────────────────────────────────── */

const RejectDialog = ({
  view,
}: {
  view: ReturnType<typeof useBorrowRecordsView>;
}) => (
  <Dialog
    open={!!view.rejectItem}
    onOpenChange={(open) => {
      if (!open) view.closeRejectDialog();
    }}
  >
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Reject Borrow Request</DialogTitle>
        <DialogDescription>
          {view.rejectItem && (
            <>
              Reject borrow of{" "}
              <strong>{getItemName(view.rejectItem.item)}</strong> by{" "}
              {view.rejectItem.user?.name ?? "Unknown"}.
            </>
          )}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="reject-reason">
            Reason <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="reject-reason"
            autoFocus
            placeholder="Explain why this request is being rejected..."
            value={view.rejectReason}
            onChange={(e) => view.setRejectReason(e.target.value)}
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={view.closeRejectDialog}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={view.submitReject}
          disabled={view.isSubmitting || !view.rejectReason.trim()}
        >
          <XCircle className="h-4 w-4 mr-1.5" />
          {view.isSubmitting ? "Rejecting…" : "Reject"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
