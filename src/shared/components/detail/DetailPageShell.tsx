import AppLayout from "@/core/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
    AlertTriangle,
    ArrowLeft,
    ChevronRight
} from "lucide-react";
import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ─── Loading Skeleton ──────────────────────────────────────────────────── */

export const DetailSkeleton = () => (
  <AppLayout>
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* back + header */}
      <div className="h-5 w-32 bg-muted rounded" />
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 bg-muted rounded" />
        <div className="space-y-2 flex-1">
          <div className="h-7 w-60 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
      </div>
      {/* cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  </AppLayout>
);

/* ─── Not-Found State ────────────────────────────────────────────────────── */

interface NotFoundProps {
  category: string;
  id: string | undefined;
  backTo: string;
  backLabel: string;
}

export const DetailNotFound = ({
  category,
  id,
  backTo,
  backLabel,
}: NotFoundProps) => {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-2 font-normal text-muted-foreground hover:text-foreground"
          onClick={() => navigate(backTo)}
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>

        <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/30 rounded-xl">
          <div className="p-4 bg-destructive/8 rounded-xl mb-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-medium mb-2">{category} Not Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            No {category.toLowerCase()} with identifier{" "}
            <span className="font-mono font-medium">{id ?? "—"}</span> exists in
            the system. It may have been removed or the URL is incorrect.
          </p>
          <Button onClick={() => navigate(backTo)} className="font-normal">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {backLabel}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

/* ─── Info Row (label + value pair) ──────────────────────────────────────── */

interface InfoRowProps {
  label: string;
  value: ReactNode;
  className?: string;
  mono?: boolean;
}

export const InfoRow = ({ label, value, className, mono }: InfoRowProps) => (
  <div className={cn("flex flex-col gap-1", className)}>
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span
      className={cn(
        "text-sm text-foreground leading-relaxed",
        mono && "font-mono",
      )}
    >
      {value || "—"}
    </span>
  </div>
);

/* ─── Section Card ──────────────────────────────────────────────────────── */

interface SectionCardProps {
  title: string;
  icon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export const SectionCard = ({
  title,
  icon: Icon,
  children,
  className,
  headerAction,
}: SectionCardProps) => (
  <div
    className={cn(
      "bg-card rounded-xl p-5 border border-border shadow-sm",
      className,
    )}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {headerAction}
    </div>
    {children}
  </div>
);

/* ─── Stat Mini-Card ─────────────────────────────────────────────────────── */

interface StatMiniProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
  className?: string;
}

export const StatMini = ({
  label,
  value,
  icon: Icon,
  color,
  className,
}: StatMiniProps) => (
  <div
    className={cn(
      "bg-card rounded-xl p-4 flex items-center gap-3 border border-border shadow-sm",
      className,
    )}
  >
    {Icon && (
      <div
        className="p-2.5 rounded-lg"
        style={{ backgroundColor: color ? `${color}15` : undefined }}
      >
        <Icon className="h-5 w-5" style={{ color: color || undefined }} />
      </div>
    )}
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  </div>
);

/* ─── Detail Page Header ─────────────────────────────────────────────────── */

interface DetailHeaderProps {
  backTo: string;
  backLabel: string;
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor: string;
  title: string;
  subtitle: string;
  id: string;
  actions?: ReactNode;
}

export const DetailHeader = ({
  backTo,
  backLabel,
  icon: Icon,
  iconColor,
  title,
  subtitle,
  id,
  actions,
}: DetailHeaderProps) => {
  const navigate = useNavigate();
  return (
    <>
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li>
            <Link to="/" className="breadcrumb-item">
              Dashboard
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5 breadcrumb-separator" />
          </li>
          <li>
            <Link to={backTo} className="breadcrumb-item">
              {backLabel}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5 breadcrumb-separator" />
          </li>
          <li aria-current="page">
            <span className="breadcrumb-current">{title}</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="bg-muted rounded-xl p-3"
            style={{ backgroundColor: `${iconColor}15` }}
            aria-hidden="true"
          >
            <Icon className="h-7 w-7" style={{ color: iconColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
              <span
                className="font-mono text-xs bg-muted px-2.5 py-1 rounded-lg font-medium"
                aria-label={`ID: ${id}`}
              >
                {id}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap">{actions}</div>
        )}
      </div>
    </>
  );
};
