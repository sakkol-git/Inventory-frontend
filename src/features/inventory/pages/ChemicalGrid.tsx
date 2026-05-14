/* ═══════════════════════════════════════════════════════════════════════════
 * ChemicalGrid — Grid + card view for chemical listing.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { ProductCard } from "@/components/ui/ProductCard";
import { cn } from "@/shared/lib/utils";
import { MapPin } from "lucide-react";
import {
    expiryStatus,
    formatDisplayDate,
    formatEnumLabel,
    hazardBackground,
    hazardBadge,
    type ChemicalItem,
} from "./useChemicalsView";

/* ─── Grid Container ────────────────────────────────────────────────────── */

interface ChemicalGridProps {
  items: ChemicalItem[];
  onNavigate: (id: number) => void;
  onEdit: (c: ChemicalItem) => void;
}

export const ChemicalGrid = ({
  items,
  onNavigate,
  onEdit,
}: ChemicalGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
    {items.map((chem) => (
      <ChemicalCard
        key={chem.id}
        item={chem}
        onNavigate={onNavigate}
        onEdit={onEdit}
      />
    ))}
  </div>
);

/* ─── Single Chemical Card ──────────────────────────────────────────────── */

const ChemicalCard = ({
  item,
  onNavigate,
  onEdit,
}: {
  item: ChemicalItem;
  onNavigate: (id: number) => void;
  onEdit: (c: ChemicalItem) => void;
}) => {
  const Icon = item.icon;
  const expiry = expiryStatus(item.daysLeft);

  return (
    <ProductCard
      image={item.image_url || undefined}
      fallbackImage={
        <>
          <Icon
            className="h-16 w-16 transition-transform duration-200 group-hover:scale-110"
            style={{ color: item.color }}
            strokeWidth={1.2}
          />
          <span
            className={cn(
              "mt-3 text-xs font-medium px-2 py-1 rounded-lg",
              hazardBadge(item.danger_level),
            )}
          >
            {item.danger_level} hazard
          </span>
        </>
      }
      title={item.common_name}
      subtitle={item.chemical_code || formatEnumLabel(item.category)}
      id={`#${item.id}`}
      statusBadge={
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-lg",
            expiry.className,
          )}
        >
          {expiry.label}
        </span>
      }
      meta={[
        { label: "Qty:", value: item.quantity },
        item.storage_location
          ? { icon: MapPin, value: item.storage_location }
          : null,
        item.expiry_date
          ? { label: "Exp:", value: formatDisplayDate(item.expiry_date) }
          : null,
      ].filter((x): x is NonNullable<typeof x> => x !== null)}
      onClick={() => onNavigate(item.id)}
      onEdit={() => onEdit(item)}
      className="aspect-square"
      imageBackgroundColor={hazardBackground(item.danger_level)}
    />
  );
};
