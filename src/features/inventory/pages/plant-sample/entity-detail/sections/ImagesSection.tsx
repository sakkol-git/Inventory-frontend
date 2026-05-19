// ═══════════════════════════════════════════════════════════════════════════
// IMAGES SECTION RENDERER
// ═══════════════════════════════════════════════════════════════════════════

import { SectionCard } from "@/shared/components/detail/DetailPageShell";
import type { ImagesSection } from "../types";

interface Props {
  section: ImagesSection;
}

const ImagesSectionRenderer = ({ section }: Props) => (
  <SectionCard title={section.title} icon={section.icon}>
    <div className="grid grid-cols-2 gap-2">
      {section.images.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt={`Sample ${idx + 1}`}
          className="rounded-md w-full h-32 object-cover"
        />
      ))}
    </div>
  </SectionCard>
);

export default ImagesSectionRenderer;
