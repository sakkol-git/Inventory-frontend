/* ═══════════════════════════════════════════════════════════════════════════
 * useAuth — Authentication and RBAC hook backed by real AuthContext.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useAuthContext } from "@/core/auth/AuthContext";

export function useAuth() {
  const {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  } = useAuthContext();

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (list: string[]): boolean => {
    return list.some((p) => permissions.includes(p));
  };

  const isRole = (role: string): boolean => {
    return user?.role === role;
  };

  return {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    isRole,
  } as const;
}
