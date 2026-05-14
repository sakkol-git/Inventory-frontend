import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  Trash2,
  Download,
  Tag,
  Archive,
  X,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BatchAction {
  icon: LucideIcon;
  label: string;
  onClick: (selectedIds: string[]) => void;
  variant?: "default" | "destructive" | "outline";
}

interface BatchActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  actions?: BatchAction[];
  className?: string;
}

const DEFAULT_ACTIONS: BatchAction[] = [
  {
    icon: Tag,
    label: "Tag",
    onClick: (ids) => console.log("Tag", ids),
    variant: "outline",
  },
  {
    icon: Archive,
    label: "Archive",
    onClick: (ids) => console.log("Archive", ids),
    variant: "outline",
  },
  {
    icon: Download,
    label: "Export",
    onClick: (ids) => console.log("Export", ids),
    variant: "outline",
  },
  {
    icon: Trash2,
    label: "Delete",
    onClick: (ids) => console.log("Delete", ids),
    variant: "destructive",
  },
];

/**
 * Sticky batch action bar — appears when items are selected.
 * Slides up from the bottom with a count indicator.
 */
const BatchActionBar = ({
  selectedIds,
  onClearSelection,
  actions = DEFAULT_ACTIONS,
  className,
}: BatchActionBarProps) => {
  if (selectedIds.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 md:bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2",
        "flex items-center gap-3 rounded-t-xl md:rounded-xl border shadow-2xl",
        "bg-card/95 backdrop-blur-md px-4 py-3",
        "page-transition",
        className
      )}
    >
      {/* Count */}
      <div className="flex items-center gap-2 pr-3 border-r">
        <CheckSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold whitespace-nowrap">
          {selectedIds.length} selected
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Button
              key={i}
              variant={action.variant === "destructive" ? "destructive" : "outline"}
              size="sm"
              onClick={() => action.onClick(selectedIds)}
              className="shrink-0 press-effect"
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Close */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        className="shrink-0 h-8 w-8"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BatchActionBar;
export type { BatchAction, BatchActionBarProps };
