/* ═══════════════════════════════════════════════════════════════════════════
 * User Documents — Composition root.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/core/auth/PermissionGate";
import AppLayout from "@/core/layouts/AppLayout";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import PageHeader from "@/shared/components/PageHeader";

import UserDocumentFormDialog from "./UserDocumentFormDialog";
import UserDocumentsTable from "./UserDocumentsTable";
import useUserDocumentsView from "./useUserDocumentsView";

const UserDocuments = () => {
  const view = useUserDocumentsView();

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title={view.pageTitle.title}
          description={view.pageTitle.description}
          icon={FileText}
          actions={
            <PermissionGate
              permission="documents.create"
              fallback={
                <Button disabled title="You don't have permission to upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              }
            >
              <Button onClick={view.openCreateForm}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </PermissionGate>
          }
        />

        <UserDocumentsTable
          documents={view.documents}
          isLoading={view.isLoading}
          onDownload={view.handleDownload}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteDocument}
        />

        <UserDocumentFormDialog
          open={view.createOpen}
          onOpenChange={(open) => {
            if (open) {
              view.openCreateForm();
            } else {
              view.closeCreateForm();
            }
          }}
          title="Upload Document"
          description="Add a new document with its file, title, and type."
          mode="create"
          form={view.createForm}
          fileInputRef={view.createFileRef}
          onSubmit={view.handleCreate}
          isPending={view.uploadPending}
        />

        <UserDocumentFormDialog
          open={view.editOpen}
          onOpenChange={(open) => {
            if (!open) {
              view.closeEditForm();
            }
          }}
          title="Edit Document"
          description="Update document metadata or replace the uploaded file."
          mode="edit"
          form={view.editForm}
          fileInputRef={view.editFileRef}
          onSubmit={view.handleUpdate}
          isPending={view.updatePending}
        />

        <ConfirmDialog
          open={view.deleteOpen}
          onOpenChange={(open) => !open && view.setDeleteId(null)}
          title="Delete Document"
          description={`Are you sure you want to delete "${view.deleteTitle}"? This cannot be undone.`}
          onConfirm={view.confirmDeleteDocument}
          confirmLabel="Delete"
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
};

export default UserDocuments;
