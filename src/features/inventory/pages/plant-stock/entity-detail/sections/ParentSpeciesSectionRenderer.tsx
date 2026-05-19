// ═══════════════════════════════════════════════════════════════════════════
// PARENT SPECIES SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { ParentSpeciesSection } from "../types";

interface Props {
  section: ParentSpeciesSection;
}

const ParentSpeciesSectionRenderer = ({ section }: Props) => {
  const navigate = useNavigate();

  return (
    <SectionCard title={section.title} icon={section.icon}>
      <button
        className="w-full flex items-center justify-between p-3 rounded-lg hover:border-primary hover:bg-muted/40 transition-all"
        onClick={() => navigate(section.href)}
      >
        <div className="text-left">
          <p className="text-sm font-medium">{section.commonName}</p>
          <p className="text-xs text-muted-foreground italic">
            {section.scientificName}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </SectionCard>
  );
};

export default ParentSpeciesSectionRenderer;
