/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EntityFormDialog — Standardized CRUD form dialog.
 *
 * Provides:
 *   - Consistent dialog sizing and scroll behavior
 *   - Loading spinner in submit button during mutations
 *   - Disabled state during pending
 *   - Cancel/Submit button layout
 *   - Type-safe form integration with react-hook-form
 *
 * Eliminates ~200 lines of repeated dialog boilerplate across pages.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";
import { type ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface EntityFormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void;
  /** Dialog title — e.g. "Add Chemical" or "Edit Equipment" */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Whether the form is currently submitting */
  isPending?: boolean;
  /** Submit button label — defaults to "Save" */
  submitLabel?: string;
  /** Pending submit label — defaults to "Saving…" */
  pendingLabel?: string;
  /** Cancel button label — defaults to "Cancel" */
  cancelLabel?: string;
  /** Form submit handler */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Form content — FormField components */
  children: ReactNode;
  /** Dialog width — 'sm' | 'md' | 'lg' */
  size?: "sm" | "md" | "lg";
  /** Additional class on DialogContent */
  className?: string;
  /** Whether to show the destructive variant submit */
  destructive?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

// ─── Component ─────────────────────────────────────────────────────────────

export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  isPending = false,
  submitLabel = "Save",
  pendingLabel = "Saving…",
  cancelLabel = "Cancel",
  onSubmit,
  children,
  size = "md",
  className,
  destructive = false,
}: EntityFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "max-h-[85vh] overflow-y-auto",
          className,
        )}
        onPointerDownOutside={(e) => {
          // Prevent closing during mutation
          if (isPending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isPending) onSubmit(e);
          }}
          className="space-y-4 py-2"
        >
          {children}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={isPending}
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
