/* ═══════════════════════════════════════════════════════════════════════════
 * Borrowed Items Report Page
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    useBorrowedItemsReport,
} from "@/features/reports/services/reportService";
import PageHeader from "@/shared/components/PageHeader";
import { ArrowLeftRight, Download } from "lucide-react";
import { toast } from "sonner";

const statusVariant = (status: string) => {
  if (status === "overdue") return "destructive";
  if (status === "pending") return "secondary";
  if (status === "approved") return "default";
  return "outline";
};

const BorrowedItemsReportPage = () => {
  const { data, isLoading } = useBorrowedItemsReport();

  const handleExport = async () => {
    try {
      await exportReportCsv("borrowed-items");
      toast.success("CSV export started");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  const summary = raw?.data ?? {};
  const items: any[] = Array.isArray(summary.records) ? summary.records : [];

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Borrowed Items Report"
          description="Active, pending, and overdue borrow records"
          icon={ArrowLeftRight}
          actions={
            <PermissionGate permission="reports.export">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </PermissionGate>
          }
        />

        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(
              [
                ["Total", summary.total],
                ["Active", summary.active],
                ["Pending", summary.pending],
                ["Overdue", summary.overdue],
              ] as [string, number | undefined][]
            ).map(([label, val]) => (
              <div key={label} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{val ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No borrow records found.
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                items.map((item: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>
                      {typeof item.user === "object"
                        ? item.user?.name
                        : (item.user ?? "—")}
                    </TableCell>
                    <TableCell>
                      {item.borrowable_type?.split("\\").pop() ?? "—"} #
                      {item.borrowable_id ?? "—"}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.due_at ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>
                        {item.status}
                      </Badge>
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

export default BorrowedItemsReportPage;
