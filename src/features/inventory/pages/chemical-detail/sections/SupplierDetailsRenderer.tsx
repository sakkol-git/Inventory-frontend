import { SectionCard, InfoRow } from "@/shared/components/detail/DetailPageShell";
import type { SupplierDetailsSection } from "../types";

interface Props {
  section: SupplierDetailsSection;
}

const SupplierDetailsRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="space-y-3">
      {section.fields.map((f) => (
        <InfoRow key={f.label} label={f.label} value={f.value} mono={f.mono} />
      ))}
    </div>
  </SectionCard>
);

export default SupplierDetailsRenderer;
