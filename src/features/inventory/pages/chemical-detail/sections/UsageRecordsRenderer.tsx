import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UsageRecordsSection } from "../types";

interface Props {
  section: UsageRecordsSection;
}

const UsageRecordsRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    {section.records.length === 0 ? (
      <p className="text-sm text-muted-foreground italic">No usage records.</p>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium text-xs">Date</TableHead>
              <TableHead className="font-medium text-xs">User</TableHead>
              <TableHead className="font-medium text-xs">Amount</TableHead>
              <TableHead className="font-medium text-xs">Purpose</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.records.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs">{r.date}</TableCell>
                <TableCell className="text-sm">{r.user}</TableCell>
                <TableCell className="font-mono text-sm">{r.amountUsed}</TableCell>
                <TableCell className="text-sm">{r.purpose}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </SectionCard>
);

export default UsageRecordsRenderer;
