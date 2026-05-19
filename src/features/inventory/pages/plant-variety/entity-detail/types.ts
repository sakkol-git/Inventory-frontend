// ═══════════════════════════════════════════════════════════════════════════
// PLANT VARIETY DETAIL — Domain Types & Configuration Contracts
// ═══════════════════════════════════════════════════════════════════════════

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type {
    ActionButton,
    DetailHeaderConfig,
    HeroImageConfig,
    InfoField,
    KpiStat
} from "@/shared/components/detail/detail-types";

import type {
    ActionButton,
    DetailHeaderConfig,
    HeroImageConfig,
    InfoField,
    KpiStat,
} from "@/shared/components/detail/detail-types";

// ─── Section Configurations (Discriminated Union) ────────────────────────

export interface VarietyInfoSection {
  readonly kind: "variety-info";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
  statusBadge: ReactNode;
}

export interface NotesSection {
  readonly kind: "notes";
  title: string;
  icon: LucideIcon;
  content: string;
}

// ─── Combined Section Union ──────────────────────────────────────────────

export type DetailSection = VarietyInfoSection | NotesSection;

// ─── Page Configuration ──────────────────────────────────────────────────

export interface VarietyPageConfig {
  header: DetailHeaderConfig;
  heroImage: HeroImageConfig | null;
  kpiStrip: KpiStat[];
  actions: ActionButton[];
  mainSections: DetailSection[];
  sidebarSections: DetailSection[];
}

// ─── Registry Contract ───────────────────────────────────────────────────

export type SectionRendererMap = {
  [K in DetailSection["kind"]]: React.ComponentType<{
    section: Extract<DetailSection, { kind: K }>;
  }>;
};
