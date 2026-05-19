// ═══════════════════════════════════════════════════════════════════════════
// CHEMICAL DETAIL — Domain Types & Configuration Contracts
// ═══════════════════════════════════════════════════════════════════════════

import type { LucideIcon } from "lucide-react";

export type {
    ActionButton,
    DetailHeaderConfig,
    HeroImageConfig, InfoField, KpiStat
} from "@/shared/components/detail/detail-types";

import type {
    ActionButton,
    DetailHeaderConfig,
    HeroImageConfig,
    InfoField,
    KpiStat,
} from "@/shared/components/detail/detail-types";

// ─── Section Configurations (Discriminated Union) ────────────────────────

export interface ChemicalPropertiesSection {
  readonly kind: "chemical-properties";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
}

export interface SafetyHazardSection {
  readonly kind: "safety-hazard";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
  ghsTags: string[];
  notes: string | null;
}

export interface StorageRequirementsSection {
  readonly kind: "storage-requirements";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
}

export interface DatesSection {
  readonly kind: "dates";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
}

export type DetailSection =
  | ChemicalPropertiesSection
  | SafetyHazardSection
  | StorageRequirementsSection
  | DatesSection;

// ─── Page-Level Configuration ────────────────────────────────────────────

export interface ChemicalPageConfig {
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
