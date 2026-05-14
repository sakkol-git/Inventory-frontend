/* ═══════════════════════════════════════════════════════════════════════════
 * PermissionGate — Conditionally render children based on Spatie permissions.
 *
 * Usage:
 *   <PermissionGate permission="plants.delete">
 *     <DeleteButton />
 *   </PermissionGate>
 *
 *   <PermissionGate permission={["borrows.approve", "borrows.return"]} fallback={<DisabledButton />}>
 *     <ActionButton />
 *   </PermissionGate>
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useAuth } from "@/core/auth/useAuth";
import type { ReactNode } from "react";

interface PermissionGateProps {
  /** A single permission string or array of permissions (any match = allowed) */
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { permissions } = useAuth();
  const required = Array.isArray(permission) ? permission : [permission];
  const hasPermission = required.some((p) => permissions.includes(p));
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// ─── OwnerOrPermissionGate ───────────────────────────────────────────────────
// Show content if user owns the resource OR has the specified permission.

interface OwnerOrPermissionGateProps {
  permission: string | string[];
  resourceOwnerUserId: number;
  children: ReactNode;
  fallback?: ReactNode;
}

export function OwnerOrPermissionGate({
  permission,
  resourceOwnerUserId,
  children,
  fallback = null,
}: OwnerOrPermissionGateProps) {
  const { permissions, user } = useAuth();
  const required = Array.isArray(permission) ? permission : [permission];
  const hasPerm = required.some((p) => permissions.includes(p));
  const isOwner = user?.id === resourceOwnerUserId;

  if (hasPerm || isOwner) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
