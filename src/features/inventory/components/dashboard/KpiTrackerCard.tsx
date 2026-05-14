import { cn } from "@/shared/lib/utils";
import { Target, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KPI {
  label: string;
  value: string;
  target: string;
  progress: number; // 0–100, can exceed 100
  trend: "up" | "down" | "flat";
  trendValue: string;
}

const kpis: KPI[] = [
  { label: "Plant Survival Rate", value: "96.6%", target: "95%", progress: 102, trend: "up", trendValue: "+1.2%" },
  { label: "Equipment Uptime", value: "95.5%", target: "98%", progress: 97, trend: "down", trendValue: "-0.8%" },
  { label: "Chemical Compliance", value: "93.5%", target: "100%", progress: 94, trend: "up", trendValue: "+2.1%" },
  { label: "Avg Checkout Time", value: "2.3 days", target: "3 days", progress: 130, trend: "up", trendValue: "-0.4d" },
  { label: "Weekly Throughput", value: "34 txns", target: "30 txns", progress: 113, trend: "up", trendValue: "+6 txns" },
  { label: "Waste Reduction", value: "12%", target: "15%", progress: 80, trend: "flat", trendValue: "0%" },
];

const getProgressColor = (progress: number) => {
  if (progress >= 100) return "bg-primary";
  if (progress >= 80) return "bg-warning";
  return "bg-destructive";
};

const getTrendIcon = (trend: KPI["trend"]) => {
  switch (trend) {
    case "up":
      return ArrowUpRight;
    case "down":
      return ArrowDownRight;
    case "flat":
      return Minus;
  }
};

const getTrendColor = (trend: KPI["trend"]) => {
  switch (trend) {
    case "up":
      return "text-primary";
    case "down":
      return "text-destructive";
    case "flat":
      return "text-muted-foreground";
  }
};

const KpiTrackerCard = () => {
  const metCount = kpis.filter((k) => k.progress >= 100).length;

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">KPI Tracker</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Performance vs targets
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-primary bg-muted px-2 py-1 rounded-xl">
          {metCount}/{kpis.length} met
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => {
          const TrendIcon = getTrendIcon(kpi.trend);
          const clampedProgress = Math.min(kpi.progress, 100);

          return (
            <div
              key={kpi.label}
              className="rounded-xl p-3 hover:bg-muted/40 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground leading-tight">
                  {kpi.label}
                </p>
                <div className={cn("flex items-center gap-0.5", getTrendColor(kpi.trend))}>
                  <TrendIcon className="h-3 w-3" />
                  <span className="text-xs font-medium tabular-nums">{kpi.trendValue}</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-lg font-medium text-foreground tabular-nums">{kpi.value}</span>
                <span className="text-xs text-muted-foreground font-medium">/ {kpi.target}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-muted overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    getProgressColor(kpi.progress)
                  )}
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className={cn(
                  "text-xs font-medium tabular-nums",
                  kpi.progress >= 100 ? "text-primary" : kpi.progress >= 80 ? "text-warning" : "text-destructive"
                )}>
                  {kpi.progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KpiTrackerCard;
