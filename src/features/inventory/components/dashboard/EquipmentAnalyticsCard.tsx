import { cn } from "@/shared/lib/utils";
import { Wrench } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const categoryData = [
  { name: "Optics", value: 12, color: "hsl(145, 63%, 32%)" },
  { name: "Sterilization", value: 8, color: "hsl(175, 65%, 35%)" },
  { name: "Measurement", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Processing", value: 10, color: "hsl(0, 72%, 51%)" },
  { name: "Analysis", value: 18, color: "hsl(210, 20%, 50%)" },
  { name: "Molecular", value: 14, color: "hsl(270, 50%, 50%)" },
  { name: "Plant Growth", value: 12, color: "hsl(80, 50%, 40%)" },
];

const total = categoryData.reduce((sum, d) => sum + d.value, 0);

const utilizationData = [
  { month: "Sep", rate: 72 },
  { month: "Oct", rate: 78 },
  { month: "Nov", rate: 81 },
  { month: "Dec", rate: 74 },
  { month: "Jan", rate: 85 },
  { month: "Feb", rate: 82 },
];

interface CategoryItem {
  name: string;
  value: number;
  color: string;
}
interface EquipTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CategoryItem }>;
}

const CustomTooltip = ({ active, payload }: EquipTooltipProps) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card p-3 shadow-md rounded-xl">
      <p className="font-medium text-foreground text-sm">{data.name}</p>
      <p className="text-xs text-muted-foreground mt-1">
        <span className="font-medium text-foreground tabular-nums">
          {data.value}
        </span>{" "}
        units ({Math.round((data.value / total) * 100)}%)
      </p>
    </div>
  );
};

const EquipmentAnalyticsCard = () => {
  const avgUtilization = Math.round(
    utilizationData.reduce((sum, d) => sum + d.rate, 0) /
      utilizationData.length,
  );
  const maxRate = Math.max(...utilizationData.map((d) => d.rate));

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">
              Equipment Analytics
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Category distribution & utilization
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {total} total
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            By Category
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="hsl(0, 0%, 15%)"
                  strokeWidth={1}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Mini Legend */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            {categoryData.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
              >
                <div
                  className="w-2 h-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Utilization Sparklines */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Utilization Rate
          </p>
          <div className="flex items-end gap-0 mb-3 mt-1">
            <span className="text-4xl font-medium text-foreground tabular-nums leading-none">
              {avgUtilization}
            </span>
            <span className="text-lg font-medium text-muted-foreground mb-0.5">
              %
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mb-4">
            Average over 6 months
          </p>

          {/* Sparkline bars */}
          <div className="flex items-end gap-2 h-24">
            {utilizationData.map((d, i) => (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "w-full transition-all rounded-sm",
                    d.rate >= 80
                      ? "bg-primary"
                      : d.rate >= 70
                        ? "bg-warning"
                        : "bg-muted-foreground/40",
                  )}
                  style={{ height: `${(d.rate / maxRate) * 100}%` }}
                />
                <span className="text-[9px] font-medium text-muted-foreground">
                  {d.month.slice(0, 1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentAnalyticsCard;
