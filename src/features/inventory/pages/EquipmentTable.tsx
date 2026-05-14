/* ═══════════════════════════════════════════════════════════════════════════
 * EquipmentTable — Table view for equipment listing.
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
import ImageWithFallback from "@/shared/components/ImageWithFallback";
import { cn } from "@/shared/lib/utils";
import {
    ArrowLeftRight,
    Pencil,
    RotateCcw,
    Trash2,
    Wrench,
} from "lucide-react";
import {
    conditionBadgeClass,
    formatEnumLabel,
    statusBadgeClass,
    type EquipmentItem,
} from "./useEquipmentView";

/* ─── Table Container ───────────────────────────────────────────────────── */

interface EquipmentTableProps {
  items: EquipmentItem[];
  onNavigate: (id: number) => void;
  onEdit: (eq: EquipmentItem) => void;
  onDelete: (eq: EquipmentItem) => void;
  onBorrow?: (eq: EquipmentItem) => void;
  onReturn?: (eq: EquipmentItem) => void;
}

export const EquipmentTable = ({
  items,
  onNavigate,
  onEdit,
  onDelete,
  onBorrow,
  onReturn,
}: EquipmentTableProps) => (
  <div className="rounded-lg overflow-hidden border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Image</TableHead>
          <TableHead className="w-24">Code</TableHead>
          <TableHead>Equipment Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Condition</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((eq) => (
          <EquipmentTableRow
            key={eq.id}
            item={eq}
            onNavigate={onNavigate}
            onEdit={onEdit}
            onDelete={onDelete}
            onBorrow={onBorrow}
            onReturn={onReturn}
          />
        ))}
      </TableBody>
    </Table>
  </div>
);

/* ─── Single Table Row ──────────────────────────────────────────────────── */

const EquipmentTableRow = ({
  item,
  onNavigate,
  onEdit,
  onDelete,
  onBorrow,
  onReturn,
}: {
  item: EquipmentItem;
  onNavigate: (id: number) => void;
  onEdit: (eq: EquipmentItem) => void;
  onDelete: (eq: EquipmentItem) => void;
  onBorrow?: (eq: EquipmentItem) => void;
  onReturn?: (eq: EquipmentItem) => void;
}) => {
  const navigateToDetail = () => onNavigate(item.id);

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={navigateToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateToDetail();
        }
      }}
      role="link"
      tabIndex={0}
    >
      <TableCell>
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
          <ImageWithFallback
            src={item.image_url ?? undefined}
            alt={item.equipment_name}
            fallback={<Wrench className="h-4 w-4 text-muted-foreground/50" />}
          />
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground/70">
        {item.equipment_code || "—"}
      </TableCell>
      <TableCell className="font-medium text-foreground">
        {item.equipment_name}
      </TableCell>
      <TableCell className="text-muted-foreground/70 text-sm">
        {formatEnumLabel(item.category)}
      </TableCell>
      <TableCell className="text-center">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg",
            statusBadgeClass(item.status),
          )}
        >
          {formatEnumLabel(item.status)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded",
            conditionBadgeClass(item.condition),
          )}
        >
          {formatEnumLabel(item.condition)}
        </span>
      </TableCell>
      <TableCell className="text-sm">{item.location || "—"}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {item.is_borrowable && item.status === "available" && onBorrow && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 px-2"
              aria-label={`Borrow ${item.equipment_name}`}
              onClick={(e) => {
                e.stopPropagation();
                onBorrow(item);
              }}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Borrow
            </Button>
          )}
          {item.status === "borrowed" && onReturn && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 px-2 text-primary border-primary/30 hover:bg-primary/10"
              aria-label={`Return ${item.equipment_name}`}
              onClick={(e) => {
                e.stopPropagation();
                onReturn(item);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Return
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            aria-label={`Edit ${item.equipment_name}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-destructive hover:text-destructive"
            aria-label={`Delete ${item.equipment_name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
