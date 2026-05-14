import { AlertTriangle, FlaskConical } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const expiringChemicals = [
  { name: "Sodium Hydroxide (NaOH)", expiry: "Feb 12, 2026", daysLeft: 7, quantity: "2.5L", hazard: "high" },
  { name: "Hydrochloric Acid (HCl)", expiry: "Feb 18, 2026", daysLeft: 13, quantity: "1L", hazard: "high" },
  { name: "Ethanol 95%", expiry: "Feb 25, 2026", daysLeft: 20, quantity: "5L", hazard: "low" },
];

const ChemicalExpiryCard = () => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-destructive" />
          <h3 className="section-title text-foreground">Chemical Expiry Alerts</h3>
        </div>
        <span className="minimal-badge-destructive">
          {expiringChemicals.length} items
        </span>
      </div>

      {/* Chemical List */}
      <div className="space-y-3">
        {expiringChemicals.map((chemical, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl transition-all hover:bg-muted/40",
              chemical.hazard === "high" ? "hazard-high" : "hazard-low"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl",
                chemical.daysLeft <= 7 
                  ? "bg-muted" 
                  : "bg-muted"
              )}>
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  chemical.daysLeft <= 7 ? "text-destructive" : "text-warning"
                )} />
              </div>
              <div>
                <p className="font-medium text-foreground">{chemical.name}</p>
                <p className="text-sm text-muted-foreground font-medium">{chemical.quantity}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{chemical.expiry}</p>
              <p className={cn(
                "text-xs font-medium",
                chemical.daysLeft <= 7 ? "text-destructive" : "text-warning"
              )}>
                {chemical.daysLeft} days left
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChemicalExpiryCard;