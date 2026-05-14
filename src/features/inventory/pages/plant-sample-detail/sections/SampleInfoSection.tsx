// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE INFO SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { InfoRow, SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { SampleInfoSection } from "../types";

interface Props {
  section: SampleInfoSection;
}

const SampleInfoSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {section.fields.map((field) => (
        <InfoRow
          key={field.label}
          label={field.label}
          value={field.value}
          mono={field.mono}
        />
      ))}
    </div>
    {section.statusBadge && (
      <div className="mt-4 pt-4 border-t border-border">
        <InfoRow label="Status" value={section.statusBadge} />
      </div>
    )}
  </SectionCard>
);

export default SampleInfoSectionRenderer;
