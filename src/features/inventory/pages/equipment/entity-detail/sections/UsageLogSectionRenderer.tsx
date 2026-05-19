// ═══════════════════════════════════════════════════════════════════════════
// USAGE LOG SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { UsageLogSection } from "../types";

interface Props {
  section: UsageLogSection;
}

const UsageLogSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    {section.records.length === 0 ? (
      <p className="text-sm text-muted-foreground italic">
        No usage records.
      </p>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Purpose</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.records.map((u, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs">{u.date}</TableCell>
                <TableCell className="text-sm">{u.user}</TableCell>
                <TableCell className="text-sm">{u.duration}</TableCell>
                <TableCell className="text-sm">{u.purpose}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </SectionCard>
);

export default UsageLogSectionRenderer;
