import { cn } from "@/shared/lib/utils";
import { LayoutDashboard, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Inventory", path: "/inventory" },
];

/**
 * Bottom navigation bar for mobile screens.
 * Hides itself when there's only one nav item (avoids a visually awkward
 * single-tab bar). The component is preserved so additional top-level
 * sections can be added later without re-wiring AppLayout.
 */
const MobileBottomNav = () => {
  const location = useLocation();

  if (NAV_ITEMS.length < 2) return null;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "flex items-center justify-around",
        "h-16 border-t bg-card/95 backdrop-blur-md",
        "safe-area-inset-bottom",
      )}
      role="navigation"
      aria-label="Mobile navigation"
      data-mobile-nav
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors press-effect relative",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("h-5 w-5", active && "drop-shadow-sm")} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {active && (
              <span className="absolute top-0 h-0.5 w-8 bg-primary rounded-full" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
