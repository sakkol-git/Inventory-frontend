/* ═══════════════════════════════════════════════════════════════════════════
 * User Documents — Upload, list and download user documents.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/core/auth/PermissionGate";
import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import PageHeader from "@/shared/components/PageHeader";

import {
    downloadDocument,
    useDeleteUserDocument as useDeleteDocument,
    useUploadDocument,
    useUserDocuments,
} from "@/features/inventory/services/userDocumentService";
import type { UserDocument } from "@/shared/types/index";
import {
    storeUserDocumentSchema,
    type StoreUserDocumentPayload,
} from "@/shared/types/schemas";

const FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "image", label: "Image" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];

const UserDocuments = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: documents = [], isLoading } = useUserDocuments();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const form = useForm<StoreUserDocumentPayload>({
    resolver: zodResolver(storeUserDocumentSchema),
  });

  const handleUpload = form.handleSubmit(async (data) => {
    try {
      await uploadMutation.mutateAsync(data);
      toast.success("Document uploaded");
      setUploadOpen(false);
      form.reset();
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Upload failed");
    }
  });

  const handleDownload = async (doc: UserDocument) => {
    try {
      await downloadDocument(doc.id, doc.title);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleteId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="User Documents"
          description="Upload and manage personal documents"
          icon={FileText}
          actions={
            <PermissionGate permission="user_documents.create">
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </PermissionGate>
          }
        />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No documents uploaded.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {doc.file_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                    <TableCell>
                      {typeof doc.user === "object" && "name" in doc.user
                        ? doc.user.name
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <PermissionGate permission="user_documents.delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setDeleteId(doc.id);
                              setDeleteTitle(doc.title);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Upload Dialog */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label>File * (max 10MB)</Label>
                <Input
                  ref={fileRef}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) form.setValue("file", file);
                  }}
                />
                {form.formState.errors.file && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.file.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input {...form.register("title")} />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.title.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>File Type *</Label>
                <Select
                  onValueChange={(v) =>
                    form.setValue(
                      "file_type",
                      v as StoreUserDocumentPayload["file_type"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.file_type && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.file_type.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input {...form.register("description")} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading…" : "Upload"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(v) => !v && setDeleteId(null)}
          title="Delete Document"
          description={`Are you sure you want to delete "${deleteTitle}"? This cannot be undone.`}
          onConfirm={handleDelete}
          confirmLabel="Delete"
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
};

export default UserDocuments;
