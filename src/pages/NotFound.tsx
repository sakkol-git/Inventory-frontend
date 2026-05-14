/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NotFound — Polished 404 page with navigation suggestions.
 *
 * Phase 20.5 — Final Polish.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ArrowLeft, Home, Search, Sprout } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

const SUGGESTED_LINKS = [
  { label: "Dashboard", path: "/inventory", icon: Home },
  { label: "Plant Samples", path: "/inventory/products/samples", icon: Sprout },
  { label: "Equipment", path: "/inventory/equipment", icon: Search },
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      {/* Animated 404 Hero */}
      <div className="relative mb-8 animate-fade-in">
        <div className="text-[10rem] font-bold leading-none tracking-tighter text-muted-foreground/10 select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-5 rounded-2xl bg-primary/10">
            <Sprout className="h-16 w-16 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      <h1 className="text-title mb-2">Page not found</h1>
      <p className="text-body-muted max-w-md mb-8">
        The page{" "}
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
          {location.pathname}
        </code>{" "}
        doesn't exist or may have been moved.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-10">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button className="gap-2" asChild>
          <Link to="/inventory">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>

      {/* Suggested Pages */}
      <div className="w-full max-w-sm">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Try these pages
        </p>
        <div className="space-y-2">
          {SUGGESTED_LINKS.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors group"
            >
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">{label}</span>
              <span className="ml-auto text-xs text-muted-foreground/50">
                {path}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
