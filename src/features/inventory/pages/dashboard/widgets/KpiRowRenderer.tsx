import StatCard from "@/shared/components/StatCard";
import type { KpiRowWidget } from "../types";

interface KpiRowRendererProps {
  config: KpiRowWidget;
}

const KpiRowRenderer = ({ config }: KpiRowRendererProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    {config.stats.map((stat) => (
      <StatCard
        key={stat.title}
        title={stat.title}
        value={stat.value}
        subtitle={stat.subtitle}
        icon={stat.icon}
        trend={stat.trend}
      />
    ))}
  </div>
);

export default KpiRowRenderer;
