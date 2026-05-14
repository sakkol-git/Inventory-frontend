// ═══════════════════════════════════════════════════════════════════════════
// SPECIFICATIONS SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { SectionCard, InfoRow } from "@/shared/components/detail/DetailPageShell";
import type { SpecificationsSection } from "../types";

interface Props {
  section: SpecificationsSection;
}

const SpecificationsSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
      {section.coreFields.map((field) => (
        <InfoRow
          key={field.label}
          label={field.label}
          value={field.value}
          mono={field.mono}
        />
      ))}
    </div>
    {section.specifications.length > 0 && (
      <div className="border-t border-border pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {section.specifications.map((spec) => (
            <div
              key={spec.label}
              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {spec.label}
              </span>
              <span className="text-xs font-mono text-foreground">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </SectionCard>
);

export default SpecificationsSectionRenderer;
