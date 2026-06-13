import { Download, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/core/auth/PermissionGate";
import type { UserDocument } from "@/shared/types/index";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type UserDocumentsTableProps = {
  documents: UserDocument[];
  isLoading: boolean;
  onDownload: (document: UserDocument) => void;
  onEdit: (document: UserDocument) => void;
  onDelete: (document: UserDocument) => void;
};

const UserDocumentsTable = ({
  documents,
  isLoading,
  onDownload,
  onEdit,
  onDelete,
}: UserDocumentsTableProps) => (
  <div className="rounded-lg border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uploaded By</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="py-8 text-center text-muted-foreground"
            >
              Loading…
            </TableCell>
          </TableRow>
        ) : documents.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="py-8 text-center text-muted-foreground"
            >
              No documents uploaded.
            </TableCell>
          </TableRow>
        ) : (
          documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="font-medium">{document.title}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {document.file_type}
                </Badge>
              </TableCell>
              <TableCell>{formatFileSize(document.file_size)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    document.status === "active"
                      ? "default"
                      : document.status === "failed"
                        ? "destructive"
                        : "outline"
                  }
                  className="capitalize"
                >
                  {document.status || "active"}
                </Badge>
              </TableCell>
              <TableCell>
                {typeof document.user === "object" && "name" in document.user
                  ? document.user.name
                  : "—"}
              </TableCell>
              <TableCell>{new Date(document.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(document)}
                    disabled={document.status !== "active"}
                    title={document.status !== "active" ? "Document is processing or failed" : "Download"}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <PermissionGate permission="documents.edit">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(document)}
                      disabled={document.status !== "active"}
                      title={document.status !== "active" ? "Cannot edit while processing" : "Edit"}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="documents.delete">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => onDelete(document)}
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
);

export default UserDocumentsTable;