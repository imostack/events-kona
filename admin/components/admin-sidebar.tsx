"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Shield,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: null },
  { name: "Users", href: "/users", icon: Users, permission: "users", badge: "5" },
  { name: "Events", href: "/events", icon: Calendar, permission: "events", badge: "12" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, permission: "analytics" },
  { name: "Audit Logs", href: "/audit-logs", icon: FileText, permission: "audit_logs" },
  { name: "Admins", href: "/admins", icon: Shield, permission: "admins" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { admin, hasPermission, logout } = useAdminAuth();

  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission, "read");
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border shadow-xl z-50">
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EventsKona</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? '' : 'group-hover:text-primary'}`} />
                <span className="font-medium flex-1">{item.name}</span>
                {item.badge && !isActive && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        {admin && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-accent transition-colors group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-base">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {admin.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {admin.role.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={logout}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
