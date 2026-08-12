/**
 * RFC Store — User & Authentication Domain Types
 */

// ── Roles ─────────────────────────────────────────────────

export type UserRole = "customer" | "admin" | "super_admin";

// ── Core Entities ─────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // e.g. "Home", "Work"
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

// ── Auth Context ──────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

// ── Guards ────────────────────────────────────────────────

export function isAdmin(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}
