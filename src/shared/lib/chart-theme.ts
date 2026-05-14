/**
 * Shared Recharts configuration for minimalist design system.
 */

/** Tooltip style matching the design system: hard border, 0 radius, hard shadow */
export const chartTooltipStyle: React.CSSProperties = {
  border: "2px solid hsl(var(--border))",
  borderRadius: "0px",
  fontSize: "12px",
  fontWeight: 600,
  boxShadow: "3px 3px 0px hsl(var(--border))",
  backgroundColor: "hsl(var(--card))",
};

/** CartesianGrid props */
export const chartGridProps = {
  strokeDasharray: "3 3",
  stroke: "hsl(var(--border))",
  opacity: 0.5,
} as const;

/** Axis tick style */
export const chartAxisStyle = {
  fontSize: 11,
  fontWeight: 600,
  fill: "hsl(var(--muted-foreground))",
} as const;

/** Bar/Line stroke */
export const chartBorderProps = {
  stroke: "hsl(var(--border))",
  strokeWidth: 2,
} as const;
