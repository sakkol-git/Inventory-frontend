/* ═══════════════════════════════════════════════════════════════════════════
 * Pending Approvals — Review and approve/reject pending borrow requests.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { handleFormError } from "@/lib/errors/handleFormError";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/core/layouts/AppLayout";
import PageHeader from "@/shared/components/PageHeader";

import {
    useApproveBorrow,
    usePendingBorrows,
    useRejectBorrow,
} from "@/features/inventory/services/borrowRecordService";
import type { BorrowRecord } from "@/shared/types/index";
import {
    approveBorrowSchema,
    rejectBorrowSchema,
    type ApproveBorrowPayload,
    type RejectBorrowPayload,
} from "@/shared/types/schemas";

const PendingApprovals = () => {
  const [approveItem, setApproveItem] = useState<BorrowRecord | null>(null);
  const [rejectItem, setRejectItem] = useState<BorrowRecord | null>(null);

  const { data: pending = [], isLoading } = usePendingBorrows();
  const approveMutation = useApproveBorrow();
  const rejectMutation = useRejectBorrow();

  const approveForm = useForm<ApproveBorrowPayload>({
    resolver: zodResolver(approveBorrowSchema),
  });

  const rejectForm = useForm<RejectBorrowPayload>({
    resolver: zodResolver(rejectBorrowSchema),
  });

  const handleApprove = approveForm.handleSubmit(async (data) => {
    if (!approveItem) return;
    try {
      await approveMutation.mutateAsync({ id: approveItem.id, ...data });
      toast.success("Borrow request approved");
      setApproveItem(null);
    } catch (err: unknown) {
      handleFormError(err, approveForm, "Failed to approve");
    }
  });

  const handleReject = rejectForm.handleSubmit(async (data) => {
    if (!rejectItem) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectItem.id, ...data });
      toast.success("Borrow request rejected");
      setRejectItem(null);
    } catch (err: unknown) {
      handleFormError(err, rejectForm, "Failed to reject");
    }
  });

  const getBorrowerName = (record: BorrowRecord) =>
    typeof record.borrower === "object" && record.borrower !== null && "name" in record.borrower
      ? record.borrower.name
      : "Unknown";

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Pending Approvals"
          description="Review and approve or reject borrow requests"
          icon={Clock}
        />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : pending.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No pending borrow requests.
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{getBorrowerName(record)}</TableCell>
                    <TableCell>
                      {record.item.type} #{record.item.id}
                    </TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>{record.due_at ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setApproveItem(record);
                            approveForm.reset();
                          }}
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => {
                            setRejectItem(record);
                            rejectForm.reset();
                          }}
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Approve Dialog */}
        <Dialog
          open={!!approveItem}
          onOpenChange={(v) => !v && setApproveItem(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Approve Borrow Request</DialogTitle>
            </DialogHeader>
            <Form {...approveForm}>
              <form onSubmit={handleApprove} className="space-y-4 mt-2">
                <FormField
                  control={approveForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Approval notes…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setApproveItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={approveMutation.isPending}>
                    {approveMutation.isPending ? "Approving…" : "Approve"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={!!rejectItem}
          onOpenChange={(v) => !v && setRejectItem(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Reject Borrow Request</DialogTitle>
            </DialogHeader>
            <Form {...rejectForm}>
              <form onSubmit={handleReject} className="space-y-4 mt-2">
                <FormField
                  control={rejectForm.control}
                  name="rejected_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejection Reason *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Reason for rejection…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRejectItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? "Rejecting…" : "Reject"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default PendingApprovals;
