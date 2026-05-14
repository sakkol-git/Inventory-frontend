import { FlaskConical } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const consumptionData = [
  { name: "NaOH", used: 1800, remaining: 700, unit: "mL" },
  { name: "HCl", used: 650, remaining: 350, unit: "mL" },
  { name: "Ethanol", used: 3200, remaining: 1800, unit: "mL" },
  { name: "Agar", used: 320, remaining: 180, unit: "g" },
  { name: "MS Medium", used: 600, remaining: 400, unit: "g" },
  { name: "H₃PO₄", used: 400, remaining: 100, unit: "mL" },
  { name: "KNO₃", used: 800, remaining: 1200, unit: "g" },
];

interface ChemEntry {
  used: number;
  remaining: number;
  unit: string;
}
interface ChemTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChemEntry }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: ChemTooltipProps) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-card p-3 shadow-md rounded-xl">
      <p className="font-medium text-foreground text-sm mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 bg-warning" />
          <span className="text-muted-foreground">Used:</span>
          <span className="font-medium text-foreground tabular-nums">
            {data.used.toLocaleString()} {data.unit}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 bg-primary" />
          <span className="text-muted-foreground">Remaining:</span>
          <span className="font-medium text-foreground tabular-nums">
            {data.remaining.toLocaleString()} {data.unit}
          </span>
        </div>
      </div>
    </div>
  );
};

const ChemicalUsageChart = () => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="section-title text-foreground">Chemical Usage</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Consumption vs remaining stock
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={consumptionData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            barGap={0}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0, 0%, 85%)"
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="name"
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
            <Bar
              dataKey="used"
              stackId="a"
              fill="hsl(38, 92%, 50%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="remaining"
              stackId="a"
              fill="hsl(145, 63%, 32%)"
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div className="w-2.5 h-2.5 bg-warning" />
          Used
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div className="w-2.5 h-2.5 bg-primary" />
          Remaining
        </div>
      </div>
    </div>
  );
};

export default ChemicalUsageChart;
