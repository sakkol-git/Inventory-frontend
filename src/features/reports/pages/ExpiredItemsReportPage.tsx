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
import { expiredItemsReportSchema } from "@/lib/schemas/reports";
import { parseApiResponse } from "@/lib/api/parseApiResponse";
import PageHeader from "@/shared/components/PageHeader";
import { AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useEffect } from "react";

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

  // Parse API response safely
  const { parsedItems, hasParseError } = useMemo(() => {
    let itemsResult: Array<{
      _name?: string;
      _itemType?: string;
      expiry_date?: string | null;
      _status?: string;
    }> = [];
    let hasError = false;

    if (!isLoading && data) {
      try {
        const parsed = parseApiResponse(expiredItemsReportSchema, data);
        const expiredChemicals = Array.isArray(parsed.data?.expired_chemicals)
          ? parsed.data.expired_chemicals
          : [];
        const expiredBatches = Array.isArray(parsed.data?.expired_batches)
          ? parsed.data.expired_batches
          : [];
        const expiringSoon = Array.isArray(parsed.data?.expiring_soon_batches)
          ? parsed.data.expiring_soon_batches
          : [];

        itemsResult = [
          ...expiredChemicals.map((i) => ({
            ...i,
            _itemType: "Chemical",
            _name: i.common_name ?? i.name ?? "—",
          })),
          ...expiredBatches.map((i) => ({
            ...i,
            _itemType: "Batch",
            _name: `${i.chemical?.common_name ?? "—"} (${i.batch_number ?? "—"})`,
            _status: "Expired",
          })),
          ...expiringSoon.map((i) => ({
            ...i,
            _itemType: "Batch",
            _name: `${i.chemical?.common_name ?? "—"} (${i.batch_number ?? "—"})`,
            _status: "Expiring Soon",
          })),
        ];
      } catch (err) {
        hasError = true;
      }
    }
    return { parsedItems: itemsResult, hasParseError: hasError };
  }, [data, isLoading]);

  useEffect(() => {
    if (hasParseError) {
      toast.error("Unexpected server response for expired items report");
    }
  }, [hasParseError]);

  const items = parsedItems;

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
                items.map((item, i: number) => (
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
