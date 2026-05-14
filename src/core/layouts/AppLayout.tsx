import MobileBottomNav from "@/core/layouts/MobileBottomNav";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import CommandPalette from "@/shared/components/CommandPalette";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import KeyboardShortcutsPanel from "@/shared/components/KeyboardShortcutsPanel";
import PageTransition from "@/shared/components/PageTransition";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { useTheme } from "next-themes";
import { createContext, ReactNode, useContext, useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface AppLayoutProps {
  children: ReactNode;
}

// Context to share mobile sidebar state between TopNav and AppLayout
export const SidebarContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}>({ mobileOpen: false, setMobileOpen: () => {} });

export const useSidebarContext = () => useContext(SidebarContext);

const AppLayout = ({ children }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      combo: { key: "b", ctrl: true },
      handler: () => setMobileOpen((prev) => !prev),
      description: "Toggle sidebar",
      group: "View",
    },
    {
      combo: { key: "\\", ctrl: true },
      handler: () => setTheme(theme === "dark" ? "light" : "dark"),
      description: "Toggle dark mode",
      group: "View",
    },
    {
      combo: { key: "?" },
      handler: () => setShortcutsOpen(true),
      description: "Show keyboard shortcuts",
      group: "Navigation",
    },
  ]);

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div className="min-h-screen bg-background">
        <CommandPalette />
        <KeyboardShortcutsPanel
          open={shortcutsOpen}
          onOpenChange={setShortcutsOpen}
        />
        <TopNav />
        <div className="flex">
          {/* Mobile overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar — hidden on mobile unless open */}
          <div
            className={`
              fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] transition-transform duration-200
              lg:relative lg:top-0 lg:z-auto lg:translate-x-0
              ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <Sidebar />
          </div>

          <main
            id="main-content"
            className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-20 md:pb-6"
            role="main"
          >
            {/* Breadcrumbs (Phase 3.3.3) */}
            <Breadcrumbs className="mb-4" />
            {/* ErrorBoundary per route (Phase 6.2.4) */}
            <ErrorBoundary
              fallback={({ error, reset }) => (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 p-4 bg-destructive/10 rounded-xl">
                    <svg
                      className="h-8 w-8 text-destructive"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    {error.message}
                  </p>
                  <button
                    onClick={reset}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    Try Again
                  </button>
                </div>
              )}
            >
              <PageTransition>{children}</PageTransition>
            </ErrorBoundary>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav />
      </div>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
