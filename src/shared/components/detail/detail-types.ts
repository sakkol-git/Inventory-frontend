// ═══════════════════════════════════════════════════════════════════════════
// SHARED DETAIL PAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════
//
// Single source of truth for atomic shapes shared by ALL detail pages.
// Each page's local `types.ts` re-exports these and adds its own
// domain-specific section union + page config.
//
// Previously duplicated identically in 6 separate `types.ts` files.
// ═══════════════════════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// ─── Atomic Data Shapes ──────────────────────────────────────────────────

export interface KpiStat {
  label: string;
  value: ReactNode;
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export interface InfoField {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

export interface ActionButton {
  label: string;
  icon: LucideIcon;
  variant: "default" | "outline";
  className?: string;
  ariaLabel: string;
  onClick?: () => void;
  href?: string;
}

// ─── Header & Hero ───────────────────────────────────────────────────────

export interface DetailHeaderConfig {
  backTo: string;
  backLabel: string;
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor: string;
  title: string;
  subtitle: string;
  id: string;
}

export interface HeroImageConfig {
  url: string;
  alt: string;
  fallbackIcon?: LucideIcon;
}

// ─── Base Page Config ────────────────────────────────────────────────────

/** Minimal contract every page config must satisfy for DetailLayout. */
export interface BasePageConfig<TSection extends { readonly kind: string }> {
  header: DetailHeaderConfig;
  kpiStrip: KpiStat[];
  actions: ActionButton[];
  mainSections: TSection[];
  sidebarSections: TSection[];
}

// ─── Section Registry Contract ───────────────────────────────────────────

/**
 * Generic registry type: maps each discriminator `kind` to its renderer.
 * Usage: `satisfies SectionRendererMap<MyDetailSection>`
 */
export type SectionRendererMap<TSection extends { readonly kind: string }> = {
  [K in TSection["kind"]]: React.ComponentType<{
    section: Extract<TSection, { kind: K }>;
  }>;
};
