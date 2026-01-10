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

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, hasPermission, logout } = useAdminAuth();

  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission, "read");
  });

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dlcl5rqnh/image/upload/v1767946902/EK_300x_kystpx.webp"
              alt="EventsKona Logo"
              className="h-10 w-auto"
            />
           
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
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? '' : 'group-hover:text-purple-600'}`} />
                <span className="font-medium flex-1">{item.name}</span>
                {item.badge && !isActive && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        {admin && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-100 transition-colors group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {admin.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {admin.role.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={logout}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-500 hover:text-red-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
