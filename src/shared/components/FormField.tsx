/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FormField — Standardized form field wrapper.
 *
 * Composes: Label · Input/Select/Textarea · hint · FormFieldError
 * into a consistent `form-field` container (gap-1.5).
 *
 * Usage:
 *   <FormField id="eq-name" label="Equipment Name" required error={errors.name}>
 *     <Input id="eq-name" value={...} onChange={...} />
 *   </FormField>
 *
 *   <FormField id="cat" label="Category" hint="Choose the primary category">
 *     <Select ...>...</Select>
 *   </FormField>
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";
import { FormFieldError } from "./FormFieldError";

// ─── Types ─────────────────────────────────────────────────────────────────

interface FormFieldProps {
  /** Associates the label with its control via htmlFor */
  id: string;
  /** Label text */
  label: string;
  /** Marks the field as required — shows a red asterisk after the label */
  required?: boolean;
  /** Validation error message; hides hint when set */
  error?: string;
  /** Supporting text shown below the input when there is no error */
  hint?: string;
  /** The input/select/textarea control */
  children: ReactNode;
  /** Extra classes on the wrapper div */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("form-field", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      {children}

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      <FormFieldError error={error} />
    </div>
  );
}
