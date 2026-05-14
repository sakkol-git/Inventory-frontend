/**
 * ═══════════════════════════════════════════════════════════════════════════
 * getGreeting — Time-of-day personalized greeting.
 *
 * Phase 20.5.2 — Engagement.
 *
 * Usage:
 *   getGreeting("Sarah") → "Good morning, Sarah"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  let period: string;

  if (hour < 12) period = "Good morning";
  else if (hour < 17) period = "Good afternoon";
  else period = "Good evening";

  return name ? `${period}, ${name.split(" ")[0]}` : period;
}
