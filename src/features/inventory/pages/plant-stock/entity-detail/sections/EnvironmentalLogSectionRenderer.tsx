// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENTAL LOG SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { Thermometer, Droplets, Sun } from "lucide-react";
import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { EnvironmentalLogSection } from "../types";

interface Props {
  section: EnvironmentalLogSection;
}

const EnvironmentalLogSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    {section.readings.length === 0 ? (
      <p className="text-sm text-muted-foreground italic">
        No environmental data available.
      </p>
    ) : (
      <div className="space-y-3">
        {section.readings.map((e, i) => (
          <div key={i} className="p-3 bg-muted/30 rounded-lg space-y-1">
            <p className="text-xs font-mono text-muted-foreground">{e.date}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <span className="flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                {e.temp}
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                {e.humidity}
              </span>
              <span className="flex items-center gap-1">
                <Sun className="h-3 w-3" />
                {e.light}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </SectionCard>
);

export default EnvironmentalLogSectionRenderer;
