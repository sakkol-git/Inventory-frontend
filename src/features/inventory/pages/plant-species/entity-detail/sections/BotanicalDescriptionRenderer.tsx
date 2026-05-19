// ═══════════════════════════════════════════════════════════════════════════
// BOTANICAL DESCRIPTION SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { SectionCard, InfoRow } from "@/shared/components/detail/DetailPageShell";
import type { BotanicalDescriptionSection } from "../types";

interface Props {
  section: BotanicalDescriptionSection;
}

const BotanicalDescriptionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <p className="text-sm text-foreground leading-relaxed">
      {section.description}
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
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

export default BotanicalDescriptionRenderer;
