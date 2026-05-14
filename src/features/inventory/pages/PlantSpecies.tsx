/* ═══════════════════════════════════════════════════════════════════════════
 * PlantSpecies — Plant species catalog page (composition root).
 *
 * Uses ListPage shell. All state lives in usePlantSpeciesView().
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Leaf } from "lucide-react";

import { ListPage } from "@/shared/components/ListPage";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { SpeciesFormDialog } from "./SpeciesFormDialog";
import { SpeciesGrid } from "./SpeciesGrid";
import { SpeciesTable } from "./SpeciesTable";
import { usePlantSpeciesView } from "./usePlantSpeciesView";

/* ─── Family Filter (co-located — too small to extract) ─────────────────── */

const FamilyFilter = ({
  families,
  value,
  onChange,
}: {
  families: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-48">
      <SelectValue placeholder="All Families" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Families</SelectItem>
      {families.map((f) => (
        <SelectItem key={f} value={f}>
          {f}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

const PlantSpecies = () => {
  const view = usePlantSpeciesView();

  return (
    <ListPage
      icon={Leaf}
      title="Plant Species"
      description="Catalog of plant species used in the lab"
      addLabel="Add Species"
      onAdd={view.openCreateForm}
      stats={view.quickStats}
      searchPlaceholder="Search by scientific name, common name, or ID..."
      searchQuery={view.searchQuery}
      onSearchChange={view.updateSearchQuery}
      viewMode={view.viewMode}
      onViewModeChange={view.switchViewMode}
      items={view.filteredItems}
      isLoading={view.isLoading}
      isError={view.isError}
      emptyTitle="No species found"
      emptyDescription="Try adjusting your search query or family filter."
      filterSlot={
        <FamilyFilter
          families={view.families}
          value={view.familyFilter}
          onChange={view.updateFamilyFilter}
        />
      }
      renderGrid={(items) => (
        <SpeciesGrid
          items={items}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onViewBatches={view.navigateToBatches}
        />
      )}
      renderTable={(items) => (
        <SpeciesTable
          items={items}
          onNavigate={view.navigateToDetail}
          onEdit={view.openEditForm}
          onViewBatches={view.navigateToBatches}
        />
      )}
    >
      <SpeciesFormDialog view={view} />
    </ListPage>
  );
};

export default PlantSpecies;
