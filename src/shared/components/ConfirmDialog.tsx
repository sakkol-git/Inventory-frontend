/* ═══════════════════════════════════════════════════════════════════════════
 * ConfirmDialog — Reusable confirmation dialog for destructive actions.
 *
 * Addresses: UI-005 (No confirmation dialogs for destructive actions)
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  /** Whether the action is currently processing */
  isPending?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isPending = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {isPending ? "Processing…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Hook for managing confirm dialog state ────────────────────────────────

import { useCallback, useState } from "react";

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingMeta, setPendingMeta] = useState<{
    title: string;
    description: string;
  }>({
    title: "Are you sure?",
    description: "This action cannot be undone.",
  });

  const requestConfirm = useCallback(
    (id: string, meta?: { title?: string; description?: string }) => {
      setPendingId(id);
      setPendingMeta({
        title: meta?.title ?? "Are you sure?",
        description: meta?.description ?? "This action cannot be undone.",
      });
      setOpen(true);
    },
    [],
  );

  const cancel = useCallback(() => {
    setOpen(false);
    setPendingId(null);
  }, []);

  const confirm = useCallback(
    (onConfirm: (id: string) => void) => {
      if (pendingId) {
        onConfirm(pendingId);
      }
      setOpen(false);
      setPendingId(null);
    },
    [pendingId],
  );

  return {
    open,
    setOpen,
    pendingId,
    pendingMeta,
    requestConfirm,
    cancel,
    confirm,
  };
}
