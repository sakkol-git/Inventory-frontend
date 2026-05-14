/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PasswordStrengthMeter — Visual password strength indicator.
 *
 * Phase 5.3.4 / Phase 10.2.1 — Forms & Auth.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Check, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  barColor: string;
}

const REQUIREMENTS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function calculateStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: "", color: "", barColor: "" };

  const passed = REQUIREMENTS.filter((r) => r.test(password)).length;

  if (passed <= 1)
    return {
      score: 1,
      label: "Weak",
      color: "text-destructive",
      barColor: "bg-destructive",
    };
  if (passed <= 2)
    return {
      score: 2,
      label: "Fair",
      color: "text-warning",
      barColor: "bg-warning",
    };
  if (passed <= 3)
    return {
      score: 3,
      label: "Strong",
      color: "text-info",
      barColor: "bg-info",
    };
  return {
    score: 4,
    label: "Very Strong",
    color: "text-success",
    barColor: "bg-success",
  };
}

export function PasswordStrengthMeter({
  password,
  className,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                strength.score >= level ? strength.barColor : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className={cn("text-xs font-medium", strength.color)}>
          {strength.label}
        </p>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="space-y-1">
          {REQUIREMENTS.map((req) => {
            const passed = req.test(password);
            return (
              <div key={req.label} className="flex items-center gap-1.5">
                {passed ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground/50" />
                )}
                <span
                  className={cn(
                    "text-xs transition-colors",
                    passed ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
