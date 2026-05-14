// ═══════════════════════════════════════════════════════════════════════════
// User Document Service — FormData upload, blob download
// ═══════════════════════════════════════════════════════════════════════════

import { api } from "@/core/api/api";
import type { ApiResponse, UserDocument } from "@/shared/types/index";
import type { StoreUserDocumentPayload } from "@/shared/types/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["user-documents"] as const;

export const useUserDocuments = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserDocument[]>>(
        "/user-documents",
        { params },
      );
      return data.data;
    },
  });

export const useUserDocumentById = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserDocument>>(
        `/user-documents/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StoreUserDocumentPayload) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("title", payload.title);
      formData.append("file_type", payload.file_type);
      if (payload.description) {
        formData.append("description", payload.description);
      }
      const { data } = await api.post<ApiResponse<UserDocument>>(
        "/user-documents",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteUserDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/user-documents/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

// ── File download (imperative helper) ────────────────────────────────────
export const downloadDocument = async (id: number, filename: string) => {
  const { data } = await api.get(`/user-documents/${id}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data as BlobPart]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
