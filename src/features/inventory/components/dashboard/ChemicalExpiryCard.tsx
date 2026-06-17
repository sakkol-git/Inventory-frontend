import { useDashboardData } from "@/features/inventory/services/dashboardService";
import { AlertTriangle, FlaskConical, CheckCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const ChemicalExpiryCard = () => {
  const { data } = useDashboardData();
  
  const total = data?.chemicals_count ?? 0;
  const expired = data?.chemicals_expired ?? 0;
  const expiringSoon = data?.chemicals_expiring_soon ?? 0;
  const healthy = total - expired - expiringSoon;

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-destructive" />
          <h3 className="section-title text-foreground">Chemical Expiry Alerts</h3>
        </div>
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {total} total
        </span>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={cn("p-4 rounded-xl border flex flex-col items-center justify-center text-center", expired > 0 ? "border-destructive bg-destructive/10" : "border-border")}>
           <AlertTriangle className={cn("h-6 w-6 mb-2", expired > 0 ? "text-destructive" : "text-muted-foreground")} />
           <p className={cn("text-2xl font-semibold tabular-nums", expired > 0 ? "text-destructive" : "text-foreground")}>{expired}</p>
           <p className="text-xs font-medium text-muted-foreground tracking-wide mt-1">Expired</p>
        </div>

        <div className={cn("p-4 rounded-xl border flex flex-col items-center justify-center text-center", expiringSoon > 0 ? "border-warning bg-warning/10" : "border-border")}>
           <AlertTriangle className={cn("h-6 w-6 mb-2", expiringSoon > 0 ? "text-warning" : "text-muted-foreground")} />
           <p className={cn("text-2xl font-semibold tabular-nums", expiringSoon > 0 ? "text-warning" : "text-foreground")}>{expiringSoon}</p>
           <p className="text-xs font-medium text-muted-foreground tracking-wide mt-1">Expiring Soon</p>
        </div>

        <div className="p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
           <CheckCircle className="h-6 w-6 mb-2 text-primary" />
           <p className="text-2xl font-semibold tabular-nums text-primary">{healthy}</p>
           <p className="text-xs font-medium text-muted-foreground tracking-wide mt-1">Good Condition</p>
        </div>
      </div>
    </div>
  );
};

export default ChemicalExpiryCard;