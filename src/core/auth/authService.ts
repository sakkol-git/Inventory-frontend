// ═══════════════════════════════════════════════════════════════════════════
// Auth Service — TanStack Query hooks for authentication
// ═══════════════════════════════════════════════════════════════════════════

import { useAuthContext } from "@/core/auth/AuthContext";
import { api } from "@/core/api/api";
import type { AuthProfileResponse } from "@/shared/types/index";
import type { LoginPayload, RegisterPayload } from "@/shared/types/schemas";
import { useMutation, useQuery } from "@tanstack/react-query";

// ── Query: current user profile ───────────────────────────────────────────
// Backend returns { data: UserResource } — unwrap the JSON Resource envelope.
export const useCurrentUser = () =>
  useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const { data } = await api.get<{ data: AuthProfileResponse }>("/auth/profile");
      return data.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

// ── Mutation: login ───────────────────────────────────────────────────────
export const useLogin = () => {
  const { login } = useAuthContext();
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
};

// ── Mutation: register ────────────────────────────────────────────────────
export const useRegister = () => {
  const { register } = useAuthContext();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
};

// ── Mutation: logout ──────────────────────────────────────────────────────
export const useLogout = () => {
  const { logout } = useAuthContext();
  return useMutation({
    mutationFn: () => logout(),
  });
};

// ── Mutation: refresh token ───────────────────────────────────────────────
export const useRefreshToken = () =>
  useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{
        access_token: string;
        expires_in: number;
        token_type: string;
      }>("/auth/refresh");
      return data;
    },
  });
