// ═══════════════════════════════════════════════════════════════════════════
// BATCH INFO SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { SectionCard, InfoRow } from "@/shared/components/detail/DetailPageShell";
import type { BatchInfoSection } from "../types";

interface Props {
  section: BatchInfoSection;
}

const BatchInfoSectionRenderer = ({ section }: Props) => (
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
    <div className="mt-4 pt-4 border-t border-border">
      <InfoRow label="Status" value={section.statusBadge} />
    </div>
    {section.notes && (
      <div className="mt-4 pt-4 border-t border-border">
        <InfoRow label="Notes" value={section.notes} />
      </div>
    )}
  </SectionCard>
);

export default BatchInfoSectionRenderer;
