/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DashboardLayout — Grid layout for dashboard widget pages.
 *
 * Provides:
 *   - Responsive widget grid (1-col mobile → 2-col lg → flexible)
 *   - Consistent gap/spacing between widgets
 *   - Full-width widget support via `span` prop on children
 *
 * Usage:
 *   <DashboardLayout>
 *     <DashboardLayout.Widget>...</DashboardLayout.Widget>
 *     <DashboardLayout.Widget span="full">...</DashboardLayout.Widget>
 *   </DashboardLayout>
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/shared/lib/utils";
import { type ReactNode } from "react";

// ─── Widget ────────────────────────────────────────────────────────────────

interface WidgetProps {
  children: ReactNode;
  /** 'half' = 1 column, 'full' = spans entire row */
  span?: "half" | "full";
  className?: string;
}

function Widget({ children, span = "half", className }: WidgetProps) {
  return (
    <div className={cn(span === "full" && "lg:col-span-2", className)}>
      {children}
    </div>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

function DashboardLayoutRoot({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {children}
    </div>
  );
}

// ─── Compound Component ────────────────────────────────────────────────────

export const DashboardLayout = Object.assign(DashboardLayoutRoot, {
  Widget,
});
