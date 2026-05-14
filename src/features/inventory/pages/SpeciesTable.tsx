/* ═══════════════════════════════════════════════════════════════════════════
 * SpeciesTable — Table view for the Plant Species page.
 * Extracted from PlantSpecies.tsx for single-responsibility.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { ExternalLink, Pencil, Sprout } from "lucide-react";

import ImageWithFallback from "@/shared/components/ImageWithFallback";
import QuantityBadge from "@/shared/components/QuantityBadge";
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

import type { SpeciesItem } from "./usePlantSpeciesView";

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface SpeciesListProps {
  items: SpeciesItem[];
  onNavigate: (id: number) => void;
  onEdit: (sp: SpeciesItem) => void;
  onViewBatches: (name: string) => void;
}

/* ─── Table Container ────────────────────────────────────────────────────── */

export const SpeciesTable = ({
  items,
  onNavigate,
  onEdit,
  onViewBatches,
}: SpeciesListProps) => (
  <div className="rounded-lg overflow-hidden border border-border/40">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Image</TableHead>
          <TableHead className="w-24">Code</TableHead>
          <TableHead>Common Name</TableHead>
          <TableHead>Scientific Name</TableHead>
          <TableHead>Family</TableHead>
          <TableHead className="text-center">Varieties</TableHead>
          <TableHead className="text-center">Samples</TableHead>
          <TableHead className="text-right">Total Qty</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((sp) => (
          <SpeciesTableRow
            key={sp.id}
            item={sp}
            onNavigate={onNavigate}
            onEdit={onEdit}
            onViewBatches={onViewBatches}
          />
        ))}
      </TableBody>
    </Table>
  </div>
);

/* ─── Table Row ──────────────────────────────────────────────────────────── */

const SpeciesTableRow = ({
  item,
  onNavigate,
  onEdit,
  onViewBatches,
}: {
  item: SpeciesItem;
  onNavigate: (id: number) => void;
  onEdit: (sp: SpeciesItem) => void;
  onViewBatches: (name: string) => void;
}) => {
  const navigateToDetail = () => onNavigate(item.id);
  const stopAndEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item);
  };
  const stopAndViewBatches = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewBatches(item.common_name);
  };
  const varietyCount = item.variety_count ?? 0;
  const sampleCount = item.sample_count ?? 0;
  const hasVarieties = varietyCount > 0;
  const imageUrl = item.image_url;

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
            src={imageUrl ?? undefined}
            alt={item.common_name}
            fallback={<Sprout className="h-4 w-4 text-muted-foreground/50" />}
          />
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground/70">
        #{item.id}
      </TableCell>
      <TableCell className="font-medium">
        {item.common_name}
        {item.khmer_name && (
          <span className="ml-1 text-xs text-muted-foreground">
            ({item.khmer_name})
          </span>
        )}
      </TableCell>
      <TableCell className="italic text-muted-foreground">
        {item.scientific_name}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {item.family}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge
          variant={hasVarieties ? "default" : "secondary"}
          className="text-xs"
        >
          {varietyCount}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="text-xs">
          {sampleCount}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {(item.total_quantity ?? 0) > 0 ? (
          <QuantityBadge
            quantity={item.total_quantity ?? 0}
            unit="units"
            variant="default"
            showIcon={false}
          />
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {`\``}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs h-7 px-2 font-medium"
            onClick={stopAndViewBatches}
          >
            <ExternalLink className="h-3 w-3" /> Batches
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            aria-label={`Edit ${item.common_name}`}
            onClick={stopAndEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
