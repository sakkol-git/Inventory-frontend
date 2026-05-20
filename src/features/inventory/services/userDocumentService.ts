// ═══════════════════════════════════════════════════════════════════════════
// User Document Service — FormData upload, blob download
// ═══════════════════════════════════════════════════════════════════════════

import { api, getToken } from "@/core/api/api";
import type { ApiResponse, UserDocument } from "@/shared/types/index";
import type {
  StoreUserDocumentPayload,
  UpdateUserDocumentPayload,
} from "@/shared/types/schemas";
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

export const useUpdateUserDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateUserDocumentPayload;
    }) => {
      if (payload.file) {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("file", payload.file);
        if (payload.title !== undefined) {
          formData.append("title", payload.title);
        }
        if (payload.file_type !== undefined) {
          formData.append("file_type", payload.file_type);
        }
        if (payload.description !== undefined && payload.description !== null) {
          formData.append("description", payload.description);
        }

        const { data } = await api.post<ApiResponse<UserDocument>>(
          `/user-documents/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        return data.data;
      }

      const { data } = await api.put<ApiResponse<UserDocument>>(
        `/user-documents/${id}`,
        {
          title: payload.title,
          file_type: payload.file_type,
          description: payload.description,
        },
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
export const downloadDocument = async (
  idOrUrl: number | string,
  filename?: string,
) => {
  // If a full URL is provided (download_url), fetch it directly
  if (typeof idOrUrl === "string" && /^https?:\/\//.test(idOrUrl)) {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await fetch(idOrUrl, {
      headers,
      credentials: "include",
    });
    if (!resp.ok) throw new Error("Failed to download file");
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename ?? "download");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return;
  }

  // Otherwise treat as an ID and call the API endpoint
  const id = Number(idOrUrl);
  const { data } = await api.get(`/user-documents/${id}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data as BlobPart]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename ?? "download");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
