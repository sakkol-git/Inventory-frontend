// ═══════════════════════════════════════════════════════════════════════════
// HEALTH SCORE SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { HealthScoreSection } from "../types";

interface Props {
  section: HealthScoreSection;
}

const HealthScoreSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="flex items-center gap-4 mb-2">
      <Progress value={section.score} className="flex-1 h-3" />
      <span className="text-lg font-medium font-mono">{section.score}%</span>
    </div>
    <p className="text-xs text-muted-foreground">{section.description}</p>
  </SectionCard>
);

export default HealthScoreSectionRenderer;
