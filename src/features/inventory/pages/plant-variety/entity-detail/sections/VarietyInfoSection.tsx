// ═══════════════════════════════════════════════════════════════════════════
// VARIETY INFO SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { InfoRow, SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { VarietyInfoSection } from "../types";

interface Props {
  section: VarietyInfoSection;
}

const VarietyInfoSectionRenderer = ({ section }: Props) => (
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

export default VarietyInfoSectionRenderer;
