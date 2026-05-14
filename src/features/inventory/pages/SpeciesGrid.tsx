/* ═══════════════════════════════════════════════════════════════════════════
 * SpeciesGrid — Grid + card view for the Plant Species page.
 * Extracted from PlantSpecies.tsx for single-responsibility.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Sprout, TestTube } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ui/ProductCard";

import type { SpeciesItem } from "./usePlantSpeciesView";

/* ─── Props ──────────────────────────────────────────────────────────────── */

export interface SpeciesListProps {
  items: SpeciesItem[];
  onNavigate: (id: number) => void;
  onEdit: (sp: SpeciesItem) => void;
  onViewBatches: (name: string) => void;
}

/* ─── Grid Container ─────────────────────────────────────────────────────── */

export const SpeciesGrid = ({
  items,
  onNavigate,
  onEdit,
  onViewBatches,
}: SpeciesListProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
    {items.map((sp) => (
      <SpeciesCard
        key={sp.id}
        item={sp}
        onNavigate={onNavigate}
        onEdit={onEdit}
        onViewBatches={onViewBatches}
      />
    ))}
  </div>
);

/* ─── Species Card ────────────────────────────────────────────────────────── */

const SpeciesCard = ({
  item,
  onNavigate,
  onEdit,
  onViewBatches: _onViewBatches,
}: {
  item: SpeciesItem;
  onNavigate: (id: number) => void;
  onEdit: (sp: SpeciesItem) => void;
  onViewBatches: (name: string) => void;
}) => {
  const Icon = item.icon;
  const varietyCount = item.variety_count ?? 0;
  const sampleCount = item.sample_count ?? 0;
  const hasVarieties = varietyCount > 0;
  const imageUrl = item.image_url;

  return (
    <ProductCard
      image={imageUrl ?? undefined}
      fallbackImage={
        <>
          <Icon
            className="h-16 w-16 transition-transform duration-200 group-hover:scale-110"
            style={{ color: item.color }}
            strokeWidth={1.2}
          />
          <span className="mt-3 text-xs font-medium tracking-widest text-muted-foreground">
            {item.family}
          </span>
        </>
      }
      title={
        item.khmer_name
          ? `${item.common_name} (${item.khmer_name})`
          : item.common_name
      }
      subtitle={item.scientific_name}
      id={String(item.id)}
      statusBadge={
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={hasVarieties ? "default" : "secondary"}
            className="text-xs"
          >
            {varietyCount} {varietyCount === 1 ? "variety" : "varieties"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {sampleCount} {sampleCount === 1 ? "sample" : "samples"}
          </Badge>
        </div>
      }
      meta={[
        { icon: Sprout, value: item.growth_type || "N/A" },
        {
          icon: TestTube,
          label: "units",
          value: (item.total_quantity ?? 0).toLocaleString(),
        },
      ]}
      tags={[]}
      onClick={() => onNavigate(item.id)}
      onEdit={() => onEdit(item)}
      imageBackgroundColor={
        hasVarieties ? "bg-primary/5 border-primary/20" : "bg-muted/50"
      }
      className="aspect-square"
    />
  );
};
