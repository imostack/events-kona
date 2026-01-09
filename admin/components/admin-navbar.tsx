"use client";

import { useRouter } from "next/navigation";
import { LogOut, Bell } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";

export function AdminNavbar() {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 z-10 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {admin?.name}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-900">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
