/* ═══════════════════════════════════════════════════════════════════════════
 * EquipmentGrid — Grid + card view for equipment listing.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/ProductCard";
import { cn } from "@/shared/lib/utils";
import {
    ArrowLeftRight,
    MapPin,
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

/* ─── Grid Container ────────────────────────────────────────────────────── */

interface EquipmentGridProps {
  items: EquipmentItem[];
  onNavigate: (id: number) => void;
  onEdit: (eq: EquipmentItem) => void;
  onDelete: (eq: EquipmentItem) => void;
  onBorrow?: (eq: EquipmentItem) => void;
  onReturn?: (eq: EquipmentItem) => void;
}

export const EquipmentGrid = ({
  items,
  onNavigate,
  onEdit,
  onDelete,
  onBorrow,
  onReturn,
}: EquipmentGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
    {items.map((eq) => (
      <EquipmentCard
        key={eq.id}
        item={eq}
        onNavigate={onNavigate}
        onEdit={onEdit}
        onDelete={onDelete}
        onBorrow={onBorrow}
        onReturn={onReturn}
      />
    ))}
  </div>
);

/* ─── Single Equipment Card ─────────────────────────────────────────────── */

interface EquipmentCardProps {
  item: EquipmentItem;
  onNavigate: (id: number) => void;
  onEdit: (eq: EquipmentItem) => void;
  onDelete: (eq: EquipmentItem) => void;
  onBorrow?: (eq: EquipmentItem) => void;
  onReturn?: (eq: EquipmentItem) => void;
}

const EquipmentCard = ({
  item,
  onNavigate,
  onEdit,
  onDelete,
  onBorrow,
  onReturn,
}: EquipmentCardProps) => {
  const Icon = item.icon;
  const navigateToDetail = () => onNavigate(item.id);

  const subtitle = item.manufacturer
    ? `${item.manufacturer}${item.model_name ? ` — ${item.model_name}` : ""}`
    : undefined;

  const meta = [
    { icon: MapPin, value: item.location || "—" },
    item.is_borrowable && { icon: Wrench, value: "Borrowable" },
  ].filter(Boolean) as { icon: typeof MapPin; value: string }[];

  const statusBadge = (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg",
        statusBadgeClass(item.status),
      )}
    >
      {formatEnumLabel(item.status)}
    </span>
  );

  const fallbackImage = (
    <>
      <Icon
        className="h-16 w-16 transition-transform duration-200 group-hover:scale-110"
        style={{ color: item.color }}
        strokeWidth={1.2}
      />
      <span className="mt-3 text-xs font-medium tracking-wide text-muted-foreground">
        {formatEnumLabel(item.category)}
      </span>
    </>
  );

  return (
    <div className="relative">
      <ProductCard
        image={item.image_url ?? undefined}
        fallbackImage={fallbackImage}
        title={item.equipment_name}
        subtitle={subtitle}
        id={String(item.id)}
        statusBadge={statusBadge}
        meta={meta}
        onClick={navigateToDetail}
        className="aspect-square"
      />
      <div
        role="presentation"
        className="absolute bottom-5 left-5 right-5 pt-3 border-t border-border/40 flex items-center gap-2 bg-card"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded",
            conditionBadgeClass(item.condition),
          )}
        >
          {formatEnumLabel(item.condition)}
        </span>
        <div className="flex-1" />

        {/* Borrow / Return workflow buttons */}
        {item.is_borrowable && item.status === "available" && onBorrow && (
          <Button
            size="sm"
            variant="outline"
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
            size="sm"
            variant="outline"
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
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0 shrink-0"
          aria-label={`Edit ${item.equipment_name}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0 shrink-0 text-destructive hover:text-destructive"
          aria-label={`Delete ${item.equipment_name}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
