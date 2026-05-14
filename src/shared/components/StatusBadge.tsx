/**
 * ═══════════════════════════════════════════════════════════════════════════
 * StatusBadge — Standardized semantic status indicator.
 *
 * Two usage modes:
 *
 * A) Semantic tone (design-token based):
 *   <StatusBadge label="Available" tone="success" />
 *   <StatusBadge label="Pending" tone="warning" />
 *
 * B) Style-map lookup (uses centralized status-styles.ts maps):
 *   <StatusBadge label={status} styleMap={experimentStatusStyles} />
 *   <StatusBadge label={status} styleMap={contractStatusStyles} />
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { statusBadge } from "@/shared/lib/status-styles";
import { cn } from "@/shared/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

export type StatusTone = "success" | "warning" | "error" | "info" | "muted";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "status-tag status-tag-success",
  warning: "status-tag status-tag-warning",
  error: "status-tag status-tag-error",
  info: "status-tag status-tag-info",
  muted: "status-tag status-tag-muted",
};

export interface StatusBadgeProps {
  /** Text label (also used as status key when using styleMap) */
  label: string;
  /**
   * Semantic tone — maps to the design system color tokens.
   * Ignored when styleMap is provided. Defaults to "muted" if omitted.
   */
  tone?: StatusTone;
  /**
   * Style map from status-styles.ts — if provided, uses statusBadge() helper
   * instead of design-token tones.
   */
  styleMap?: Record<string, string>;
  /** Optional additional classes */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function StatusBadge({
  label,
  tone = "muted",
  styleMap,
  className,
}: StatusBadgeProps) {
  if (styleMap) {
    return (
      <span className={cn(statusBadge(styleMap, label), className)}>
        {label}
      </span>
    );
  }
  return <span className={cn(TONE_CLASSES[tone], className)}>{label}</span>;
}
