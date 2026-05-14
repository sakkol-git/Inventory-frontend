import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/core/auth/useAuth";
import ThemeToggle from "@/core/theme/ThemeToggle";
import { NotificationPanel } from "@/shared/components/NotificationPanel";
import {
    FlaskConical,
    Menu,
    Plus,
    Sprout,
    User,
    Wrench,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSidebarContext } from "./AppLayout";

const TopNav = () => {
  const { mobileOpen, setMobileOpen } = useSidebarContext();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 shadow-md">
      {/* Left: Logo + Hamburger */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={
            mobileOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <NavLink to="/" className="flex items-center gap-2.5">
          <img
            src="/favicon.svg"
            alt="Plant Lab Laboratory logo"
            className="w-9 h-9 rounded-lg object-contain shadow-sm"
          />
          <div className="hidden sm:block">
            <span className="font-semibold text-foreground text-base">
              Plant Lab
            </span>
            <span className="font-normal text-muted-foreground text-base ml-1">
              Laboratory
            </span>
          </div>
        </NavLink>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {/* Quick Create */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 h-8 hidden sm:inline-flex">
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/inventory/equipment")}>
              <Wrench className="h-4 w-4 mr-2" /> Equipment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/inventory/chemicals")}>
              <FlaskConical className="h-4 w-4 mr-2" /> Chemical
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/inventory/plant-species")}
            >
              <Sprout className="h-4 w-4 mr-2" /> Plant Species
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationPanel />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 px-2.5 h-10"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                {user?.name ? (
                  <span className="text-xs font-semibold text-primary">
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {user?.name ?? "Guest"}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {user?.role ?? ""}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name ?? "Guest"}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  {user?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/inventory/profile")}>
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive font-medium"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNav;
