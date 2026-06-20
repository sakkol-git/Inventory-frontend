import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ArrowLeftRight, Minus, Plus, RotateCcw, type LucideIcon } from "lucide-react";

interface ActivityImgProps { src: string; alt: string; fallback: LucideIcon; className: string }
const ActivityImg = ({ src, alt, fallback: Fallback, className }: ActivityImgProps) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) return <Fallback className={className} />;
  return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setHasError(true)} />;
};

// mock fallback removed

const getActionConfig = (type: string) => {
  switch (type) {
    case "add":
      return {
        icon: Plus,
        bgColor: "bg-muted",
        borderColor: "",
        iconColor: "text-primary",
      };
    case "consume":
      return {
        icon: Minus,
        bgColor: "bg-muted",
        borderColor: "",
        iconColor: "text-warning",
      };
    case "return":
      return {
        icon: RotateCcw,
        bgColor: "bg-muted",
        borderColor: "",
        iconColor: "text-primary",
      };
    case "borrow":
      return {
        icon: ArrowLeftRight,
        bgColor: "bg-muted",
        borderColor: "",
        iconColor: "text-muted-foreground",
      };
    default:
      return {
        icon: ArrowLeftRight,
        bgColor: "bg-muted",
        borderColor: "",
        iconColor: "text-muted-foreground",
      };
  }
};

import { useDashboardData } from "@/features/inventory/services/dashboardService";
import { formatDistanceToNow } from "date-fns";

const RecentActivityCard = () => {
  const { data } = useDashboardData();
  const activities = data?.recent_transactions || [];

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
          <h3 className="section-title text-foreground">Recent Activity</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border font-medium text-xs"
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const config = getActionConfig(activity.action);
          const Icon = config.icon;
          const timeAgo = activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : "Unknown time";

          return (
            <div
              key={activity.id ?? index}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Item Image */}
              <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                <Icon className={cn("h-5 w-5", config.iconColor)} />
              </div>

              {/* Action Icon Badge */}
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-xl shrink-0 self-center",
                  config.bgColor,
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", config.iconColor)} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-medium">{activity.user?.name || "System"}</span>{" "}
                  <span className="text-muted-foreground">
                    {activity.action}
                  </span>{" "}
                  <span className="font-medium">{activity.item?.type} #{activity.item?.id}</span>
                  {activity.quantity && (
                    <span className="text-muted-foreground font-medium">
                      {" "}
                      ({activity.quantity})
                    </span>
                  )}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1 tracking-wide">
                  {timeAgo}
                </p>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;
