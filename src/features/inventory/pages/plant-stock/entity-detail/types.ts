// ═══════════════════════════════════════════════════════════════════════════
// PLANT STOCK DETAIL — Domain Types & Configuration Contracts
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

export interface BatchInfoSection {
  readonly kind: "batch-info";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
  statusBadge: ReactNode;
  notes: string | null;
}

export interface ParentSpeciesSection {
  readonly kind: "parent-species";
  title: string;
  icon: LucideIcon;
  commonName: string;
  scientificName: string;
  href: string;
}

export interface QuickInfoSection {
  readonly kind: "quick-info";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
}

export type DetailSection =
  | BatchInfoSection
  | ParentSpeciesSection
  | QuickInfoSection;

// ─── Page-Level Configuration ────────────────────────────────────────────

export interface StockPageConfig {
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
