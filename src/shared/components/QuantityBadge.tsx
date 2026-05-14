/* ═══════════════════════════════════════════════════════════════════════════
 * QuantityBadge — Display quantity/amount with units
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { Package } from "lucide-react";

export interface QuantityBadgeProps {
  quantity: number;
  unit: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
  showIcon?: boolean;
}

export function QuantityBadge({
  quantity,
  unit,
  className,
  variant = "secondary",
  showIcon = true,
}: QuantityBadgeProps) {
  // Determine variant based on quantity level
  let displayVariant = variant;
  if (variant === "default") {
    if (quantity === 0) {
      displayVariant = "outline";
    } else if (quantity < 10) {
      displayVariant = "warning";
    } else {
      displayVariant = "success";
    }
  }

  const badgeClassName = cn("font-mono font-semibold gap-1", className);

  const variantStyles = {
    default: "",
    secondary: "",
    outline: "border-muted-foreground/20 text-muted-foreground",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <Badge
      variant={
        displayVariant === "outline"
          ? "outline"
          : displayVariant === "success" || displayVariant === "warning"
            ? "outline"
            : "secondary"
      }
      className={cn(badgeClassName, variantStyles[displayVariant])}
    >
      {showIcon && <Package className="h-3 w-3" />}
      <span>
        {quantity.toLocaleString()} {unit}
      </span>
    </Badge>
  );
}

export default QuantityBadge;
