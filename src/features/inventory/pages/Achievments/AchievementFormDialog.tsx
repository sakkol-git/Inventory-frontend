import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StoreAchievementPayload } from "@/shared/types/schemas";
import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";

import { AchievementFormFields } from "./AchievementFormFields";

type AchievementFormDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  form: UseFormReturn<StoreAchievementPayload>;
  onOpenChange: (open: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
};

export const AchievementFormDialog = ({
  mode,
  open,
  form,
  onOpenChange,
  onSubmit,
  isPending,
}: AchievementFormDialogProps) => {
  const title = mode === "create" ? "Add Achievement" : "Edit Achievement";
  const description =
    mode === "create"
      ? "Create a new achievement definition."
      : "Update the selected achievement definition.";
  const actionLabel = mode === "create" ? "Create" : "Save Changes";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          <AchievementFormFields form={form} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : actionLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};