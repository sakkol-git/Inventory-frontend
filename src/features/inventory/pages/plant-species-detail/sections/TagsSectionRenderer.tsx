// ═══════════════════════════════════════════════════════════════════════════
// TAGS SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { TagsSection } from "../types";

interface Props {
  section: TagsSection;
}

const TagsSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="flex flex-wrap gap-2">
      {section.tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs font-medium">
          {tag}
        </Badge>
      ))}
    </div>
  </SectionCard>
);

export default TagsSectionRenderer;
