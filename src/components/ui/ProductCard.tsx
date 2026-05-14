import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface ProductCardMeta {
  icon?: LucideIcon;
  label?: string;
  value: string | number;
}

export interface ProductCardProps {
  /** Image URL or fallback element */
  image?: string;
  fallbackImage?: ReactNode;
  /** Main title */
  title: string;
  /** Subtitle / description */
  subtitle?: string;
  /** ID badge (top-left corner) */
  id?: string;
  /** Status badge (top-right corner) */
  statusBadge?: ReactNode;
  /** Metadata rows (icons + values) */
  meta?: ProductCardMeta[];
  /** Tags to display at bottom */
  tags?: string[];
  /** Edit handler */
  onEdit?: () => void;
  /** Click handler for card */
  onClick?: () => void;
  /** Custom className */
  className?: string;
  /** Background color for image area when no image */
  imageBackgroundColor?: string;
}

/**
 * Standardized product card component.
 * Ensures visual consistency across all inventory/research/business products.
 *
 * Layout:
 * - Fixed height image area (h-48) with overflow-hidden + rounded-t-xl
 * - Padding p-5 content area
 * - Meta grid with icons
 * - Tags + optional edit button in footer
 */
export const ProductCard = ({
  image,
  fallbackImage,
  title,
  subtitle,
  id,
  statusBadge,
  meta = [],
  tags = [],
  onEdit,
  onClick,
  className,
  imageBackgroundColor = "bg-muted/30",
}: ProductCardProps) => {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border-2 border-border/60 shadow-md hover:shadow-lg transition-all group flex flex-col overflow-hidden",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Image Area */}
      <div
        className={cn(
          "relative h-48 border-b border-border/40 overflow-hidden rounded-t-xl",
          imageBackgroundColor,
        )}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {fallbackImage}
          </div>
        )}

        {/* Status badge (top-right) */}
        {statusBadge && (
          <div className="absolute top-3 right-3 z-10">{statusBadge}</div>
        )}

        {/* ID badge (top-left) */}
        {id && (
          <span className="absolute top-3 left-3 text-xs font-normal text-muted-foreground/70 bg-card/70 backdrop-blur-sm rounded-lg px-2 py-1 z-10">
            {id}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-between p-5">
        <div>
          <h3 className="font-medium text-foreground text-sm leading-tight mb-1 line-clamp-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70 italic mb-3 line-clamp-1">
              {subtitle}
            </p>
          )}

          {/* Metadata grid */}
          {meta.length > 0 && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs mt-3">
              {meta.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 min-w-0">
                    {Icon && (
                      <Icon className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                    {item.label && (
                      <span className="text-muted-foreground/70 shrink-0">
                        {item.label}
                      </span>
                    )}
                    <span className="font-medium tabular-nums text-foreground truncate">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: tags + edit button */}
        <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs font-normal px-1.5 py-0.5 bg-muted/50 text-muted-foreground/70 rounded-lg truncate"
              >
                {tag}
              </span>
            ))}
          </div>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
