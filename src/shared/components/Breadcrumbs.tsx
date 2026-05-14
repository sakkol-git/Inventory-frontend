/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Breadcrumbs — Auto-generated breadcrumb trail from current route.
 *
 * Phase 3.3 — Navigation & Information Architecture.
 * Uses CSS classes from components.css: .breadcrumb, .breadcrumb-item, etc.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/shared/lib/utils";

// Route label map for human-readable breadcrumb text
const ROUTE_LABELS: Record<string, string> = {
  inventory: "Inventory",
  research: "Research",
  business: "Business",
  admin: "Administration",
  reports: "Reports",
  equipment: "Equipment",
  chemicals: "Chemicals",
  "plant-samples": "Plant Samples",
  "plant-varieties": "Plant Varieties",
  "plant-species": "Plant Species",
  "plant-stock": "Plant Stock",
  "borrow-records": "Borrow Records",
  "maintenance-records": "Maintenance Records",
  transactions: "Transactions",
  achievements: "Achievements",
  users: "Users",
  experiments: "Experiments",
  protocols: "Protocols",
  notebooks: "Lab Notebooks",
  analysis: "Growth Analysis",
  samples: "Sample Tracking",
  clients: "Clients",
  contracts: "Contracts",
  payments: "Payments",
  "lab-services": "Lab Services",
  production: "Production Planner",
  dashboard: "Dashboard",
  roles: "Role Management",
  permissions: "Permission Management",
  "activity-log": "Activity Log",
  profile: "Profile",
  documents: "Documents",
  products: "Products",
  pending: "Pending",
  overdue: "Overdue",
};

function formatSegment(segment: string): string {
  return (
    ROUTE_LABELS[segment] ??
    segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

interface BreadcrumbsProps {
  className?: string;
  /** Override auto-generated items */
  items?: Array<{ label: string; href?: string }>;
}

export function Breadcrumbs({ className, items }: BreadcrumbsProps) {
  const location = useLocation();

  const breadcrumbs =
    items ??
    (() => {
      const segments = location.pathname.split("/").filter(Boolean);
      const crumbs: Array<{ label: string; href?: string }> = [];

      for (let i = 0; i < segments.length; i++) {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = formatSegment(segments[i]);

        // Skip "products" intermediate segment
        if (segments[i] === "products") continue;

        // Don't make the last segment a link
        if (i === segments.length - 1) {
          crumbs.push({ label });
        } else {
          crumbs.push({ label, href });
        }
      }
      return crumbs;
    })();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("breadcrumb", className)}>
      <Link to="/" className="breadcrumb-item" aria-label="Home">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {breadcrumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight
            className="h-3 w-3 breadcrumb-separator"
            aria-hidden="true"
          />
          {crumb.href ? (
            <Link to={crumb.href} className="breadcrumb-item">
              {crumb.label}
            </Link>
          ) : (
            <span className="breadcrumb-current">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
