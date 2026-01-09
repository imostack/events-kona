"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminNavbar } from "@/components/admin-navbar";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { admin, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/login");
    }
  }, [admin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-64 pt-16">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
