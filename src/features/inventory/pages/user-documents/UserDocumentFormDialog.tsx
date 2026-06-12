import { Paperclip } from "lucide-react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

        <Form {...form}>
          <form className="space-y-4" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name={"title" as Path<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input id={`${mode}-title`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"file_type" as Path<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Type</FormLabel>
                  <Select value={String(field.value || "")} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id={`${mode}-file-type`}>
                        <SelectValue placeholder="Select file type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FILE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"file" as Path<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fileRequired ? "File" : "Replace File"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`${mode}-file`}
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        className="border-0 p-0 shadow-none focus-visible:ring-0 aria-invalid:border-0"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          field.onChange(file);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {fileRequired
                      ? "Upload a document file. Maximum size is 10 MB."
                      : "Leave empty to keep the current file."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"description" as Path<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input id={`${mode}-description`} {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : mode === "create" ? "Upload" : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDocumentFormDialog;