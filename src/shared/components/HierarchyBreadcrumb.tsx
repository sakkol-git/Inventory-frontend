/* ═══════════════════════════════════════════════════════════════════════════
 * HierarchyBreadcrumb — Shows hierarchical path for Species → Variety → Sample
 * ═══════════════════════════════════════════════════════════════════════════ */

import { cn } from "@/shared/lib/utils";
import { ChevronRight, FlaskConical, Leaf, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  level: "species" | "variety" | "sample";
  id: string;
  label: string;
  code: string;
  url: string;
}

export interface HierarchyBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const ICONS = {
  species: Leaf,
  variety: Sprout,
  sample: FlaskConical,
};

const COLORS = {
  species: "text-green-600 dark:text-green-400",
  variety: "text-blue-600 dark:text-blue-400",
  sample: "text-purple-600 dark:text-purple-400",
};

export function HierarchyBreadcrumb({
  items,
  className,
}: HierarchyBreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className={cn(
        "flex items-center space-x-2 text-sm text-muted-foreground mb-4 px-4 py-2 bg-muted/30 rounded-lg",
        className,
      )}
      aria-label="Hierarchy breadcrumb"
    >
      {items.map((item, index) => {
        const Icon = ICONS[item.level];
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}

            <Link
              to={item.url}
              className={cn(
                "flex items-center space-x-1.5 hover:text-foreground transition-colors rounded-md px-2 py-1",
                isLast
                  ? "font-semibold text-foreground bg-background/50"
                  : "hover:bg-background/30",
              )}
            >
              <Icon className={cn("h-4 w-4", COLORS[item.level])} />
              <span>{item.label}</span>
              <span className="text-xs opacity-60 font-mono">
                ({item.code})
              </span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

export default HierarchyBreadcrumb;
