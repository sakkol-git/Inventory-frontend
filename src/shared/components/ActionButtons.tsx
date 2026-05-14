/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ActionButtons — Shared action button group for table rows.
 *
 * Phase 2.4.2 — Extracts common Edit/Delete/View icon button patterns
 * into a reusable component with proper aria-labels.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { LucideIcon } from "lucide-react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface ActionButtonConfig {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "ghost" | "outline" | "destructive";
  className?: string;
  disabled?: boolean;
}

interface ActionButtonsProps {
  /** Entity name for aria-labels (e.g., "Equipment EQ-001") */
  entityName: string;
  /** View action */
  onView?: () => void;
  /** Edit action */
  onEdit?: () => void;
  /** Delete action */
  onDelete?: () => void;
  /** Additional custom actions */
  extra?: ActionButtonConfig[];
  /** Size of icon buttons */
  size?: "sm" | "default";
  /** Additional CSS classes */
  className?: string;
}

export function ActionButtons({
  entityName,
  onView,
  onEdit,
  onDelete,
  extra = [],
  size = "sm",
  className,
}: ActionButtonsProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  const actions: ActionButtonConfig[] = [
    ...(onView
      ? [
          {
            icon: Eye,
            label: `View ${entityName}`,
            onClick: onView,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            icon: Pencil,
            label: `Edit ${entityName}`,
            onClick: onEdit,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            icon: Trash2,
            label: `Delete ${entityName}`,
            onClick: onDelete,
            className: "text-destructive hover:text-destructive",
          },
        ]
      : []),
    ...extra,
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex items-center gap-0.5", className)}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(btnSize, action.className)}
                  onClick={action.onClick}
                  aria-label={action.label}
                  disabled={action.disabled}
                >
                  <Icon className={iconSize} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
