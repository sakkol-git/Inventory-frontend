/* ═══════════════════════════════════════════════════════════════════════════
 * Varieties List Renderer — Shows varieties under a species
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { PlantVariety } from "@/features/inventory/types";
import { ArrowRight, FlaskConical, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

export interface VarietiesListSection {
  kind: "varieties-list";
  title: string;
  icon: typeof Sprout;
  varieties: PlantVariety[];
}

export function VarietiesListRenderer({
  section,
}: {
  section: VarietiesListSection;
}) {
  const Icon = section.icon;

  if (!section.varieties || section.varieties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4" />
            {section.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No varieties registered yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {section.title}
          <Badge variant="secondary" className="ml-2">
            {section.varieties.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {section.varieties.map((variety) => (
            <Link
              key={variety.id}
              to={`/inventory/products/varieties/${variety.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{variety.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{variety.varietyCode}</span>
                      {variety.cultivarName && (
                        <>
                          <span>•</span>
                          <span>{variety.cultivarName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <FlaskConical className="h-3 w-3" />
                      {variety.sampleCount || 0}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        variety.status === "Active" &&
                          "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
                      )}
                    >
                      {variety.status}
                    </Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
