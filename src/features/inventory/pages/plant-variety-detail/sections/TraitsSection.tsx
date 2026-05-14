// ═══════════════════════════════════════════════════════════════════════════
// TRAITS SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import { Badge } from "@/components/ui/badge";
import type { TraitsSection } from "../types";

interface Props {
  section: TraitsSection;
}

const TraitsSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="flex flex-wrap gap-2">
      {section.traits.map((trait, idx) => (
        <Badge key={idx} variant="secondary" className="text-sm">
          {trait}
        </Badge>
      ))}
    </div>
  </SectionCard>
);

export default TraitsSectionRenderer;
