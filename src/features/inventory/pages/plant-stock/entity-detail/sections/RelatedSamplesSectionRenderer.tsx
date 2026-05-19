import { SectionCard } from "@/shared/components/detail/DetailPageShell";
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
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RelatedSamplesSection } from "../types";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-500/10 text-green-700 dark:text-green-400",
  Inactive: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  Archived: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Depleted: "bg-red-500/10 text-red-700 dark:text-red-400",
};

interface Props {
  section: RelatedSamplesSection;
}

export function RelatedSamplesSectionRenderer({ section }: Props) {
  const navigate = useNavigate();

  return (
    <SectionCard title={section.title} icon={section.icon}>
      {section.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No samples found for this species
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample Name</TableHead>
                <TableHead>Unique Code</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Brought</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.items.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    navigate(`/inventory/products/samples/${item.id}`)
                  }
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.uniqueCode}
                  </TableCell>
                  <TableCell>{item.ownershipUserName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        STATUS_COLORS[item.status] || STATUS_COLORS.Active
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.dateBrought}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(section.viewAllHref)}
            >
              View All Samples
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </SectionCard>
  );
}
