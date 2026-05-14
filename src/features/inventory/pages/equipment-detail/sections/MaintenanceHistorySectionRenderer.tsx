// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE HISTORY SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import { cn } from "@/shared/lib/utils";
import type { MaintenanceHistorySection } from "../types";

// ─── Pure Style Lookup ───────────────────────────────────────────────────

const maintenanceTypeBadgeClass: Record<string, string> = {
  Routine: "bg-muted text-primary border",
  Repair: "bg-destructive/10 text-destructive border border-destructive/30",
  Calibration: "bg-accent/10 text-accent border border-accent/30",
  Certification: "bg-warning/10 text-warning border border-warning/30",
};

const fallbackBadgeClass = "bg-muted text-muted-foreground";

// ─── Component ───────────────────────────────────────────────────────────

interface Props {
  section: MaintenanceHistorySection;
}

const MaintenanceHistorySectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    {section.records.length === 0 ? (
      <p className="text-sm text-muted-foreground italic">
        No maintenance records.
      </p>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.records.map((m, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {m.date}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "text-xs",
                      maintenanceTypeBadgeClass[m.type] ?? fallbackBadgeClass
                    )}
                  >
                    {m.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{m.technician}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">
                  {m.notes}
                </TableCell>
                <TableCell className="font-mono text-sm text-right">
                  {m.cost}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </SectionCard>
);

export default MaintenanceHistorySectionRenderer;
