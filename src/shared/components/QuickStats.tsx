/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QuickStats — A responsive row of colored stat boxes.
 *
 * Fixes: FLAW wrapping/overflow on mobile, adds responsive grid.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/shared/lib/utils";
import { CountUp } from "./CountUp";

interface Stat {
  label: string;
  value: number | string;
  color: "primary" | "warning" | "destructive" | "muted" | "success" | "info";
}

interface QuickStatsProps {
  stats: Stat[];
  className?: string;
  /** Animate numeric values with CountUp (default: true) */
  animate?: boolean;
}

const colorMap: Record<Stat["color"], string> = {
  primary: "bg-primary/5 border-primary/10 text-primary",
  warning: "bg-warning/5 border-warning/10 text-warning",
  destructive: "bg-destructive/5 border-destructive/10 text-destructive",
  success: "bg-success/5 border-success/10 text-success",
  info: "bg-info/5 border-info/10 text-info",
  muted: "bg-muted/30 border-border/50 text-muted-foreground",
};

const QuickStats = ({ stats, className, animate = true }: QuickStatsProps) => (
  <div
    className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}
    role="group"
    aria-label="Quick statistics"
  >
    {stats.map((stat) => (
      <div key={stat.label} className={cn("stat-card", colorMap[stat.color])}>
        <p className="stat-value">
          {animate && typeof stat.value === "number" ? (
            <CountUp end={stat.value} duration={800} />
          ) : (
            stat.value
          )}
        </p>
        <p className="stat-label">{stat.label}</p>
      </div>
    ))}
  </div>
);

export { QuickStats, type Stat };
