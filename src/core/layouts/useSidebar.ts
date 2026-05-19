/* ═══════════════════════════════════════════════════════════════════════════
 * useSidebar — State + derived data for the sidebar navigation.
 *
 * Grouped navigation, badge counts, recent pages.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useAuth } from "@/core/auth/useAuth";
import type { LucideIcon } from "lucide-react";
import {
    ArrowLeftRight,
    Award,
    BarChart3,
    Beaker,
    Boxes,
    ClipboardList,
    FileText,
    FlaskConical,
    Key,
    LayoutDashboard,
    Leaf,
    Shield,
    Sprout,
    User,
    Users,
    Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  matchPaths: string[];
  badge?: number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Nav Constants ─────────────────────────────────────────────────────────

const INVENTORY_NAV: NavItem[] = [
  {
    title: "Dashboard",
    url: "/inventory",
    icon: LayoutDashboard,
    matchPaths: ["/inventory"],
  },
  {
    title: "Plant Species",
    url: "/inventory/plant-species",
    icon: Leaf,
    matchPaths: ["/inventory/plant-species", "/inventory/products/species"],
  },
  {
    title: "Plant Stock",
    url: "/inventory/plant-stock",
    icon: Sprout,
    matchPaths: ["/inventory/plant-stock", "/inventory/products/stock"],
  },
  {
    title: "Plant Varieties",
    url: "/inventory/plant-varieties",
    icon: Boxes,
    matchPaths: ["/inventory/plant-varieties"],
  },
  {
    title: "Plant Samples",
    url: "/inventory/plant-samples",
    icon: Beaker,
    matchPaths: ["/inventory/plant-samples"],
  },
  {
    title: "Chemicals",
    url: "/inventory/chemicals",
    icon: FlaskConical,
    matchPaths: ["/inventory/chemicals", "/inventory/products/chemicals"],
  },
  {
    title: "Equipment",
    url: "/inventory/equipment",
    icon: Wrench,
    matchPaths: ["/inventory/equipment", "/inventory/products/equipment"],
  },
  {
    title: "Transactions",
    url: "/inventory/transactions",
    icon: ArrowLeftRight,
    matchPaths: ["/inventory/transactions"],
  },
  {
    title: "Borrow Records",
    url: "/inventory/borrow-records",
    icon: ArrowLeftRight,
    matchPaths: [
      "/inventory/borrow-records",
      "/inventory/borrow-records/pending",
      "/inventory/borrow-records/overdue",
    ],
  },
  // {
  //   title: "Chemical Batches",
  //   url: "/inventory/chemical-batches",
  //   icon: FlaskConical,
  //   matchPaths: ["/inventory/chemical-batches"],
  // },
  // {
  //   title: "Maintenance",
  //   url: "/inventory/maintenance-records",
  //   icon: Wrench,
  //   matchPaths: ["/inventory/maintenance-records"],
  // },
  {
    title: "Reports",
    url: "/inventory/reports",
    icon: BarChart3,
    matchPaths: ["/inventory/reports"],
  },
  {
    title: "Achievements",
    url: "/inventory/achievements",
    icon: Award,
    matchPaths: ["/inventory/achievements"],
  },
  {
    title: "Documents",
    url: "/inventory/documents",
    icon: FileText,
    matchPaths: ["/inventory/documents"],
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    matchPaths: ["/admin/users"],
  },
  {
    title: "Roles",
    url: "/admin/roles",
    icon: Shield,
    matchPaths: ["/admin/roles"],
  },
  {
    title: "Permissions",
    url: "/admin/permissions",
    icon: Key,
    matchPaths: ["/admin/permissions"],
  },
  {
    title: "Activity Log",
    url: "/admin/activity-log",
    icon: ClipboardList,
    matchPaths: ["/admin/activity-log"],
  },
  {
    title: "My Profile",
    url: "/inventory/profile",
    icon: User,
    matchPaths: ["/inventory/profile"],
  },
];

const ROOT_URLS = new Set(["/inventory"]);

// ─── Grouped Navigation ───────────────────────────────────────────────────

const INVENTORY_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: INVENTORY_NAV.filter((n) => n.title === "Dashboard"),
  },
  {
    label: "Core Inventory",
    items: INVENTORY_NAV.filter((n) =>
      [
        "Plant Species",
        "Plant Stock",
        "Plant Varieties",
        "Plant Samples",
        "Chemicals",
        "Equipment",
      ].includes(n.title),
    ),
  },
  {
    label: "Operations",
    items: INVENTORY_NAV.filter((n) =>
      [
        "Transactions",
        "Borrow Records",
       // "Chemical Batches",
        // "Maintenance",
      ].includes(n.title),
    ),
  },
  {
    label: "Reports & Analytics",
    items: INVENTORY_NAV.filter((n) =>
      ["Reports", "Achievements", "Documents"].includes(n.title),
    ),
  },
  {
    label: "Administration",
    items: INVENTORY_NAV.filter((n) =>
      ["Users", "Roles", "Permissions", "Activity Log", "My Profile"].includes(
        n.title,
      ),
    ),
  },
];

// ─── Recent Pages Persistence ──────────────────────────────────────────────

const RECENT_PAGES_KEY = "plant-lab:recent-pages";
const MAX_RECENT = 5;

function loadRecentPages(): NavItem[] {
  try {
    const stored = localStorage.getItem(RECENT_PAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentPage(item: NavItem) {
  try {
    const recent = loadRecentPages().filter((r) => r.url !== item.url);
    recent.unshift({
      title: item.title,
      url: item.url,
      icon: item.icon,
      matchPaths: item.matchPaths,
    });
    localStorage.setItem(
      RECENT_PAGES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT)),
    );
  } catch {
    // Silently fail
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [recentPages, setRecentPages] = useState<NavItem[]>(loadRecentPages());
  const { isRole } = useAuth();

  const isAdmin = isRole("admin");
  const isManager = isRole("lab-manager") || isRole("lab_manager");

  const navGroups = useMemo(() => {
    return INVENTORY_GROUPS.map((group) => {
      if (group.label === "Administration") {
        if (isAdmin || isManager) return group;
        return {
          ...group,
          items: group.items.filter((item) => item.title === "My Profile"),
        };
      }
      return group;
    }).filter((group) => group.items.length > 0);
  }, [isAdmin, isManager]);

  const isActive = useCallback(
    (item: NavItem) =>
      ROOT_URLS.has(item.url)
        ? location.pathname === item.url
        : item.matchPaths.some((p) => location.pathname.startsWith(p)),
    [location.pathname],
  );

  useEffect(() => {
    const activeItem = INVENTORY_NAV.find(isActive);
    if (activeItem && !ROOT_URLS.has(activeItem.url)) {
      saveRecentPage(activeItem);
      setRecentPages(loadRecentPages());
    }
  }, [location.pathname, isActive]);

  const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), []);

  const resolvedRecentPages = useMemo(() => {
    return recentPages
      .map((r) => INVENTORY_NAV.find((i) => i.url === r.url))
      .filter((x): x is NavItem => x != null);
  }, [recentPages]);

  return {
    collapsed,
    toggleCollapsed,
    navGroups,
    navItems: INVENTORY_NAV,
    sectionLabel: "Inventory",
    isActive,
    recentPages: resolvedRecentPages,
  } as const;
}
