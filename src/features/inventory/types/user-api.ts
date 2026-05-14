// ═══════════════════════════════════════════════════════════════════════════
// User — API types
// ═══════════════════════════════════════════════════════════════════════════

import type { UserRole } from '@/shared/types/enums';

export interface LabUserApi {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string | null;
  role: UserRole;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  phone?: string | null;
  role?: UserRole;
}
