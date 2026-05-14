// ═══════════════════════════════════════════════════════════════════════════
// AuthContext — localStorage Bearer-token JWT auth with silent refresh
//
// The access_token is stored in localStorage so requests always include
// "Authorization: Bearer <token>".  tymon/jwt-auth reads from this header.
// On page refresh we call /auth/profile directly; the 401 interceptor in
// api.ts transparently refreshes the token if it has expired.
// ═══════════════════════════════════════════════════════════════════════════

import { api, clearToken, saveToken } from "@/core/api/api";
import type { AuthProfileResponse, RegisterResponse } from "@/shared/types/index";
import type { LoginPayload, RegisterPayload } from "@/shared/types/schemas";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

// ── Context Shape ─────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthProfileResponse | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      // /auth/profile returns { data: UserResource } — unwrap one level.
      const { data } = await api.get<{ data: AuthProfileResponse }>("/auth/profile");
      setUser(data.data);
    } catch {
      setUser(null);
    }
  }, []);

  // On mount: restore session by calling /auth/profile.
  // The request interceptor in api.ts attaches the stored Bearer token.
  // If the token is expired the 401 interceptor silently refreshes it first.
  // If there is no token (or refresh fails) user stays null → not logged in.
  useEffect(() => {
    fetchProfile().finally(() => setIsLoading(false));
  }, [fetchProfile]);

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post<{ access_token: string }>(
      "/auth/login",
      payload,
    );
    saveToken(data.access_token);
    await fetchProfile();
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post<
      RegisterResponse & { access_token: string }
    >("/auth/register", payload);
    saveToken(data.access_token);
    await fetchProfile();
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearToken();
      setUser(null);
    }
  };

  const refreshUser = fetchProfile;

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions: user?.permissions ?? [],
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}
