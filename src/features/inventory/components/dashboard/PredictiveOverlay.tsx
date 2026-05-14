import { Brain, TrendingUp } from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const historicalData = [
  { month: "Jun", actual: 880 },
  { month: "Jul", actual: 910 },
  { month: "Aug", actual: 933 },
  { month: "Sep", actual: 1002 },
  { month: "Oct", actual: 1038 },
  { month: "Nov", actual: 1112 },
  { month: "Dec", actual: 1153 },
  { month: "Jan", actual: 1208 },
  { month: "Feb", actual: 1247, predicted: 1247 },
  { month: "Mar", predicted: 1310 },
  { month: "Apr", predicted: 1380 },
  { month: "May", predicted: 1445 },
];

const confidenceBand = [
  { month: "Feb", upper: 1247, lower: 1247 },
  { month: "Mar", upper: 1365, lower: 1255 },
  { month: "Apr", upper: 1460, lower: 1300 },
  { month: "May", upper: 1550, lower: 1340 },
];

interface PredEntry {
  dataKey: string;
  value: number;
  stroke?: string;
  color?: string;
}
interface PredTooltipProps {
  active?: boolean;
  payload?: PredEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: PredTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card p-3 shadow-md rounded-xl">
      <p className="font-medium text-foreground text-sm mb-2">{label}</p>
      {payload.map((entry: PredEntry) => (
        <div
          key={entry.dataKey}
          className="flex items-center gap-2 text-xs mb-0.5"
        >
          <div
            className="w-2.5 h-2.5"
            style={{ backgroundColor: entry.stroke || entry.color }}
          />
          <span className="text-muted-foreground capitalize">
            {entry.dataKey}:
          </span>
          <span className="font-medium text-foreground tabular-nums">
            {entry.value?.toLocaleString() ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

const PredictiveOverlay = () => {
  const predictedGrowth = historicalData[historicalData.length - 1].predicted
    ? Math.round(
        ((historicalData[historicalData.length - 1].predicted! -
          historicalData.find((d) => d.actual && !d.predicted)!.actual!) /
          historicalData.find((d) => d.actual && !d.predicted)!.actual!) *
          100,
      )
    : 0;

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">
              Predictive Forecast
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              3-month inventory projection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-accent bg-muted px-2 py-1 rounded-xl">
            AI Model
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={historicalData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(175, 65%, 35%)"
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(175, 65%, 35%)"
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
              domain={["dataMin - 50", "dataMax + 50"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x="Feb"
              stroke="hsl(0, 0%, 60%)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: "Today",
                position: "top",
                fontSize: 10,
                fontWeight: 700,
                fill: "hsl(0, 0%, 45%)",
              }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(145, 63%, 32%)"
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 2, fill: "hsl(0, 0%, 100%)" }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(175, 65%, 35%)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{
                r: 3,
                strokeWidth: 2,
                fill: "hsl(0, 0%, 100%)",
                stroke: "hsl(175, 65%, 35%)",
              }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <div className="w-5 h-0.5 bg-primary" />
            Actual
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <div className="w-5 h-0.5 bg-accent border-t border-dashed border-accent" />
            Predicted
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-accent">
          <TrendingUp className="h-3 w-3" />+{predictedGrowth}% projected by May
        </div>
      </div>
    </div>
  );
};

export default PredictiveOverlay;
