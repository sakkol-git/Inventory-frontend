// ═══════════════════════════════════════════════════════════════════════════
// CARE REQUIREMENTS SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { SectionCard, InfoRow } from "@/shared/components/detail/DetailPageShell";
import type { CareRequirementsSection } from "../types";

interface Props {
  section: CareRequirementsSection;
}

const CareRequirementsRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="space-y-4">
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

export default CareRequirementsRenderer;
