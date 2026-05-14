import { SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon?: LucideIcon;
  
  /**
   * Main title text
   */
  title?: string;
  
  /**
   * Description/help text
   */
  description?: string;
  
  /**
   * Optional action button text
   */
  actionLabel?: string;
  
  /**
   * Action button click handler
   */
  onAction?: () => void;
  
  /**
   * Action button icon (Lucide icon component)
   */
  actionIcon?: LucideIcon;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Custom children (overrides default action button)
   */
  children?: React.ReactNode;
}

/**
 * Standardized empty state component for lists and searches
 * 
 * @example
 * // Basic empty state
 * <EmptyState
 *   icon={Package}
 *   title="No equipment found"
 *   description="Get started by adding your first equipment item"
 * />
 * 
 * // With action button
 * <EmptyState
 *   icon={Plus}
 *   title="No experiments yet"
 *   description="Create your first experiment to get started"
 *   actionLabel="Create Experiment"
 *   actionIcon={Plus}
 *   onAction={() => setIsDialogOpen(true)}
 * />
 */
const EmptyState = ({
  icon: Icon = SearchX,
  title = "No results found",
  description = "Try adjusting your search or filter criteria.",
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className,
  children,
}: EmptyStateProps) => (
  <div 
    className={cn(
      "flex flex-col items-center justify-center py-16 text-center",
      "border border-dashed border-border/50 rounded-xl bg-muted/20 shadow-sm",
      className
    )} 
    role="status" 
    aria-live="polite"
  >
    <div className="p-4 bg-muted/40 rounded-xl mb-4" aria-hidden="true">
      <Icon className="h-8 w-8 text-muted-foreground/50" />
    </div>
    <h3 className="text-sm font-medium text-foreground mb-1">
      {title}
    </h3>
    <p className="text-sm text-muted-foreground mb-4 max-w-sm">
      {description}
    </p>
    {children || (actionLabel && onAction && (
      <Button onClick={onAction}>
        {ActionIcon && <ActionIcon className="h-4 w-4" />}
        {actionLabel}
      </Button>
    ))}
  </div>
);

export default EmptyState;
