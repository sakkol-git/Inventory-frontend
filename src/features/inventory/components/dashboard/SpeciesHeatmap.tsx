import { cn } from "@/shared/lib/utils";
import { Leaf } from "lucide-react";

const speciesData = [
  { name: "Arabidopsis", batches: 1, plants: 300, health: 98 },
  { name: "Tomato", batches: 1, plants: 150, health: 95 },
  { name: "Maize", batches: 1, plants: 500, health: 100 },
  { name: "Rice", batches: 1, plants: 200, health: 92 },
  { name: "Wheat", batches: 1, plants: 400, health: 97 },
  { name: "Tobacco", batches: 1, plants: 45, health: 88 },
  { name: "Soybean", batches: 0, plants: 0, health: 0 },
];

const maxPlants = Math.max(...speciesData.map((s) => s.plants));

const getHealthColor = (health: number) => {
  if (health === 0) return "text-muted-foreground";
  if (health >= 95) return "text-primary";
  if (health >= 85) return "text-warning";
  return "text-destructive";
};

const getBarColor = (health: number) => {
  if (health === 0) return "bg-muted";
  if (health >= 95) return "bg-primary";
  if (health >= 85) return "bg-warning";
  return "bg-destructive";
};

const SpeciesHeatmap = () => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Leaf className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">Species Overview</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Health & population by species
            </p>
          </div>
        </div>
      </div>

      {/* Species Bars */}
      <div className="space-y-3">
        {speciesData.map((species) => (
          <div key={species.name} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{species.name}</span>
                {species.batches > 0 && (
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-xl">
                    {species.batches} batch{species.batches !== 1 ? "es" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {species.plants.toLocaleString()} plants
                </span>
                <span className={cn(
                  "text-xs font-medium tabular-nums w-10 text-right",
                  getHealthColor(species.health)
                )}>
                  {species.health > 0 ? `${species.health}%` : "—"}
                </span>
              </div>
            </div>
            <div className="h-3 bg-muted overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full transition-all duration-500 group-hover:opacity-80",
                  getBarColor(species.health)
                )}
                style={{ width: maxPlants > 0 ? `${(species.plants / maxPlants) * 100}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5 pt-3 border-t border-border">
        {[
          { label: "≥95% Healthy", color: "bg-primary" },
          { label: "85–94%", color: "bg-warning" },
          { label: "<85%", color: "bg-destructive" },
          { label: "Inactive", color: "bg-muted" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeciesHeatmap;
