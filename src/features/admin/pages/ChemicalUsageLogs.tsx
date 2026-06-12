import AppLayout from "@/core/layouts/AppLayout";
import PageHeader from "@/shared/components/PageHeader";
import EmptyState from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useChemicalUsageLogs } from "@/features/inventory/services/chemicalUsageLogService";
import type { ChemicalUsageLog } from "@/shared/types";
import { FileText } from "lucide-react";

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const ChemicalUsageLogs = () => {
  const { data, isLoading, isError } = useChemicalUsageLogs();

  const items: ChemicalUsageLog[] = data ?? [];

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={FileText}
          title="Chemical Usage Logs"
          description="All recorded chemical usages and additions"
          actions={null}
        />

        {isLoading && <LoadingState rows={6} variant="skeleton" text="Loading logs..." />}

        {isError && !isLoading && (
          <ErrorState message="Failed to load chemical usage logs" onRetry={() => window.location.reload()} />
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState icon={FileText} title="No usage logs" description="No chemical usage records were found." />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Chemical</TableHead>
                  <TableHead>Behavior</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Used At</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{row.id}</TableCell>
                    <TableCell className="font-medium">{row.chemical?.common_name ?? "—"}</TableCell>
                    <TableCell>
                      {row.experiment_name ? (
                        <span className="inline-flex rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
                          {toTitleCase(String(row.experiment_name))}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{row.quantity_used}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{row.purpose}</TableCell>
                    <TableCell>{row.user?.name ?? "—"}</TableCell>
                    <TableCell>{row.used_at ? new Date(row.used_at).toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-sm">{row.notes ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChemicalUsageLogs;
