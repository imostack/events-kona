"use client";

import { useRouter } from "next/navigation";
import { LogOut, Bell, Menu } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";

interface AdminNavbarProps {
  onMenuClick: () => void;
}

export function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 right-0 lg:left-64 left-0 h-16 bg-white border-b border-gray-200 z-[46] shadow-sm w-auto max-w-full">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 w-full max-w-full">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1 lg:block hidden">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {admin?.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-700 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 hidden sm:inline whitespace-nowrap">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
