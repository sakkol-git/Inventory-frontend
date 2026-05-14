/* ═══════════════════════════════════════════════════════════════════════════
 * Expired Items Report Page
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
    useExpiredItemsReport,
} from "@/features/reports/services/reportService";
import PageHeader from "@/shared/components/PageHeader";
import { AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";

const ExpiredItemsReportPage = () => {
  const { data, isLoading } = useExpiredItemsReport();

  const handleExport = async () => {
    try {
      await exportReportCsv("expired-items");
      toast.success("CSV export started");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expiredChemicals: any[] = Array.isArray(raw?.data?.expired_chemicals)
    ? raw.data.expired_chemicals
    : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expiredBatches: any[] = Array.isArray(raw?.data?.expired_batches)
    ? raw.data.expired_batches
    : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expiringSoon: any[] = Array.isArray(raw?.data?.expiring_soon_batches)
    ? raw.data.expiring_soon_batches
    : [];
  const items = [
    ...expiredChemicals.map((i: any) => ({
      ...i,
      _itemType: "Chemical",
      _name: i.common_name ?? i.name ?? "—",
    })),
    ...expiredBatches.map((i: any) => ({
      ...i,
      _itemType: "Batch",
      _name: `${i.chemical?.common_name ?? "—"} (${i.batch_number ?? "—"})`,
      _status: "Expired",
    })),
    ...expiringSoon.map((i: any) => ({
      ...i,
      _itemType: "Batch",
      _name: `${i.chemical?.common_name ?? "—"} (${i.batch_number ?? "—"})`,
      _status: "Expiring Soon",
    })),
  ];

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Expired Items Report"
          description="Expired chemicals and batches requiring attention"
          icon={AlertTriangle}
          actions={
            <PermissionGate permission="reports.export">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </PermissionGate>
          }
        />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No expired items found.
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                items.map((item: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item._name}</TableCell>
                    <TableCell className="capitalize">
                      {item._itemType}
                    </TableCell>
                    <TableCell>{item.expiry_date ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item._status === "Expiring Soon"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {item._status ?? "Expired"}
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

export default ExpiredItemsReportPage;
