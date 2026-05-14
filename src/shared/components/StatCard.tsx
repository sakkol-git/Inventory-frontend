import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, subtitle, icon, trend, className }: StatCardProps) => {
  return (
    <div className={cn(
      "bg-card rounded-xl p-5 border border-border/60 shadow-md hover-lift transition-colors duration-150",
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-normal text-muted-foreground/70 mb-2 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-medium text-foreground tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-2 mt-3 px-2.5 py-1 text-xs font-medium rounded-lg",
              trend.positive 
                ? "bg-primary/10 text-primary" 
                : "bg-destructive/10 text-destructive"
            )}>
              {trend.positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend.positive ? "+" : "-"}{trend.value}% {trend.label}
            </div>
          )}
        </div>
        <div className="text-muted-foreground/50">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;