import { SectionCard, InfoRow } from "@/shared/components/detail/DetailPageShell";
import type { ChemicalPropertiesSection } from "../types";

interface Props {
  section: ChemicalPropertiesSection;
}

const ChemicalPropertiesRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {section.fields.map((f) => (
        <InfoRow key={f.label} label={f.label} value={f.value} mono={f.mono} />
      ))}
    </div>
  </SectionCard>
);

export default ChemicalPropertiesRenderer;
