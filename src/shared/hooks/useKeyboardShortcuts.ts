import { useEffect, useCallback, useRef } from "react";

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
};

type ShortcutEntry = {
  combo: KeyCombo;
  handler: () => void;
  description: string;
  /** Group label for display in shortcuts panel */
  group?: string;
};

/**
 * Hook for registering global keyboard shortcuts.
 *
 * @example
 * useKeyboardShortcuts([
 *   { combo: { key: "k", meta: true }, handler: openPalette, description: "Open command palette" },
 *   { combo: { key: "b", ctrl: true }, handler: toggleSidebar, description: "Toggle sidebar" },
 * ]);
 */
export const useKeyboardShortcuts = (shortcuts: ShortcutEntry[]) => {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't fire shortcuts when user is typing in an input
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      const { combo } = shortcut;
      const ctrlOrMeta = combo.ctrl || combo.meta;

      const modMatch =
        (ctrlOrMeta ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey) &&
        (combo.shift ? e.shiftKey : !e.shiftKey) &&
        (combo.alt ? e.altKey : !e.altKey);

      if (modMatch && e.key.toLowerCase() === combo.key.toLowerCase()) {
        e.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

export type { ShortcutEntry, KeyCombo };
