/* ═══════════════════════════════════════════════════════════════════════════
 * Chemical Usage Report Page
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
    useChemicalUsageReport,
} from "@/features/reports/services/reportService";
import PageHeader from "@/shared/components/PageHeader";
import { Download, FlaskConical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ChemicalUsageReportPage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = `${today.slice(0, 7)}-01`;
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);

  const { data, isLoading, refetch } = useChemicalUsageReport({ from, to });

  const handleExport = async () => {
    try {
      await exportReportCsv("chemical-usage");
      toast.success("CSV export started");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  const rows: any[] = Object.values(raw?.data?.usage ?? raw?.usage ?? {});

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Chemical Usage Report"
          description="Usage logs grouped by chemical"
          icon={FlaskConical}
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
                <TableHead>Chemical</TableHead>
                <TableHead>Total Used</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Usage Count</TableHead>
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
                    No data for the selected period.
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rows.map((row: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>
                      {typeof row.chemical === "string"
                        ? row.chemical
                        : (row.chemical?.common_name ?? "—")}
                    </TableCell>
                    <TableCell>{row.total_used ?? "—"}</TableCell>
                    <TableCell>{row.unit ?? "—"}</TableCell>
                    <TableCell>{row.usage_count ?? "—"}</TableCell>
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

export default ChemicalUsageReportPage;
