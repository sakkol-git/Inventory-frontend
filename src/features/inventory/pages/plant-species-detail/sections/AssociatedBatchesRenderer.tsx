// ═══════════════════════════════════════════════════════════════════════════
// ASSOCIATED BATCHES SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { ExternalLink, ArrowRight } from "lucide-react";
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
import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { AssociatedBatchesSection } from "../types";

interface Props {
  section: AssociatedBatchesSection;
}

const AssociatedBatchesRenderer = ({ section }: Props) => {
  const navigate = useNavigate();

  return (
    <SectionCard
      title={section.title}
      icon={section.icon}
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs font-medium"
          onClick={() => navigate(section.viewAllHref)}
        >
          View All <ExternalLink className="h-3 w-3" />
        </Button>
      }
    >
      {section.batches.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No batches recorded.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-xs">Batch ID</TableHead>
                <TableHead className="font-medium text-xs">Stage</TableHead>
                <TableHead className="font-medium text-xs">Quantity</TableHead>
                <TableHead className="font-medium text-xs">Location</TableHead>
                <TableHead className="font-medium text-xs">Start Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.batches.map((b) => (
                <TableRow
                  key={b.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/inventory/products/batches/${b.id}`)}
                >
                  <TableCell className="font-mono font-medium">{b.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{b.stage}</Badge>
                  </TableCell>
                  <TableCell>{b.quantity.toLocaleString()}</TableCell>
                  <TableCell>{b.location}</TableCell>
                  <TableCell>{b.startDate}</TableCell>
                  <TableCell>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
};

export default AssociatedBatchesRenderer;
