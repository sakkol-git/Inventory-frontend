/* ═══════════════════════════════════════════════════════════════════════════
 * Samples List Renderer — Shows samples under a variety
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { PlantSample } from "@/features/inventory/types";
import { ArrowRight, FlaskConical, Package } from "lucide-react";
import { Link } from "react-router-dom";

export interface SamplesListSection {
  kind: "samples-list";
  title: string;
  icon: typeof FlaskConical;
  samples: PlantSample[];
}

export function SamplesListRenderer({
  section,
}: {
  section: SamplesListSection;
}) {
  const Icon = section.icon;

  if (!section.samples || section.samples.length === 0) {
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
            No samples collected yet.
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
            {section.samples.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {section.samples.map((sample) => (
            <Link
              key={sample.id}
              to={`/inventory/products/samples/${sample.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{sample.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{sample.sampleCode}</span>
                      {sample.storageLocation && (
                        <>
                          <span>•</span>
                          <span>{sample.storageLocation}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {sample.quantity && (
                      <Badge variant="outline" className="gap-1">
                        <Package className="h-3 w-3" />
                        {sample.quantity} {sample.quantityUnit || "units"}
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        sample.status === "Available" &&
                          "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
                        sample.status === "In Testing" &&
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
                      )}
                    >
                      {sample.status}
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
