import { cn } from "@/shared/lib/utils";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const monthlyData = [
  { month: "Aug", healthy: 820, growing: 95, failed: 18, total: 933 },
  { month: "Sep", healthy: 870, growing: 110, failed: 22, total: 1002 },
  { month: "Oct", healthy: 920, growing: 88, failed: 30, total: 1038 },
  { month: "Nov", healthy: 975, growing: 102, failed: 35, total: 1112 },
  { month: "Dec", healthy: 1020, growing: 95, failed: 38, total: 1153 },
  { month: "Jan", healthy: 1060, growing: 108, failed: 40, total: 1208 },
  { month: "Feb", healthy: 1089, growing: 116, failed: 42, total: 1247 },
];

const weeklyData = [
  { month: "W1", healthy: 1045, growing: 100, failed: 39, total: 1184 },
  { month: "W2", healthy: 1055, growing: 105, failed: 40, total: 1200 },
  { month: "W3", healthy: 1070, growing: 110, failed: 41, total: 1221 },
  { month: "W4", healthy: 1080, growing: 113, failed: 41, total: 1234 },
  { month: "W5", healthy: 1089, growing: 116, failed: 42, total: 1247 },
];

type TimeRange = "weekly" | "monthly";

interface GrowthEntry {
  dataKey: string;
  value: number;
  color?: string;
}
interface GrowthTooltipProps {
  active?: boolean;
  payload?: GrowthEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: GrowthTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card p-3 shadow-md rounded-xl">
      <p className="font-medium text-foreground text-sm mb-2">{label}</p>
      {payload.map((entry: GrowthEntry) => (
        <div
          key={entry.dataKey}
          className="flex items-center gap-2 text-xs mb-1"
        >
          <div
            className="w-2.5 h-2.5"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground capitalize">
            {entry.dataKey}:
          </span>
          <span className="font-medium text-foreground tabular-nums">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const GrowthTrendsChart = () => {
  const [range, setRange] = useState<TimeRange>("monthly");
  const data = range === "monthly" ? monthlyData : weeklyData;

  const growth =
    data.length >= 2
      ? Math.round(
          ((data[data.length - 1].total - data[0].total) / data[0].total) * 100,
        )
      : 0;

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">Growth Trends</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Plant inventory over time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary bg-muted px-2 py-1 rounded-xl">
            +{growth}%
          </span>
          <div className="flex rounded-xl">
            {(["weekly", "monthly"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {r === "weekly" ? "5W" : "7M"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="healthyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(145, 63%, 32%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(145, 63%, 32%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="growingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(38, 92%, 50%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(38, 92%, 50%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(0, 72%, 51%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(0, 72%, 51%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0, 0%, 85%)"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fontWeight: 600, fill: "hsl(0, 0%, 45%)" }}
              axisLine={{ stroke: "hsl(0, 0%, 15%)", strokeWidth: 2 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontWeight: 600, fill: "hsl(0, 0%, 45%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="healthy"
              stroke="hsl(145, 63%, 32%)"
              strokeWidth={2}
              fill="url(#healthyGrad)"
              dot={{ r: 3, strokeWidth: 2, fill: "hsl(0, 0%, 100%)" }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="growing"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fill="url(#growingGrad)"
              dot={{ r: 3, strokeWidth: 2, fill: "hsl(0, 0%, 100%)" }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="failed"
              stroke="hsl(0, 72%, 51%)"
              strokeWidth={2}
              fill="url(#failedGrad)"
              dot={{ r: 3, strokeWidth: 2, fill: "hsl(0, 0%, 100%)" }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border">
        {[
          { label: "Healthy", color: "bg-primary" },
          { label: "Growing", color: "bg-warning" },
          { label: "Failed", color: "bg-destructive" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            <div className={cn("w-2.5 h-2.5", item.color)} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrowthTrendsChart;
