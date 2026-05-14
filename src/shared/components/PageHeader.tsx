/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PageHeader — Consolidated page header component.
 *
 * SINGLE API ONLY — no polymorphic icon, no subtitle alias.
 *
 * Fixes: FLAW-10 (inconsistent icon sizes), FLAW-17 (duplicate dashboard copy)
 *
 * Rules:
 *   1. Every page has exactly ONE PageHeader.
 *   2. icon must be a LucideIcon component reference (not JSX).
 *   3. Use `description` — never `subtitle`.
 *   4. Actions are passed as ReactNode and rendered on the right.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  /** LucideIcon component reference — e.g. `icon={Wrench}` */
  icon?: LucideIcon;
  /** Page title — rendered as h1 */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Optional action buttons on the right */
  actions?: ReactNode;
}

const PageHeader = ({
  icon: Icon,
  title,
  description,
  actions,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="icon-badge" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-title tracking-tighter">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
