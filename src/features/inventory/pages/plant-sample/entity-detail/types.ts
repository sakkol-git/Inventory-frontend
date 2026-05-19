// ═══════════════════════════════════════════════════════════════════════════
// PLANT SAMPLE DETAIL — Domain Types & Configuration Contracts
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

export interface SampleInfoSection {
  readonly kind: "sample-info";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
  statusBadge: ReactNode;
}

export interface OwnershipSection {
  readonly kind: "ownership";
  title: string;
  icon: LucideIcon;
  fields: InfoField[];
}

export interface StorageSection {
  readonly kind: "storage";
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

// ─── Combined Section Union ──────────────────────────────────────────────

export type DetailSection =
  | SampleInfoSection
  | OwnershipSection
  | StorageSection
  | NotesSection;

// ─── Page Configuration ──────────────────────────────────────────────────

export interface SamplePageConfig {
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
