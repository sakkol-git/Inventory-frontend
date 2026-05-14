/* ═══════════════════════════════════════════════════════════════════════════
 * persistence — localStorage-backed state persistence for mock data.
 *
 * Addresses: SM-001 (No data persistence)
 *
 * Usage:
 *   const [items, setItems] = usePersistedState<ChemicalItem[]>("chemicals", SEED);
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useCallback, useRef, useState } from "react";

// ─── Low-level helpers ──────────────────────────────────────────────────────

const PREFIX = "plantlab_";

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    console.warn(`[persistence] Failed to save key "${key}" to localStorage`);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // swallow
  }
}

// ─── React Hook ─────────────────────────────────────────────────────────────

/**
 * useState with automatic localStorage persistence.
 * Data survives page refresh.
 *
 * @param key    Unique storage key (auto-prefixed with "plantlab_")
 * @param seed   Default data used when nothing is in storage
 */
export function usePersistedState<T>(
  key: string,
  seed: T,
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [state, _setState] = useState<T>(() => loadFromStorage(key, seed));

  // Ref to latest state for the setter closure
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback(
    (updater: T | ((prev: T) => T)) => {
      _setState((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (prev: T) => T)(prev)
            : updater;
        saveToStorage(key, next);
        return next;
      });
    },
    [key],
  );

  return [state, setState];
}

// ─── Recent Items Tracker (MF-005) ─────────────────────────────────────────

export interface RecentItem {
  id: string;
  title: string;
  path: string;
  module: string;
  visitedAt: string;
}

const MAX_RECENT = 15;

export function addRecentItem(item: Omit<RecentItem, "visitedAt">): void {
  const items = loadFromStorage<RecentItem[]>("recent_items", []);
  const filtered = items.filter((i) => i.id !== item.id);
  filtered.unshift({ ...item, visitedAt: new Date().toISOString() });
  saveToStorage("recent_items", filtered.slice(0, MAX_RECENT));
}

export function getRecentItems(): RecentItem[] {
  return loadFromStorage<RecentItem[]>("recent_items", []);
}

export function clearRecentItems(): void {
  removeFromStorage("recent_items");
}
