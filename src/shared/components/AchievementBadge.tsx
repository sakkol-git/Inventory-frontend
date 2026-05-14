import { cn } from "@/shared/lib/utils";
import { Award, type LucideIcon } from "lucide-react";

type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

interface AchievementBadgeProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  tier?: BadgeTier;
  earned?: boolean;
  earnedDate?: string;
  className?: string;
}

const TIER_STYLES: Record<BadgeTier, { bg: string; border: string; icon: string; glow: string }> = {
  bronze: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-700",
    icon: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-200/30 dark:shadow-amber-800/20",
  },
  silver: {
    bg: "bg-slate-50 dark:bg-slate-900/30",
    border: "border-slate-300 dark:border-slate-600",
    icon: "text-slate-500 dark:text-slate-300",
    glow: "shadow-slate-200/30 dark:shadow-slate-700/20",
  },
  gold: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-400 dark:border-yellow-600",
    icon: "text-yellow-500 dark:text-yellow-400",
    glow: "shadow-yellow-200/30 dark:shadow-yellow-700/20",
  },
  platinum: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-400 dark:border-violet-600",
    icon: "text-violet-500 dark:text-violet-400",
    glow: "shadow-violet-200/30 dark:shadow-violet-700/20",
  },
};

/**
 * Achievement/gamification badge component.
 * Displays earned lab achievements with tier-based styling.
 */
const AchievementBadge = ({
  icon: Icon = Award,
  title,
  description,
  tier = "bronze",
  earned = true,
  earnedDate,
  className,
}: AchievementBadgeProps) => {
  const styles = TIER_STYLES[tier];

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border p-4 transition-all",
        earned
          ? cn(styles.bg, styles.border, "hover-lift shadow-md", styles.glow)
          : "bg-muted/30 border-border opacity-50 grayscale",
        className
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          earned ? cn(styles.bg, styles.icon) : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold text-sm", !earned && "text-muted-foreground")}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {description}
          </p>
        )}
        {earned && earnedDate && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Earned {earnedDate}
          </p>
        )}
      </div>

      {earned && (
        <div className={cn("absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full", {
          "bg-amber-500": tier === "bronze",
          "bg-slate-400": tier === "silver",
          "bg-yellow-400": tier === "gold",
          "bg-violet-500": tier === "platinum",
        })} />
      )}
    </div>
  );
};

export default AchievementBadge;
export type { AchievementBadgeProps, BadgeTier };
