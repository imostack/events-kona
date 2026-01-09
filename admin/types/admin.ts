export type AdminRole = "super_admin" | "admin" | "moderator" | "support";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  permissions: AdminPermission[];
}

export interface AdminPermission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete")[];
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress: string;
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    { resource: "users", actions: ["create", "read", "update", "delete"] },
    { resource: "events", actions: ["create", "read", "update", "delete"] },
    { resource: "admins", actions: ["create", "read", "update", "delete"] },
    { resource: "settings", actions: ["create", "read", "update", "delete"] },
    { resource: "analytics", actions: ["read"] },
    { resource: "audit_logs", actions: ["read"] },
  ],
  admin: [
    { resource: "users", actions: ["read", "update"] },
    { resource: "events", actions: ["read", "update", "delete"] },
    { resource: "analytics", actions: ["read"] },
    { resource: "audit_logs", actions: ["read"] },
  ],
  moderator: [
    { resource: "users", actions: ["read", "update"] },
    { resource: "events", actions: ["read", "update"] },
  ],
  support: [
    { resource: "users", actions: ["read"] },
    { resource: "events", actions: ["read"] },
  ],
};
