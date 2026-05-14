// ═══════════════════════════════════════════════════════════════════════════
// LOCATION & STATUS SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { SectionCard, InfoRow } from "@/shared/components/detail/DetailPageShell";
import type { LocationStatusSection } from "../types";

interface Props {
  section: LocationStatusSection;
}

const LocationStatusSectionRenderer = ({ section }: Props) => (
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

export default LocationStatusSectionRenderer;
