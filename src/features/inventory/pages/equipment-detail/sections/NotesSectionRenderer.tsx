// ═══════════════════════════════════════════════════════════════════════════
// NOTES SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { NotesSection } from "../types";

interface Props {
  section: NotesSection;
}

const NotesSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <p className="text-sm text-foreground leading-relaxed">{section.content}</p>
  </SectionCard>
);

export default NotesSectionRenderer;
