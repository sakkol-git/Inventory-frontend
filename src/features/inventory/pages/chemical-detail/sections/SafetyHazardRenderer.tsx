import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard, InfoRow } from "@/shared/components/detail/DetailPageShell";
import type { SafetyHazardSection } from "../types";

interface Props {
  section: SafetyHazardSection;
}

const SafetyHazardRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
      {section.fields.map((f) => (
        <InfoRow key={f.label} label={f.label} value={f.value} mono={f.mono} />
      ))}
      <InfoRow
        label="GHS Pictograms"
        value={
          section.ghsTags.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {section.ghsTags.map((g) => (
                <Badge key={g} variant="outline" className="text-xs font-mono">
                  {g}
                </Badge>
              ))}
            </div>
          ) : (
            "None"
          )
        }
      />
    </div>
    {section.notes && (
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">{section.notes}</p>
        </div>
      </div>
    )}
  </SectionCard>
);

export default SafetyHazardRenderer;
