import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for EntityCardFooter component
 */
export interface EntityCardFooterProps {
  /** Edit handler */
  onEdit: () => void;

  /** Delete handler */
  onDelete: () => void;

  /** Extra actions (e.g., Borrow button for Equipment) */
  extraActions?: React.ReactNode;

  /** Visual variant */
  variant?: "standard" | "compact" | "with-actions";

  /** Additional CSS classes */
  className?: string;
}

/**
 * Unified footer component for all entity cards
 * Provides consistent edit/delete button placement and styling
 * Supports extensibility via extraActions prop for entity-specific features
 *
 * @example
 * // Basic usage
 * <EntityCardFooter
 *   onEdit={() => edit(item)}
 *   onDelete={() => delete(item)}
 * />
 *
 * // With extra actions (e.g., Equipment's Borrow button)
 * <EntityCardFooter
 *   onEdit={() => edit(item)}
 *   onDelete={() => delete(item)}
 *   extraActions={<BorrowButton equipment={item} />}
 * />
 *
 * // Compact variant
 * <EntityCardFooter
 *   onEdit={() => edit(item)}
 *   onDelete={() => delete(item)}
 *   variant="compact"
 * />
 */
export const EntityCardFooter = ({
  onEdit,
  onDelete,
  extraActions,
  variant = "standard",
  className,
}: EntityCardFooterProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handleEditClick}
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={handleDeleteClick}
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        {extraActions}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pt-3 mt-3 border-t border-border/40 flex items-center justify-between gap-2",
        className
      )}
    >
      <div className="flex-1" />

      {extraActions && <div className="flex items-center gap-1">{extraActions}</div>}

      <Button
        size="sm"
        variant="ghost"
        className="h-9 w-9 p-0 shrink-0"
        onClick={handleEditClick}
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className="h-9 w-9 p-0 shrink-0 text-destructive hover:text-destructive"
        onClick={handleDeleteClick}
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
