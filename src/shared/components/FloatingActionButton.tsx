import { useState, type ReactNode } from "react";
import { Plus, X, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface FabAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "warning";
}

interface FloatingActionButtonProps {
  actions: FabAction[];
  /** Main button icon — defaults to Plus */
  icon?: LucideIcon;
  className?: string;
}

/**
 * Floating Action Button with expandable speed-dial actions.
 * Fixed to bottom-right, hidden on desktop.
 */
const FloatingActionButton = ({
  actions,
  icon: MainIcon = Plus,
  className,
}: FloatingActionButtonProps) => {
  const [open, setOpen] = useState(false);

  const variantStyles: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    warning: "bg-warning text-warning-foreground hover:bg-warning/90",
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 md:hidden", className)}>
      {/* Speed-dial actions */}
      {open && (
        <div className="flex flex-col-reverse gap-2 mb-2 stagger-children">
          {actions.map((action, i) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-3 shadow-lg",
                  "text-sm font-medium transition-all fab-enter",
                  variantStyles[action.variant || "default"]
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <ActionIcon className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-xl",
          "bg-primary text-primary-foreground",
          "transition-transform duration-200 press-effect",
          open && "rotate-45"
        )}
        aria-label={open ? "Close actions" : "Quick actions"}
      >
        {open ? <X className="h-6 w-6" /> : <MainIcon className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default FloatingActionButton;
