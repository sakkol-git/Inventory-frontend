/* ═══════════════════════════════════════════════════════════════════════════
 * Sidebar — Collapsible side navigation with grouped sections, search,
 * and recent pages tracking.
 *
 * Phase 3.1 — Navigation & Information Architecture enhancements.
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── External ──────────────────────────────────────────────────────────────
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

// ─── Internal Components ───────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

// ─── Hook ──────────────────────────────────────────────────────────────────
import { useSidebar, type NavGroup, type NavItem } from "./useSidebar";

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

const Sidebar = () => {
  const { collapsed, toggleCollapsed, navGroups, sectionLabel, isActive } =
    useSidebar();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["all"]),
  );

  // Auto-expand group containing active item
  useEffect(() => {
    for (const group of navGroups) {
      if (group.items.some(isActive)) {
        setExpandedGroups((prev) => new Set([...prev, group.label]));
      }
    }
  }, [navGroups, isActive]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] bg-card border-r border-border shadow-md transition-all duration-200 flex flex-col shrink-0",
        collapsed ? "w-[72px]" : "w-60",
      )}
    >
      <nav
        className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin"
        aria-label="Main navigation"
      >
        <SectionLabel label={sectionLabel} collapsed={collapsed} />

        {/* Grouped Navigation */}
        {navGroups.map((group) => (
          <NavGroupSection
            key={group.label}
            group={group}
            expanded={expandedGroups.has(group.label)}
            onToggle={() => toggleGroup(group.label)}
            isActive={isActive}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <CollapseToggle collapsed={collapsed} onToggle={toggleCollapsed} />
    </aside>
  );
};

export default Sidebar;

/* ═══════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Nav Group Section ─────────────────────────────────────────────────── */

const NavGroupSection = ({
  group,
  expanded,
  onToggle,
  isActive,
  collapsed,
}: {
  group: NavGroup;
  expanded: boolean;
  onToggle: () => void;
  isActive: (item: NavItem) => boolean;
  collapsed: boolean;
}) => {
  if (collapsed) {
    // In collapsed mode, show items without grouping
    return (
      <>
        {group.items.map((item) => (
          <SidebarLink
            key={item.title}
            item={item}
            active={isActive(item)}
            collapsed={collapsed}
          />
        ))}
        <div className="my-1 border-b border-border/20" />
      </>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded"
        aria-expanded={expanded}
      >
        {group.label}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            expanded ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {expanded && (
        <div className="space-y-0.5 mt-0.5">
          {group.items.map((item) => (
            <SidebarLink
              key={item.title}
              item={item}
              active={isActive(item)}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Section Label ─────────────────────────────────────────────────────── */

const SectionLabel = ({
  label,
  collapsed,
}: {
  label: string;
  collapsed: boolean;
}) => {
  if (collapsed) return null;

  return (
    <div className="px-3 py-2 mb-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

/* ─── Sidebar Link ──────────────────────────────────────────────────────── */

const SidebarLink = ({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) => {
  const Icon = item.icon;

  const link = (
    <NavLink
      to={item.url}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group relative",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {/* Animated active indicator (Phase 14.2.4) */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}
      <Icon
        className={cn(
          "h-4.5 w-4.5 shrink-0",
          active ? "text-primary" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      {!collapsed && (
        <span
          className={cn(
            "text-sm",
            active
              ? "font-medium text-primary"
              : "font-normal text-muted-foreground",
          )}
        >
          {item.title}
        </span>
      )}
      {/* Badge count (Phase 3.1.2) */}
      {!collapsed && item.badge != null && item.badge > 0 && (
        <span className="ml-auto inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold">
          {item.badge}
        </span>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return <div>{link}</div>;
};

/* ─── Collapse Toggle ───────────────────────────────────────────────────── */

const CollapseToggle = ({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) => (
  <div className="p-3 border-t border-border/40">
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "w-full justify-center text-sm",
        !collapsed && "justify-start",
      )}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <>
          <ChevronLeft className="h-4 w-4 mr-2" />
          <span>Collapse</span>
        </>
      )}
    </Button>
  </div>
);
