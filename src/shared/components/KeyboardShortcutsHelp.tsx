/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KeyboardShortcutsHelp — Modal showing available keyboard shortcuts.
 *
 * Phase 20.2 — Keyboard Shortcuts Help Overlay.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["⌘", "1"], description: "Go to Dashboard" },
      { keys: ["⌘", "2"], description: "Go to Plant Samples" },
      { keys: ["⌘", "3"], description: "Go to Equipment" },
      { keys: ["⌘", "K"], description: "Focus search" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["⌘", "N"], description: "Create new item" },
      { keys: ["Esc"], description: "Close dialog / blur input" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["⌘", "/"], description: "Show this help" },
      { keys: ["?"], description: "Show this help" },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
}: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="inline-flex items-center justify-center min-w-[1.75rem] px-1.5 py-0.5 text-xs font-medium border border-border/60 rounded bg-muted text-muted-foreground"
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

        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/40">
          On Windows/Linux, use{" "}
          <kbd className="px-1 py-0.5 text-xs border rounded">Ctrl</kbd> instead
          of <kbd className="px-1 py-0.5 text-xs border rounded">⌘</kbd>
        </p>
      </DialogContent>
    </Dialog>
  );
}
