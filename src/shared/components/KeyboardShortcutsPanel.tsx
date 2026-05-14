import { useState, useMemo, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

interface ShortcutItem {
  keys: string[];
  description: string;
  group: string;
}

const ALL_SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { keys: ["⌘", "K"], description: "Open command palette", group: "Navigation" },
  { keys: ["?"], description: "Show keyboard shortcuts", group: "Navigation" },

  // View
  { keys: ["⌘", "B"], description: "Toggle sidebar", group: "View" },
  { keys: ["⌘", "\\"], description: "Toggle dark mode", group: "View" },

  // Actions
  { keys: ["N"], description: "New item (context-aware)", group: "Actions" },
  { keys: ["⌘", "S"], description: "Save current form", group: "Actions" },
  { keys: ["Esc"], description: "Close dialog / deselect", group: "Actions" },
];

/**
 * Dialog that displays all available keyboard shortcuts.
 */
const KeyboardShortcutsPanel = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const grouped = useMemo(() => {
    const groups: Record<string, ShortcutItem[]> = {};
    for (const item of ALL_SHORTCUTS) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Quick access keys for common actions</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(grouped).map(([group, shortcuts]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {group}
              </h4>
              <div className="space-y-2">
                {shortcuts.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((key, ki) => (
                        <kbd
                          key={ki}
                          className={cn(
                            "inline-flex h-6 min-w-[1.5rem] items-center justify-center",
                            "rounded border bg-muted px-1.5",
                            "text-[11px] font-medium text-muted-foreground"
                          )}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsPanel;
export { ALL_SHORTCUTS };
