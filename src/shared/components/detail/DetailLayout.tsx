// ═══════════════════════════════════════════════════════════════════════════
// DETAIL LAYOUT — Shared Rendering Engine
// ═══════════════════════════════════════════════════════════════════════════
//
// Generic, config-driven layout shell shared by ALL detail pages.
// Eliminates ~120 lines of duplicated boilerplate per renderer.
//
// Each page supplies:
//   1. A config object satisfying BasePageConfig<TSection>
//   2. A renderSection callback (built via createSectionDispatch)
//   3. Optional slots: heroImage, statusBadge, banner, alerts
//
// The layout owns ONLY the structural shell:
//   header → hero/banner → KPI strip → alerts → 2/3 + 1/3 grid
// ═══════════════════════════════════════════════════════════════════════════

import { Button } from "@/components/ui/button";
import React, { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { DetailHeader, StatMini } from "./DetailPageShell";
import type { ActionButton, HeroImageConfig } from "./detail-types";

// ─── Hero Image ──────────────────────────────────────────────────────────

export const HeroImage = ({ url, alt }: { url: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <div
      className="w-full overflow-hidden bg-muted rounded-lg flex items-center justify-center"
      style={{ minHeight: "240px" }}
    >
      {hasError ? (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-16">
          <span className="text-sm font-medium">Image not available</span>
        </div>
      ) : (
        <img
          src={url}
          alt={alt}
          className="w-full h-64 sm:h-80 lg:h-[32rem] object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

// ─── Action Buttons ──────────────────────────────────────────────────────

export const ActionButtons = ({ actions }: { actions: ActionButton[] }) => {
  const navigate = useNavigate();
  return (
    <>
      {actions.map((action) => {
        const ActionIcon = action.icon;
        return (
          <Button
            key={action.label}
            variant={action.variant}
            size="sm"
            className={action.className}
            aria-label={action.ariaLabel}
            onClick={
              action.onClick ??
              (action.href ? () => navigate(action.href!) : undefined)
            }
          >
            <ActionIcon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        );
      })}
    </>
  );
};

// ─── Section Dispatch Factory ────────────────────────────────────────────

/**
 * Creates a type-safe section dispatch function from a registry object.
 * Eliminates the duplicated switch/case + SectionRenderer + assertNever
 * pattern that was copy-pasted across all 6 detail renderers.
 *
 * Usage:
 * ```ts
 * const renderSection = createSectionDispatch(sectionRegistry);
 * ```
 */
export function createSectionDispatch<
  TSection extends { readonly kind: string },
>(registry: {
  [K in TSection["kind"]]: React.ComponentType<{
    section: Extract<TSection, { kind: K }>;
  }>;
}) {
  return function renderSection(section: TSection): React.ReactNode {
    const kind = section.kind as TSection["kind"];
    const Renderer = registry[kind] as React.ComponentType<{
      section: TSection;
    }>;
    if (!Renderer) {
      throw new Error(`Unhandled section kind: ${String(kind)}`);
    }
    return <Renderer section={section} />;
  };
}

// ─── KPI Strip ───────────────────────────────────────────────────────────

interface KpiStripProps {
  stats: {
    label: string;
    value: ReactNode;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
  }[];
  columns?: "4" | "6";
}

const KpiStrip = ({ stats, columns = "4" }: KpiStripProps) => (
  <div
    className={
      columns === "6"
        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    }
  >
    {stats.map((stat) => (
      <StatMini
        key={stat.label}
        label={stat.label}
        value={stat.value}
        icon={stat.icon}
        color={stat.color}
      />
    ))}
  </div>
);

// ─── Section Grid ────────────────────────────────────────────────────────

interface SectionGridProps<T extends { readonly kind: string }> {
  main: T[];
  sidebar: T[];
  renderSection: (section: T) => React.ReactNode;
}

function SectionGrid<T extends { readonly kind: string }>({
  main,
  sidebar,
  renderSection,
}: SectionGridProps<T>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {main.map((section) => (
          <React.Fragment key={section.kind}>
            {renderSection(section)}
          </React.Fragment>
        ))}
      </div>
      <div className="space-y-6">
        {sidebar.map((section) => (
          <React.Fragment key={section.kind}>
            {renderSection(section)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Detail Layout (Main Export) ─────────────────────────────────────────

interface DetailLayoutProps<TSection extends { readonly kind: string }> {
  header: {
    backTo: string;
    backLabel: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    iconColor: string;
    title: string;
    subtitle: string;
    id: string;
  };
  actions: ActionButton[];
  /** Optional status badge rendered before action buttons */
  statusBadge?: ReactNode;
  /** Optional hero image displayed after header */
  heroImage?: HeroImageConfig | string | null;
  /** Optional custom banner (e.g. Contract value banner) between header and KPI strip */
  banner?: ReactNode;
  /** Optional alerts rendered after KPI strip */
  alerts?: ReactNode;
  kpiStrip: KpiStripProps["stats"];
  /** Number of KPI columns: "4" (default) or "6" */
  kpiColumns?: "4" | "6";
  mainSections: TSection[];
  sidebarSections: TSection[];
  renderSection: (section: TSection) => React.ReactNode;
}

export function DetailLayout<TSection extends { readonly kind: string }>({
  header,
  actions,
  statusBadge,
  heroImage,
  banner,
  alerts,
  kpiStrip,
  kpiColumns,
  mainSections,
  sidebarSections,
  renderSection,
}: DetailLayoutProps<TSection>) {
  const heroUrl =
    typeof heroImage === "string"
      ? heroImage
      : heroImage && typeof heroImage === "object"
        ? heroImage.url
        : null;
  const heroAlt =
    typeof heroImage === "object" && heroImage && "alt" in heroImage
      ? heroImage.alt
      : header.title;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <DetailHeader
        backTo={header.backTo}
        backLabel={header.backLabel}
        icon={header.icon}
        iconColor={header.iconColor}
        title={header.title}
        subtitle={header.subtitle}
        id={header.id}
        actions={
          <>
            {statusBadge}
            <ActionButtons actions={actions} />
          </>
        }
      />

      {heroUrl && <HeroImage url={heroUrl} alt={heroAlt} />}

      {banner}

      <KpiStrip stats={kpiStrip} columns={kpiColumns} />

      {alerts}

      <SectionGrid
        main={mainSections}
        sidebar={sidebarSections}
        renderSection={renderSection}
      />
    </div>
  );
}
