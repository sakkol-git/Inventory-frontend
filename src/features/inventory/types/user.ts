// ═══════════════════════════════════════════════════════════════════════════
// USER MODULE — Frontend Display Models (offline / demo pages)
//
// ⚠️  These types are for the DEMO pages only. For API-matching types use
//     `@/types` (index.ts) and `@/shared/types/enums` (enums.ts).
//
//     API roles (enums.ts): "admin" | "lab_manager" | "student"
//     Display roles below are for the frontend permission matrix ONLY.
// ═══════════════════════════════════════════════════════════════════════════

import type { Auditable } from "./display";

// ─── Display User Roles (frontend only — NOT the API enum) ──────────────
export type DisplayUserRole =
  | "Admin"
  | "Lab Manager"
  | "Researcher"
  | "Lab Assistant"
  | "Intern"
  | "Guest";
export type AchievementStatus = "Draft" | "Published";

// ─── Role Permission Map ────────────────────────────────────────────────────
export interface RolePermissions {
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageSystemSettings: boolean;
  canDeleteAnyData: boolean;
  canAccessInventory: boolean;
  canAccessBusiness: boolean;
  canAccessResearch: boolean;
  canInputInventory: boolean;
  canUpdateChemicalQuantity: boolean;
  canCreateLabService: boolean;
  canDeleteSpecies: boolean;
  canViewAllAchievements: boolean;
  canManageOwnAchievements: boolean;
  canManageOwnProfile: boolean;
  canExportData: boolean;
  canImportData: boolean;
}

export const ROLE_PERMISSIONS: Record<DisplayUserRole, RolePermissions> = {
  Admin: {
    canManageUsers: true,
    canManageRoles: true,
    canManageSystemSettings: true,
    canDeleteAnyData: true,
    canAccessInventory: true,
    canAccessBusiness: true,
    canAccessResearch: true,
    canInputInventory: true,
    canUpdateChemicalQuantity: true,
    canCreateLabService: true,
    canDeleteSpecies: true,
    canViewAllAchievements: true,
    canManageOwnAchievements: true,
    canManageOwnProfile: true,
    canExportData: true,
    canImportData: true,
  },
  "Lab Manager": {
    canManageUsers: true,
    canManageRoles: false,
    canManageSystemSettings: false,
    canDeleteAnyData: false,
    canAccessInventory: true,
    canAccessBusiness: true,
    canAccessResearch: true,
    canInputInventory: true,
    canUpdateChemicalQuantity: true,
    canCreateLabService: true,
    canDeleteSpecies: false,
    canViewAllAchievements: true,
    canManageOwnAchievements: true,
    canManageOwnProfile: true,
    canExportData: true,
    canImportData: true,
  },
  Researcher: {
    canManageUsers: false,
    canManageRoles: false,
    canManageSystemSettings: false,
    canDeleteAnyData: false,
    canAccessInventory: true,
    canAccessBusiness: false,
    canAccessResearch: true,
    canInputInventory: true,
    canUpdateChemicalQuantity: true,
    canCreateLabService: false,
    canDeleteSpecies: false,
    canViewAllAchievements: true,
    canManageOwnAchievements: true,
    canManageOwnProfile: true,
    canExportData: true,
    canImportData: false,
  },
  "Lab Assistant": {
    canManageUsers: false,
    canManageRoles: false,
    canManageSystemSettings: false,
    canDeleteAnyData: false,
    canAccessInventory: true,
    canAccessBusiness: false,
    canAccessResearch: false,
    canInputInventory: true,
    canUpdateChemicalQuantity: true,
    canCreateLabService: true,
    canDeleteSpecies: false,
    canViewAllAchievements: false,
    canManageOwnAchievements: true,
    canManageOwnProfile: true,
    canExportData: false,
    canImportData: false,
  },
  Intern: {
    canManageUsers: false,
    canManageRoles: false,
    canManageSystemSettings: false,
    canDeleteAnyData: false,
    canAccessInventory: true,
    canAccessBusiness: false,
    canAccessResearch: true,
    canInputInventory: false,
    canUpdateChemicalQuantity: false,
    canCreateLabService: false,
    canDeleteSpecies: false,
    canViewAllAchievements: false,
    canManageOwnAchievements: true,
    canManageOwnProfile: true,
    canExportData: false,
    canImportData: false,
  },
  Guest: {
    canManageUsers: false,
    canManageRoles: false,
    canManageSystemSettings: false,
    canDeleteAnyData: false,
    canAccessInventory: true,
    canAccessBusiness: false,
    canAccessResearch: false,
    canInputInventory: false,
    canUpdateChemicalQuantity: false,
    canCreateLabService: false,
    canDeleteSpecies: false,
    canViewAllAchievements: false,
    canManageOwnAchievements: false,
    canManageOwnProfile: true,
    canExportData: false,
    canImportData: false,
  },
};

// ─── User Profile ───────────────────────────────────────────────────────────
export interface UserProfile extends Auditable {
  id: string;
  userCode: string;
  name: string;
  email: string;
  role: DisplayUserRole;
  department: string;
  status: "Active" | "Inactive";
  profileImageUrl?: string;
  phone?: string;
  bio?: string;
  lastActive?: string;
}

// ─── Research Achievement ──────────────────────────────────────────────────
export interface ResearchAchievement extends Auditable {
  id: string;
  achievementCode: string;
  userId: string;
  userName?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  documentLink?: string;
  achievementDate: string;
  status: AchievementStatus;
}
