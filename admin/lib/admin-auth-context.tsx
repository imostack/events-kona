"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminUser, AdminRole } from "@/types/admin";
import { auditLogger } from "./audit-logger";

interface AdminAuthContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

// Mock admin users for development
const MOCK_ADMINS: Record<string, { password: string; user: AdminUser }> = {
  "admin@appguts.com": {
    password: "admin123",
    user: {
      id: "1",
      email: "admin@appguts.com",
      name: "Super Admin",
      role: "super_admin",
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
      permissions: [
        { resource: "users", actions: ["create", "read", "update", "delete"] },
        { resource: "events", actions: ["create", "read", "update", "delete"] },
        { resource: "admins", actions: ["create", "read", "update", "delete"] },
        { resource: "settings", actions: ["create", "read", "update", "delete"] },
        { resource: "analytics", actions: ["read"] },
        { resource: "audit_logs", actions: ["read"] },
      ],
    },
  },
  "moderator@appguts.com": {
    password: "mod123",
    user: {
      id: "2",
      email: "moderator@appguts.com",
      name: "Moderator User",
      role: "moderator",
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
      permissions: [
        { resource: "users", actions: ["read", "update"] },
        { resource: "events", actions: ["read", "update"] },
      ],
    },
  },
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin_user");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockAdmin = MOCK_ADMINS[email];

    if (mockAdmin && mockAdmin.password === password) {
      const adminUser = {
        ...mockAdmin.user,
        lastLogin: new Date().toISOString(),
      };
      setAdmin(adminUser);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));

      // Log the login action
      auditLogger.log(
        adminUser.id,
        adminUser.name,
        "admin_login",
        "authentication",
        undefined,
        { email }
      );

      return true;
    }

    return false;
  };

  const logout = () => {
    if (admin) {
      // Log the logout action
      auditLogger.log(
        admin.id,
        admin.name,
        "admin_logout",
        "authentication"
      );
    }
    setAdmin(null);
    localStorage.removeItem("admin_user");
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!admin) return false;

    const permission = admin.permissions.find((p) => p.resource === resource);
    return permission?.actions.includes(action as any) || false;
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, login, logout, isLoading, hasPermission }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
