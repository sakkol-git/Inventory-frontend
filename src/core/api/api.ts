// ═══════════════════════════════════════════════════════════════════════════
// API Client — Axios instance with Bearer-token JWT auth
//
// tymon/jwt-auth reads from the "Authorization: Bearer <token>" header.
// We persist the token in localStorage so it survives page refreshes.
// The httpOnly cookie is kept as a secondary mechanism (Postman, mobile).
// ═══════════════════════════════════════════════════════════════════════════

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// ── Token helpers ─────────────────────────────────────────────────────────
const TOKEN_KEY = "plant_lab_token";
export const saveToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Prefer the explicit env var; fall back to the Vite-proxied relative path
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "/api/v1";

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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      storedToken
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
        clearToken();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
