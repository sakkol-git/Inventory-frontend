import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { handleFormError } from "@/lib/errors/handleFormError";

import {
  downloadDocument,
  useDeleteUserDocument,
  useUpdateUserDocument,
  useUploadDocument,
  useUserDocuments,
} from "@/features/inventory/services/userDocumentService";
import type { UserDocument } from "@/shared/types/index";
import {
  storeUserDocumentSchema,
  type StoreUserDocumentPayload,
  updateUserDocumentSchema,
  type UpdateUserDocumentPayload,
} from "@/shared/types/schemas";

export const useUserDocumentsView = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [editingDocument, setEditingDocument] = useState<UserDocument | null>(
    null,
  );

  const createFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const { data: documents = [], isLoading } = useUserDocuments();
  const uploadMutation = useUploadDocument();
  const updateMutation = useUpdateUserDocument();
  const deleteMutation = useDeleteUserDocument();

  const createForm = useForm<StoreUserDocumentPayload>({
    resolver: zodResolver(storeUserDocumentSchema),
    defaultValues: {
      title: "",
      file_type: "pdf",
      description: "",
    },
  });

  const editForm = useForm<UpdateUserDocumentPayload>({
    resolver: zodResolver(updateUserDocumentSchema),
    defaultValues: {
      title: "",
      file_type: "pdf",
      description: "",
    },
  });

  const openCreateForm = () => {
    createForm.reset({
      title: "",
      file_type: "pdf",
      description: "",
    });
    setCreateOpen(true);
  };

  const closeCreateForm = () => {
    setCreateOpen(false);
    createForm.reset({
      title: "",
      file_type: "pdf",
      description: "",
    });
    if (createFileRef.current) {
      createFileRef.current.value = "";
    }
  };

  const openEditForm = (document: UserDocument) => {
    setEditingDocument(document);
    editForm.reset({
      title: document.title,
      file_type: document.file_type,
      description: document.description ?? "",
    });
    setEditOpen(true);
  };

  const closeEditForm = () => {
    setEditOpen(false);
    setEditingDocument(null);
    editForm.reset({
      title: "",
      file_type: "pdf",
      description: "",
    });
    if (editFileRef.current) {
      editFileRef.current.value = "";
    }
  };

  const handleCreate = createForm.handleSubmit(async (data) => {
    try {
      await uploadMutation.mutateAsync(data);
      toast.success("Document uploaded");
      closeCreateForm();
    } catch (error) {
      handleFormError(error, createForm, "Upload failed");
    }
  });

  const handleUpdate = editForm.handleSubmit(async (data) => {
    if (!editingDocument) return;
    try {
      await updateMutation.mutateAsync({
        id: editingDocument.id,
        payload: data,
      });
      toast.success("Document updated");
      closeEditForm();
    } catch (error) {
      handleFormError(error, editForm, "Update failed");
    }
  });

  const requestDeleteDocument = (document: UserDocument) => {
    setDeleteId(document.id);
    setDeleteTitle(document.title);
  };

  const confirmDeleteDocument = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleteId(null);
      setDeleteTitle("");
    }
  };

  const handleDownload = async (document: UserDocument) => {
    try {
      await downloadDocument(document.id, document.title);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download file");
    }
  };

  const pageTitle = useMemo(
    () => ({
      title: "User Documents",
      description: "Upload and manage personal documents",
      icon: FileText,
    }),
    [],
  );

  return {
    pageTitle,
    documents,
    isLoading,
    createOpen,
    editOpen,
    deleteOpen: Boolean(deleteId),
    deleteTitle,
    editingDocument,
    createForm,
    editForm,
    createFileRef,
    editFileRef,
    uploadPending: uploadMutation.isPending,
    updatePending: updateMutation.isPending,
    deletePending: deleteMutation.isPending,
    openCreateForm,
    closeCreateForm,
    openEditForm,
    closeEditForm,
    setDeleteId,
    requestDeleteDocument,
    confirmDeleteDocument,
    handleCreate,
    handleUpdate,
    handleDownload,
  };
};

export default useUserDocumentsView;