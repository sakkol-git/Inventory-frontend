/* ═══════════════════════════════════════════════════════════════════════════
 * ChemicalTable — Table view for chemical listing.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/shared/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import {
    expiryStatus,
    formatEnumLabel,
    hazardBadge,
    type ChemicalItem,
} from "./useChemicalsView";

/* ─── Table Container ───────────────────────────────────────────────────── */

interface ChemicalTableProps {
  items: ChemicalItem[];
  onNavigate: (id: number) => void;
  onEdit: (c: ChemicalItem) => void;
  onDelete?: (c: ChemicalItem) => void;
}

export const ChemicalTable = ({
  items,
  onNavigate,
  onEdit,
  onDelete,
}: ChemicalTableProps) => (
  <div className="rounded-xl overflow-hidden border border-border/40">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-center">Danger</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-center">Expiry</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((chem) => {
          const expiry = expiryStatus(chem.daysLeft);
          return (
            <TableRow
              key={chem.id}
              className="cursor-pointer"
              onClick={() => onNavigate(chem.id)}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                #{chem.id}
              </TableCell>
              <TableCell className="font-medium">{chem.common_name}</TableCell>
              <TableCell className="text-sm">
                {formatEnumLabel(chem.category)}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    "inline-block px-2 py-1 text-xs font-medium rounded-lg",
                    hazardBadge(chem.danger_level),
                  )}
                >
                  {chem.danger_level}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {chem.quantity}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    "inline-block px-2 py-1 text-xs font-medium rounded-lg",
                    expiry.className,
                  )}
                >
                  {expiry.label}
                </span>
              </TableCell>
              <TableCell className="text-sm">
                {chem.storage_location || "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(chem);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(chem);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);
