// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT DETAIL — Domain Types & Configuration Contracts
// ═══════════════════════════════════════════════════════════════════════════

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

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

// ─── Domain-Specific Data Shapes ─────────────────────────────────────────

export interface StatusAlert {
  icon: LucideIcon;
  borderClass: string;
  bgClass: string;
  title: ReactNode;
  subtitle: string;
}

// ─── Section Configurations (Discriminated Union) ────────────────────────

export interface SpecificationsSection {
  readonly kind: "specifications";
  title: string;
  icon: LucideIcon;
  coreFields: InfoField[];
  specifications: { label: string; value: string }[];
}

export interface FinancialSection {
  readonly kind: "financial";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
}

export interface LocationStatusSection {
  readonly kind: "location-status";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
}

export interface NotesSection {
  readonly kind: "notes";
  title: string;
  icon: LucideIcon;
  content: string;
}

export type DetailSection =
  | SpecificationsSection
  | FinancialSection
  | LocationStatusSection
  | NotesSection;

// ─── Page-Level Configuration ────────────────────────────────────────────

export interface EquipmentPageConfig {
  header: DetailHeaderConfig;
  heroImage: HeroImageConfig | null;
  kpiStrip: KpiStat[];
  alerts: StatusAlert[];
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
