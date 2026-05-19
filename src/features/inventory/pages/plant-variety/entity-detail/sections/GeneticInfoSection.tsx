// ═══════════════════════════════════════════════════════════════════════════
// GENETIC INFO SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { InfoRow, SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { GeneticInfoSection } from "../types";

interface Props {
  section: GeneticInfoSection;
}

const GeneticInfoSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="space-y-3">
      {section.fields.map((field) => (
        <InfoRow
          key={field.label}
          label={field.label}
          value={field.value}
          mono={field.mono}
        />
      ))}
    </div>
  </SectionCard>
);

export default GeneticInfoSectionRenderer;
