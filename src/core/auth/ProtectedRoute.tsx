/* ═══════════════════════════════════════════════════════════════════════════
 * ProtectedRoute — Route guard that requires authentication.
 * Optionally checks for a specific permission string (Spatie permission name).
 *
 * Usage in App.tsx:
 *   <Route path="/inventory/users" element={
 *     <ProtectedRoute permission="users.view">
 *       <Users />
 *     </ProtectedRoute>
 *   } />
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useAuth } from "@/core/auth/useAuth";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Spatie permission string (e.g. "users.view") */
  permission?: string;
  /** Required role string (e.g. "admin") */
  requiredRole?: string;
  /** Where to redirect unauthenticated users (defaults to /login) */
  redirectTo?: string;
  /** Where to redirect unauthorized (but authenticated) users */
  unauthorizedRedirectTo?: string;
}

export function ProtectedRoute({
  children,
  permission,
  requiredRole,
  redirectTo = "/login",
  unauthorizedRedirectTo = "/inventory",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, isRole } = useAuth();

  if (isLoading) return null; // Wait for auth to resolve

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to={unauthorizedRedirectTo} replace />;
  }

  if (requiredRole && !isRole(requiredRole)) {
    return <Navigate to={unauthorizedRedirectTo} replace />;
  }

  return <>{children}</>;
}
