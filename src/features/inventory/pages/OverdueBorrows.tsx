/* ═══════════════════════════════════════════════════════════════════════════
 * Overdue Borrows — List all overdue borrow records.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/core/layouts/AppLayout";
import { useOverdueBorrows } from "@/features/inventory/services/borrowRecordService";
import PageHeader from "@/shared/components/PageHeader";
import type { BorrowRecord } from "@/shared/types/index";
import { AlertTriangle } from "lucide-react";

const OverdueBorrows = () => {
  const { data: overdue = [], isLoading } = useOverdueBorrows();

  const getBorrowerName = (record: BorrowRecord) =>
    typeof record.user === "object" && "name" in record.user
      ? record.user.name
      : "Unknown";

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Overdue Borrows"
          description="Borrow records that have passed their due date"
          icon={AlertTriangle}
        />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Borrowed At</TableHead>
                <TableHead>Status</TableHead>
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
              ) : overdue.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No overdue borrows — great!
                  </TableCell>
                </TableRow>
              ) : (
                overdue.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{getBorrowerName(record)}</TableCell>
                    <TableCell className="capitalize">
                      {record.item.type} #{record.item.id}
                    </TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell className="text-destructive font-medium">
                      {record.due_at ?? "—"}
                    </TableCell>
                    <TableCell>
                      {record.borrowed_at
                        ? new Date(record.borrowed_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Overdue</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default OverdueBorrows;
