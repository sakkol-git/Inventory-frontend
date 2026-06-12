// ═══════════════════════════════════════════════════════════════════════════
// API Client — Axios instance with Bearer-token JWT auth
//
// tymon/jwt-auth reads from the "Authorization: Bearer <token>" header.
// We persist the token in localStorage so it survives page refreshes.
// The httpOnly cookie is kept as a secondary mechanism (Postman, mobile).
// ═══════════════════════════════════════════════════════════════════════════

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// ── Token helpers ─────────────────────────────────────────────────────────
const TOKEN_KEY = "plant_lab_token";
export const saveToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, "");

// Prefer the deployed backend when provided; otherwise use the Vite proxy path.
const API_BASE_URL = (() => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl) {
    return `${normalizeBaseUrl(backendUrl)}/api/v1`;
  }

  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "/api/v1"
  );
})();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// A bare axios instance (no 401-response interceptor) used ONLY for the
// refresh call to avoid the infinite-retry deadlock.
export const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Attach stored Bearer token to every outgoing request ──────────────────
const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
api.interceptors.request.use(attachToken);
refreshClient.interceptors.request.use(attachToken);

// ── 401 → silent refresh interceptor ──────────────────────────────────────
// Closes AUDIT #1 — 401 interceptor infinite hang
//
// Prevents infinite refresh loops by:
// 1. Bounding refresh attempts to 1 per token failure
// 2. Never attempting to refresh the /auth/refresh endpoint itself
// 3. Ensuring queued requests are rejected (not hung) if refresh fails
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, success = false) => {
  failedQueue.forEach((prom) => {
    if (success) prom.resolve(undefined);
    else prom.reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt a silent refresh if we actually have a stored token.
    // Without a token the refresh endpoint will also 401, creating noisy
    // cascading errors on initial page load when the user isn't logged in.
    const storedToken = getToken();

    // ❌ GUARD: Do not attempt to refresh the refresh endpoint itself
    // This prevents recursive 401 → refresh → 401 → refresh loops
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      storedToken &&
      !isRefreshEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Backend returns { access_token: "..." } on refresh
        const { data } = await refreshClient.post<{ access_token: string }>(
          "/auth/refresh",
        );
        saveToken(data.access_token);
        // Update the Authorization header on the queued/original request
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, true);
        return api(originalRequest);
      } catch (refreshError) {
        // ❌ GUARD: If refresh itself fails, immediately reject the queue
        // and reset isRefreshing to false so subsequent requests don't hang.
        // The finally block ensures this happens.
        clearToken();
        processQueue(refreshError);
        // Force redirect to login on fatal refresh failure
        if (window.location.pathname !== "/login") {
          window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
        }
        return Promise.reject(refreshError);
      } finally {
        // ✅ CRITICAL: Always reset isRefreshing, even if processQueue throws.
        // Without this, all subsequent requests would hang forever.
        isRefreshing = false;
      }
    }

    // ── Global Error Handling Matrix ─────────────────────────────────────────
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as Record<string, unknown>;
      const correlationId = data?.correlation_id ? ` Ref: ${data.correlation_id}` : "";

      switch (status) {
        case 400:
          toast.error(`Invalid request sent.${correlationId}`);
          break;
        case 401:
          // If 401 reaches here (not caught by refresh logic above)
          clearToken();
          toast.error("Session expired. Please log in.");
          if (window.location.pathname !== "/login") {
            window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
          }
          break;
        case 403:
          toast.error(`You do not have permission to do this.${correlationId}`);
          break;
        case 404:
          // Let components handle 404s (e.g., redirect to list or show not found)
          break;
        case 409:
          toast.error(typeof data?.message === "string" ? data.message : `State conflict occurred.${correlationId}`);
          break;
        case 422:
          // 422 handled by React Query onError to bind to form fields
          break;
        case 429:
          toast.error(`Too many requests. Please wait.${correlationId}`);
          break;
        case 500:
          toast.error(`A system error occurred.${correlationId}`);
          break;
        case 502:
        case 503:
        case 504:
          toast.error(`Service is temporarily unavailable.${correlationId}`);
          break;
      }
    } else if (error.request) {
      if (error.code === "ECONNABORTED") {
        toast.error("The request timed out. Please check your connection.");
      } else if (!window.navigator.onLine) {
        // Offline state handled by global banner, but can show toast too
      } else {
        toast.error("Network error. Please check your connection.");
      }
    }

    return Promise.reject(error);
  },
);
