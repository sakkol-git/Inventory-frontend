import { Lightbulb, AlertTriangle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Insight {
  id: string;
  type: "anomaly" | "trend" | "recommendation" | "alert";
  title: string;
  description: string;
  metric?: string;
  confidence: number;
  timestamp: string;
}

const insights: Insight[] = [
  {
    id: "1",
    type: "anomaly",
    title: "Unusual failure rate spike",
    description: "Soybean batch PB-006 showed 100% failure — significantly higher than the 3.4% baseline. Possible contamination.",
    metric: "100% vs 3.4% avg",
    confidence: 94,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "trend",
    title: "Ethanol consumption accelerating",
    description: "Ethanol 95% usage rate has increased 35% over the past 4 weeks. Current stock will be depleted by Feb 19.",
    metric: "+35% usage",
    confidence: 88,
    timestamp: "Today",
  },
  {
    id: "3",
    type: "recommendation",
    title: "Reorder Sodium Hydroxide",
    description: "NaOH expires Feb 12 with only 700 mL remaining. Based on consumption patterns, reorder 5L within 3 days.",
    metric: "7 days to expiry",
    confidence: 92,
    timestamp: "Today",
  },
  {
    id: "4",
    type: "alert",
    title: "Centrifuge overdue for service",
    description: "EQ-004 has been in maintenance for 12 days, exceeding the 5-day average repair window by 140%.",
    metric: "12 days in repair",
    confidence: 97,
    timestamp: "Ongoing",
  },
];

const getInsightConfig = (type: Insight["type"]) => {
  switch (type) {
    case "anomaly":
      return {
        icon: AlertTriangle,
        color: "text-destructive",
        bg: "bg-muted",
        border: "",
        label: "Anomaly",
      };
    case "trend":
      return {
        icon: TrendingUp,
        color: "text-warning",
        bg: "bg-muted",
        border: "",
        label: "Trend",
      };
    case "recommendation":
      return {
        icon: Lightbulb,
        color: "text-primary",
        bg: "bg-muted",
        border: "",
        label: "Suggestion",
      };
    case "alert":
      return {
        icon: AlertTriangle,
        color: "text-destructive",
        bg: "bg-muted",
        border: "",
        label: "Alert",
      };
  }
};

const AiInsightsCard = () => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">AI Insights</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Automated pattern detection
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-accent bg-muted px-2 py-1 rounded-xl">
          {insights.length} new
        </span>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const config = getInsightConfig(insight.type);
          const Icon = config.icon;
          return (
            <div
              key={insight.id}
              className={cn(
                "rounded-xl p-4 hover:bg-muted/40 transition-all cursor-pointer group animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-xl shrink-0",
                    config.bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded-xl",
                        config.bg,
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {insight.timestamp}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium tabular-nums ml-auto">
                      {insight.confidence}% conf.
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                  {insight.metric && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-xs font-medium", config.color)}>{insight.metric}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AiInsightsCard;
