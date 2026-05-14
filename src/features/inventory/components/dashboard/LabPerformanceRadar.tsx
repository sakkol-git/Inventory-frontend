import { BarChart3 } from "lucide-react";
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const labPerformance = [
  { metric: "Plant Health", current: 96, target: 95, fullMark: 100 },
  { metric: "Chem Safety", current: 93, target: 100, fullMark: 100 },
  { metric: "Eq. Uptime", current: 95, target: 98, fullMark: 100 },
  { metric: "Throughput", current: 88, target: 85, fullMark: 100 },
  { metric: "Compliance", current: 91, target: 95, fullMark: 100 },
  { metric: "Utilization", current: 82, target: 80, fullMark: 100 },
];

interface RadarEntry {
  metric: string;
  current: number;
  target: number;
}
interface RadarTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RadarEntry }>;
}

const CustomTooltip = ({ active, payload }: RadarTooltipProps) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-card p-3 shadow-md rounded-xl">
      <p className="font-medium text-foreground text-sm mb-1">{data.metric}</p>
      <div className="space-y-0.5">
        <p className="text-xs">
          <span className="text-muted-foreground">Current: </span>
          <span className="font-medium text-primary tabular-nums">
            {data.current}%
          </span>
        </p>
        <p className="text-xs">
          <span className="text-muted-foreground">Target: </span>
          <span className="font-medium text-foreground tabular-nums">
            {data.target}%
          </span>
        </p>
      </div>
    </div>
  );
};

const LabPerformanceRadar = () => {
  const overallScore = Math.round(
    labPerformance.reduce((sum, d) => sum + d.current, 0) /
      labPerformance.length,
  );

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">Lab Performance</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Multi-dimensional analysis
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-medium text-foreground tabular-nums">
            {overallScore}%
          </p>
          <p className="text-xs font-medium text-muted-foreground">Overall</p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={labPerformance}>
            <PolarGrid stroke="hsl(0, 0%, 85%)" strokeOpacity={0.5} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(0, 0%, 45%)" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: "hsl(0, 0%, 60%)" }}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Target"
              dataKey="target"
              stroke="hsl(0, 0%, 60%)"
              fill="hsl(0, 0%, 60%)"
              fillOpacity={0.1}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke="hsl(145, 63%, 32%)"
              fill="hsl(145, 63%, 32%)"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "hsl(145, 63%, 32%)",
                stroke: "hsl(0, 0%, 100%)",
                strokeWidth: 1,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div className="w-4 h-0.5 bg-primary" />
          Current
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div className="w-4 h-0.5 bg-muted-foreground/60 border-t border-dashed border-muted-foreground" />
          Target
        </div>
      </div>
    </div>
  );
};

export default LabPerformanceRadar;
