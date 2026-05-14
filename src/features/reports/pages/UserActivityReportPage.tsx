/* ═══════════════════════════════════════════════════════════════════════════
 * User Activity Report Page
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    useUserActivityReport,
} from "@/features/reports/services/reportService";
import PageHeader from "@/shared/components/PageHeader";
import { Download, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const UserActivityReportPage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = `${today.slice(0, 7)}-01`;
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);

  const { data, isLoading, refetch } = useUserActivityReport({ from, to });

  const handleExport = async () => {
    try {
      await exportReportCsv("user-activity");
      toast.success("CSV export started");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = (data as any)?.data?.users ?? [];

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="User Activity Report"
          description="Per-user transaction and activity statistics"
          icon={Users}
          actions={
            <PermissionGate permission="reports.export">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </PermissionGate>
          }
        />

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <Label>From</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-1">
                <Label>To</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={() => refetch()}>Apply Filter</Button>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Borrows</TableHead>
                <TableHead>Chemical Usages</TableHead>
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
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No activity data for the selected period.
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rows.map((row: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {row.user_name ?? row.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      {row.transactions ?? row.transaction_count ?? "0"}
                    </TableCell>
                    <TableCell>
                      {row.total_borrows ??
                        row.borrows ??
                        row.borrow_count ??
                        "0"}
                    </TableCell>
                    <TableCell>
                      {row.chemical_usage_logs_count ??
                        row.chemical_usages ??
                        row.chemical_usage_count ??
                        "0"}
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

export default UserActivityReportPage;
