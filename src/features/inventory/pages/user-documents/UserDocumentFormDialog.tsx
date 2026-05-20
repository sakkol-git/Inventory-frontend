import { Paperclip } from "lucide-react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DialogMode = "create" | "edit";

type UserDocumentFormDialogProps<TFieldValues extends FieldValues> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  mode: DialogMode;
  form: UseFormReturn<TFieldValues>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onSubmit: () => void;
  isPending: boolean;
};

const FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "image", label: "Image" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
] as const;

const UserDocumentFormDialog = <TFieldValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  mode,
  form,
  fileInputRef,
  onSubmit,
  isPending,
}: UserDocumentFormDialogProps<TFieldValues>) => {
  const fileRequired = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-title`}>Title</Label>
            <Input id={`${mode}-title`} {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {String(form.formState.errors.title.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-file-type`}>File Type</Label>
            <Select
              value={String(form.watch("file_type") ?? "")}
              onValueChange={(value) => {
                form.setValue("file_type", value as never, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger id={`${mode}-file-type`}>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.file_type && (
              <p className="text-xs text-destructive">
                {String(form.formState.errors.file_type.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-file`}>
              {fileRequired ? "File" : "Replace File"}
            </Label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <Input
                id={`${mode}-file`}
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                className="border-0 p-0 shadow-none focus-visible:ring-0"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  form.setValue("file", file as never, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {fileRequired
                ? "Upload a document file. Maximum size is 10 MB."
                : "Leave empty to keep the current file."}
            </p>
            {form.formState.errors.file && (
              <p className="text-xs text-destructive">
                {String(form.formState.errors.file.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-description`}>Description</Label>
            <Input id={`${mode}-description`} {...form.register("description")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : mode === "create" ? "Upload" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDocumentFormDialog;